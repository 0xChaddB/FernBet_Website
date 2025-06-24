// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {CasinoChip} from "./CasinoChip.sol";

contract Slots is VRFConsumerBaseV2Plus, ReentrancyGuard {
    
    // Slot symbols (0-9)
    enum Symbol {
        Cherry,    // 0
        Lemon,     // 1
        Orange,    // 2
        Plum,      // 3
        Bell,      // 4
        Bar,       // 5
        Grape,     // 6
        Watermelon,// 7
        Seven,     // 8
        Diamond    // 9 - Jackpot symbol
    }

    struct Spin {
        address player;
        uint88 betAmount;
        uint8[3] reels;
        uint256 requestId;
        bool isResolved;
        uint88 payout;
    }

    mapping(address => Spin) public activeSpins;
    mapping(uint256 => address) public requestIdToPlayer;

    uint88 public constant MINIMUM_BET = 1e16;
    uint88 public constant MAXIMUM_BET = 5e18;

    bytes32 public immutable KEY_HASH;
    uint256 public immutable SUBSCRIPTION_ID;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant CALLBACK_GAS_LIMIT = 500000;

    CasinoChip public immutable chip;

    // Payout multipliers for different combinations
    uint8 public constant JACKPOT_MULTIPLIER = 100;    // 3 Diamonds
    uint8 public constant THREE_SEVENS_MULTIPLIER = 50; // 3 Sevens
    uint8 public constant THREE_BARS_MULTIPLIER = 25;   // 3 Bars
    uint8 public constant THREE_BELLS_MULTIPLIER = 15;  // 3 Bells
    uint8 public constant THREE_FRUIT_MULTIPLIER = 10;  // 3 of any fruit
    uint8 public constant TWO_DIAMONDS_MULTIPLIER = 5;  // 2 Diamonds
    uint8 public constant TWO_SEVENS_MULTIPLIER = 3;    // 2 Sevens

    event SpinStarted(address indexed player, uint88 betAmount, uint256 requestId);
    event SpinCompleted(address indexed player, uint8[3] reels, uint88 payout);

    constructor(address _vrfCoordinator, bytes32 _keyHash, address _chip, uint256 _subId) payable 
        VRFConsumerBaseV2Plus(_vrfCoordinator) {
        KEY_HASH = _keyHash;
        chip = CasinoChip(_chip);
        SUBSCRIPTION_ID = _subId;
    }

    function spin(uint88 betAmount) external nonReentrant {
        require(betAmount >= MINIMUM_BET && betAmount <= MAXIMUM_BET, "Invalid bet amount");
        require(activeSpins[msg.sender].player == address(0), "Already have active spin");

        // Transfer chips from player
        bool success = chip.transferFrom(msg.sender, address(this), betAmount);
        require(success, "Chip transfer failed");

        // Request random numbers for 3 reels
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: KEY_HASH,
                subId: SUBSCRIPTION_ID,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: 3,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        activeSpins[msg.sender] = Spin({
            player: msg.sender,
            betAmount: betAmount,
            reels: [0, 0, 0],
            requestId: requestId,
            isResolved: false,
            payout: 0
        });

        requestIdToPlayer[requestId] = msg.sender;

        emit SpinStarted(msg.sender, betAmount, requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        address player = requestIdToPlayer[requestId];
        Spin storage playerSpin = activeSpins[player];

        // Generate reel results (0-9 for 10 symbols)
        playerSpin.reels[0] = uint8(randomWords[0] % 10);
        playerSpin.reels[1] = uint8(randomWords[1] % 10);
        playerSpin.reels[2] = uint8(randomWords[2] % 10);

        // Calculate payout
        playerSpin.payout = calculatePayout(playerSpin.reels, playerSpin.betAmount);
        playerSpin.isResolved = true;
    }

    function claimWinnings() external nonReentrant {
        Spin storage playerSpin = activeSpins[msg.sender];
        require(playerSpin.player == msg.sender, "No active spin");
        require(playerSpin.isResolved, "Spin not completed");

        uint88 payout = playerSpin.payout;
        uint8[3] memory reels = playerSpin.reels;

        // Clean up
        delete activeSpins[msg.sender];
        delete requestIdToPlayer[playerSpin.requestId];

        // Transfer payout
        if (payout > 0) {
            bool success = chip.transfer(msg.sender, payout);
            require(success, "Payout transfer failed");
        }

        emit SpinCompleted(msg.sender, reels, payout);
    }

    function calculatePayout(uint8[3] memory reels, uint88 betAmount) public pure returns (uint88) {
        uint8 reel1 = reels[0];
        uint8 reel2 = reels[1];
        uint8 reel3 = reels[2];

        // Count diamonds and sevens
        uint8 diamondCount = 0;
        uint8 sevenCount = 0;
        
        if (reel1 == uint8(Symbol.Diamond)) diamondCount++;
        if (reel2 == uint8(Symbol.Diamond)) diamondCount++;
        if (reel3 == uint8(Symbol.Diamond)) diamondCount++;
        
        if (reel1 == uint8(Symbol.Seven)) sevenCount++;
        if (reel2 == uint8(Symbol.Seven)) sevenCount++;
        if (reel3 == uint8(Symbol.Seven)) sevenCount++;

        // Check for jackpot (3 diamonds)
        if (diamondCount == 3) {
            return betAmount * JACKPOT_MULTIPLIER;
        }

        // Check for three sevens
        if (sevenCount == 3) {
            return betAmount * THREE_SEVENS_MULTIPLIER;
        }

        // Check for three bars
        if (reel1 == uint8(Symbol.Bar) && reel2 == uint8(Symbol.Bar) && reel3 == uint8(Symbol.Bar)) {
            return betAmount * THREE_BARS_MULTIPLIER;
        }

        // Check for three bells
        if (reel1 == uint8(Symbol.Bell) && reel2 == uint8(Symbol.Bell) && reel3 == uint8(Symbol.Bell)) {
            return betAmount * THREE_BELLS_MULTIPLIER;
        }

        // Check for three of any fruit (Cherry, Lemon, Orange, Plum, Grape, Watermelon)
        if (reel1 == reel2 && reel2 == reel3 && isFruit(reel1)) {
            return betAmount * THREE_FRUIT_MULTIPLIER;
        }

        // Check for two diamonds
        if (diamondCount == 2) {
            return betAmount * TWO_DIAMONDS_MULTIPLIER;
        }

        // Check for two sevens
        if (sevenCount == 2) {
            return betAmount * TWO_SEVENS_MULTIPLIER;
        }

        // No winning combination
        return 0;
    }

    function isFruit(uint8 symbol) public pure returns (bool) {
        return symbol >= uint8(Symbol.Cherry) && symbol <= uint8(Symbol.Watermelon);
    }

    function getActiveSpin(address player) external view returns (
        uint88 betAmount,
        uint8[3] memory reels,
        uint256 requestId,
        bool isResolved,
        uint88 payout
    ) {
        Spin storage playerSpin = activeSpins[player];
        return (
            playerSpin.betAmount,
            playerSpin.reels,
            playerSpin.requestId,
            playerSpin.isResolved,
            playerSpin.payout
        );
    }

    function hasActiveSpin(address player) external view returns (bool) {
        return activeSpins[player].player == player;
    }

    function getSymbolName(uint8 symbol) external pure returns (string memory) {
        if (symbol == uint8(Symbol.Cherry)) return "Cherry";
        if (symbol == uint8(Symbol.Lemon)) return "Lemon";
        if (symbol == uint8(Symbol.Orange)) return "Orange";
        if (symbol == uint8(Symbol.Plum)) return "Plum";
        if (symbol == uint8(Symbol.Bell)) return "Bell";
        if (symbol == uint8(Symbol.Bar)) return "Bar";
        if (symbol == uint8(Symbol.Grape)) return "Grape";
        if (symbol == uint8(Symbol.Watermelon)) return "Watermelon";
        if (symbol == uint8(Symbol.Seven)) return "Seven";
        if (symbol == uint8(Symbol.Diamond)) return "Diamond";
        return "Unknown";
    }
}