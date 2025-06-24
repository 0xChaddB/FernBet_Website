// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {CasinoChip} from "./CasinoChip.sol";

contract RouletteSimple is ReentrancyGuard {
    CasinoChip public immutable chip;
    
    struct Bet {
        uint88 amount;
        uint8 betType; // 0=number, 1=red, 2=black, 3=even, 4=odd
        uint8 number; // For single number bets
        bool isActive;
        bool isResolved;
        uint8 winningNumber;
        uint88 payout;
    }
    
    mapping(address => Bet) public activeBets;
    
    uint88 public constant MINIMUM_BET = 1e16;
    uint88 public constant MAXIMUM_BET = 10e18;
    
    // Events
    event Roulette__BetPlaced(address indexed player, uint88 amount, uint8 betType, uint8 number);
    event Roulette__SpinResult(address indexed player, uint8 winningNumber, bool won, uint88 payout);
    event Roulette__WinningsClaimed(address indexed player, uint88 payout);
    
    constructor(address _chip) {
        chip = CasinoChip(_chip);
    }
    
    function placeBet(uint8 _betType, uint8 _number, uint88 _betAmount) external nonReentrant {
        require(_betAmount >= MINIMUM_BET && _betAmount <= MAXIMUM_BET, "Invalid bet amount");
        require(!activeBets[msg.sender].isActive, "Bet already active");
        require(_betType <= 4, "Invalid bet type");
        
        if (_betType == 0) { // Single number bet
            require(_number <= 36, "Invalid number");
        }
        
        // Transfer CHIP from player
        bool success = chip.transferFrom(msg.sender, address(this), _betAmount);
        require(success, "Token transfer failed");
        
        // Generate spin result immediately
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, block.number)));
        uint8 winningNumber = uint8(randomSeed % 37); // 0-36
        
        // Check win condition
        bool won = checkWin(_betType, _number, winningNumber);
        
        // Calculate payout
        uint88 payout = 0;
        if (won) {
            payout = calculatePayout(_betType, _betAmount);
        }
        
        // Store bet result
        activeBets[msg.sender] = Bet({
            amount: _betAmount,
            betType: _betType,
            number: _number,
            isActive: true,
            isResolved: true,
            winningNumber: winningNumber,
            payout: payout
        });
        
        emit Roulette__BetPlaced(msg.sender, _betAmount, _betType, _number);
        emit Roulette__SpinResult(msg.sender, winningNumber, won, payout);
    }
    
    function claimWinnings() external nonReentrant {
        Bet storage bet = activeBets[msg.sender];
        require(bet.isActive, "No active bet");
        require(bet.isResolved, "Bet not resolved");
        
        uint88 payout = bet.payout;
        
        // Clear bet
        delete activeBets[msg.sender];
        
        // Pay winnings if any
        if (payout > 0) {
            bool success = chip.transfer(msg.sender, payout);
            require(success, "Payout failed");
        }
        
        emit Roulette__WinningsClaimed(msg.sender, payout);
    }
    
    function calculatePayout(uint8 betType, uint88 betAmount) public pure returns (uint88) {
        uint256 payout;
        
        if (betType == 0) { // Single number: 35:1
            payout = uint256(betAmount) * 36;
        } else if (betType == 1 || betType == 2) { // Red/Black: 1:1
            payout = uint256(betAmount) * 2;
        } else if (betType == 3 || betType == 4) { // Even/Odd: 1:1
            payout = uint256(betAmount) * 2;
        }
        
        require(payout <= type(uint88).max, "Payout overflow");
        return uint88(payout);
    }
    
    function checkWin(uint8 betType, uint8 betNumber, uint8 winningNumber) public pure returns (bool) {
        if (winningNumber == 0) { // Green 0, only single number bet on 0 wins
            return betType == 0 && betNumber == 0;
        }
        
        if (betType == 0) { // Single number
            return winningNumber == betNumber;
        } else if (betType == 1) { // Red
            return isRed(winningNumber);
        } else if (betType == 2) { // Black
            return !isRed(winningNumber);
        } else if (betType == 3) { // Even
            return winningNumber % 2 == 0;
        } else if (betType == 4) { // Odd
            return winningNumber % 2 == 1;
        }
        
        return false;
    }
    
    function isRed(uint8 number) public pure returns (bool) {
        // Red numbers on a roulette wheel
        if (number == 1 || number == 3 || number == 5 || number == 7 || number == 9 || 
            number == 12 || number == 14 || number == 16 || number == 18 ||
            number == 19 || number == 21 || number == 23 || number == 25 || 
            number == 27 || number == 30 || number == 32 || number == 34 || number == 36) {
            return true;
        }
        return false;
    }
    
    // View functions
    function hasActiveBet(address player) external view returns (bool) {
        return activeBets[player].isActive;
    }
    
    function getActiveBet(address player) external view returns (
        uint88 betAmount,
        uint8 betType,
        uint8 betNumber,
        bool isResolved,
        uint8 winningNumber,
        uint88 payout
    ) {
        Bet memory bet = activeBets[player];
        return (
            bet.amount,
            bet.betType,
            bet.number,
            bet.isResolved,
            bet.winningNumber,
            bet.payout
        );
    }
}