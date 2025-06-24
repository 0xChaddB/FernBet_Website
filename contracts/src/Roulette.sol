// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {CasinoChip} from "./CasinoChip.sol";

contract Roulette is VRFConsumerBaseV2Plus, ReentrancyGuard {
    
    enum BetType {
        Single,      // 0: Single number (0-36)
        Red,         // 1: Red numbers
        Black,       // 2: Black numbers
        Even,        // 3: Even numbers
        Odd,         // 4: Odd numbers
        Low,         // 5: Low numbers (1-18)
        High,        // 6: High numbers (19-36)
        Dozen1,      // 7: First dozen (1-12)
        Dozen2,      // 8: Second dozen (13-24)
        Dozen3,      // 9: Third dozen (25-36)
        Column1,     // 10: First column
        Column2,     // 11: Second column
        Column3      // 12: Third column
    }

    struct Bet {
        address player;
        uint88 amount;
        BetType betType;
        uint8 betValue; // For single number bets
        uint256 requestId;
    }

    struct SpinResult {
        uint8 winningNumber;
        bool isResolved;
    }

    mapping(address => Bet) public activeBets;
    mapping(uint256 => address) public requestIdToPlayer;
    mapping(uint256 => SpinResult) public spinResults;

    uint88 public constant MINIMUM_BET = 1e16;
    uint88 public constant MAXIMUM_BET = 10e18;

    bytes32 public immutable KEY_HASH;
    uint256 public immutable SUBSCRIPTION_ID;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant CALLBACK_GAS_LIMIT = 500000;

    CasinoChip public immutable chip;

    // Red numbers in roulette
    uint8[18] public redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

    event BetPlaced(address indexed player, BetType betType, uint8 betValue, uint88 amount);
    event SpinRequested(address indexed player, uint256 requestId);
    event SpinCompleted(address indexed player, uint8 winningNumber, uint88 payout);

    constructor(address _vrfCoordinator, bytes32 _keyHash, address _chip, uint256 _subId) payable 
        VRFConsumerBaseV2Plus(_vrfCoordinator) {
        KEY_HASH = _keyHash;
        chip = CasinoChip(_chip);
        SUBSCRIPTION_ID = _subId;
    }

    function placeBet(BetType _betType, uint8 _betValue, uint88 _amount) external nonReentrant {
        require(_amount >= MINIMUM_BET && _amount <= MAXIMUM_BET, "Invalid bet amount");
        require(activeBets[msg.sender].player == address(0), "Already have active bet");
        
        // Validate bet based on type
        if (_betType == BetType.Single) {
            require(_betValue <= 36, "Invalid number for single bet");
        } else {
            require(_betValue == 0, "Bet value should be 0 for non-single bets");
        }

        // Transfer chips from player
        bool success = chip.transferFrom(msg.sender, address(this), _amount);
        require(success, "Chip transfer failed");

        // Request random number
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: KEY_HASH,
                subId: SUBSCRIPTION_ID,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        activeBets[msg.sender] = Bet({
            player: msg.sender,
            amount: _amount,
            betType: _betType,
            betValue: _betValue,
            requestId: requestId
        });

        requestIdToPlayer[requestId] = msg.sender;

        emit BetPlaced(msg.sender, _betType, _betValue, _amount);
        emit SpinRequested(msg.sender, requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        address player = requestIdToPlayer[requestId];
        uint8 winningNumber = uint8(randomWords[0] % 37); // 0-36
        
        spinResults[requestId] = SpinResult({
            winningNumber: winningNumber,
            isResolved: true
        });
    }

    function claimWinnings() external nonReentrant {
        Bet storage bet = activeBets[msg.sender];
        require(bet.player == msg.sender, "No active bet");
        
        SpinResult storage result = spinResults[bet.requestId];
        require(result.isResolved, "Spin not completed");

        uint8 winningNumber = result.winningNumber;
        uint88 payout = calculatePayout(bet.betType, bet.betValue, bet.amount, winningNumber);

        // Clean up
        delete activeBets[msg.sender];
        delete requestIdToPlayer[bet.requestId];
        delete spinResults[bet.requestId];

        // Transfer payout
        if (payout > 0) {
            bool success = chip.transfer(msg.sender, payout);
            require(success, "Payout transfer failed");
        }

        emit SpinCompleted(msg.sender, winningNumber, payout);
    }

    function calculatePayout(BetType betType, uint8 betValue, uint88 betAmount, uint8 winningNumber) 
        public view returns (uint88) {
        
        if (winningNumber == 0) {
            // Only single number bet on 0 wins
            if (betType == BetType.Single && betValue == 0) {
                return betAmount * 36; // 35:1 payout + original bet
            }
            return 0;
        }

        if (betType == BetType.Single) {
            return betValue == winningNumber ? betAmount * 36 : 0;
        }
        
        if (betType == BetType.Red) {
            return isRed(winningNumber) ? betAmount * 2 : 0;
        }
        
        if (betType == BetType.Black) {
            return !isRed(winningNumber) ? betAmount * 2 : 0;
        }
        
        if (betType == BetType.Even) {
            return winningNumber % 2 == 0 ? betAmount * 2 : 0;
        }
        
        if (betType == BetType.Odd) {
            return winningNumber % 2 == 1 ? betAmount * 2 : 0;
        }
        
        if (betType == BetType.Low) {
            return winningNumber >= 1 && winningNumber <= 18 ? betAmount * 2 : 0;
        }
        
        if (betType == BetType.High) {
            return winningNumber >= 19 && winningNumber <= 36 ? betAmount * 2 : 0;
        }
        
        if (betType == BetType.Dozen1) {
            return winningNumber >= 1 && winningNumber <= 12 ? betAmount * 3 : 0;
        }
        
        if (betType == BetType.Dozen2) {
            return winningNumber >= 13 && winningNumber <= 24 ? betAmount * 3 : 0;
        }
        
        if (betType == BetType.Dozen3) {
            return winningNumber >= 25 && winningNumber <= 36 ? betAmount * 3 : 0;
        }
        
        if (betType == BetType.Column1) {
            return winningNumber % 3 == 1 ? betAmount * 3 : 0;
        }
        
        if (betType == BetType.Column2) {
            return winningNumber % 3 == 2 ? betAmount * 3 : 0;
        }
        
        if (betType == BetType.Column3) {
            return winningNumber % 3 == 0 && winningNumber != 0 ? betAmount * 3 : 0;
        }
        
        return 0;
    }

    function isRed(uint8 number) public view returns (bool) {
        for (uint8 i = 0; i < redNumbers.length; i++) {
            if (redNumbers[i] == number) {
                return true;
            }
        }
        return false;
    }

    function getActiveBet(address player) external view returns (
        uint88 amount,
        BetType betType,
        uint8 betValue,
        uint256 requestId
    ) {
        Bet storage bet = activeBets[player];
        return (bet.amount, bet.betType, bet.betValue, bet.requestId);
    }

    function getSpinResult(uint256 requestId) external view returns (uint8 winningNumber, bool isResolved) {
        SpinResult storage result = spinResults[requestId];
        return (result.winningNumber, result.isResolved);
    }

    function hasActiveBet(address player) external view returns (bool) {
        return activeBets[player].player == player;
    }
}