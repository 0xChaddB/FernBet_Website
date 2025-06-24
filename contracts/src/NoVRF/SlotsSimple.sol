// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {CasinoChip} from "./CasinoChip.sol";

contract SlotsSimple is ReentrancyGuard {
    CasinoChip public immutable chip;
    
    struct Spin {
        uint88 amount;
        uint8 lines; // Number of paylines
        bool isActive;
        bool isResolved;
        uint8[3][3] reels; // 3x3 grid
        uint88 payout;
    }
    
    mapping(address => Spin) public activeSpins;
    
    uint88 public constant MINIMUM_BET = 1e16;
    uint88 public constant MAXIMUM_BET = 10e18;
    uint8 public constant MAX_LINES = 5;
    
    // Events
    event Slots__SpinStarted(address indexed player, uint88 amount, uint8 lines);
    event Slots__ReelsSpun(address indexed player, uint8[3][3] reels, uint88 payout);
    event Slots__WinningsClaimed(address indexed player, uint88 payout);
    
    constructor(address _chip) {
        chip = CasinoChip(_chip);
    }
    
    function spin(uint88 _betAmount, uint8 _lines) external nonReentrant {
        require(_betAmount >= MINIMUM_BET && _betAmount <= MAXIMUM_BET, "Invalid bet amount");
        require(!activeSpins[msg.sender].isActive, "Spin already active");
        require(_lines >= 1 && _lines <= MAX_LINES, "Invalid number of lines");
        
        // Calculate total bet (bet per line * number of lines)
        uint88 totalBet = _betAmount * _lines;
        require(totalBet <= MAXIMUM_BET, "Total bet exceeds maximum");
        
        // Transfer CHIP from player
        bool success = chip.transferFrom(msg.sender, address(this), totalBet);
        require(success, "Token transfer failed");
        
        // Generate reel results immediately
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, block.number)));
        
        uint8[3][3] memory reels;
        for (uint i = 0; i < 3; i++) {
            for (uint j = 0; j < 3; j++) {
                // Generate symbol (0-6): 7 different symbols
                randomSeed = uint256(keccak256(abi.encodePacked(randomSeed)));
                reels[i][j] = uint8(randomSeed % 7);
            }
        }
        
        // Calculate payout
        uint88 payout = calculatePayout(reels, _betAmount, _lines);
        
        // Store spin result
        activeSpins[msg.sender] = Spin({
            amount: _betAmount,
            lines: _lines,
            isActive: true,
            isResolved: true,
            reels: reels,
            payout: payout
        });
        
        emit Slots__SpinStarted(msg.sender, _betAmount, _lines);
        emit Slots__ReelsSpun(msg.sender, reels, payout);
    }
    
    function claimWinnings() external nonReentrant {
        Spin storage spinData = activeSpins[msg.sender];
        require(spinData.isActive, "No active spin");
        require(spinData.isResolved, "Spin not resolved");
        
        uint88 payout = spinData.payout;
        
        // Clear spin
        delete activeSpins[msg.sender];
        
        // Pay winnings if any
        if (payout > 0) {
            bool success = chip.transfer(msg.sender, payout);
            require(success, "Payout failed");
        }
        
        emit Slots__WinningsClaimed(msg.sender, payout);
    }
    
    function calculatePayout(uint8[3][3] memory reels, uint88 betPerLine, uint8 lines) public pure returns (uint88) {
        uint256 totalPayout = 0;
        
        // Check each active payline
        for (uint8 line = 0; line < lines; line++) {
            uint256 linePayout = 0;
            
            if (line == 0) { // Middle row
                linePayout = checkLine(reels[0][1], reels[1][1], reels[2][1], betPerLine);
            } else if (line == 1) { // Top row
                linePayout = checkLine(reels[0][0], reels[1][0], reels[2][0], betPerLine);
            } else if (line == 2) { // Bottom row
                linePayout = checkLine(reels[0][2], reels[1][2], reels[2][2], betPerLine);
            } else if (line == 3) { // Diagonal top-left to bottom-right
                linePayout = checkLine(reels[0][0], reels[1][1], reels[2][2], betPerLine);
            } else if (line == 4) { // Diagonal bottom-left to top-right
                linePayout = checkLine(reels[0][2], reels[1][1], reels[2][0], betPerLine);
            }
            
            totalPayout += linePayout;
        }
        
        require(totalPayout <= type(uint88).max, "Payout overflow");
        return uint88(totalPayout);
    }
    
    function checkLine(uint8 symbol1, uint8 symbol2, uint8 symbol3, uint88 betAmount) private pure returns (uint256) {
        // Three of a kind
        if (symbol1 == symbol2 && symbol2 == symbol3) {
            // Payout based on symbol value (higher symbols pay more)
            if (symbol1 == 6) { // Jackpot symbol
                return uint256(betAmount) * 100;
            } else if (symbol1 == 5) {
                return uint256(betAmount) * 50;
            } else if (symbol1 == 4) {
                return uint256(betAmount) * 25;
            } else if (symbol1 == 3) {
                return uint256(betAmount) * 15;
            } else if (symbol1 == 2) {
                return uint256(betAmount) * 10;
            } else if (symbol1 == 1) {
                return uint256(betAmount) * 5;
            } else { // symbol1 == 0
                return uint256(betAmount) * 3;
            }
        }
        // Two of a kind (any two matching)
        else if (symbol1 == symbol2 || symbol2 == symbol3 || symbol1 == symbol3) {
            return uint256(betAmount) * 2;
        }
        
        return 0;
    }
    
    // View functions
    function hasActiveSpin(address player) external view returns (bool) {
        return activeSpins[player].isActive;
    }
    
    function getActiveSpin(address player) external view returns (
        uint88 betAmount,
        uint8 lines,
        bool isResolved,
        uint8[3][3] memory reels,
        uint88 payout
    ) {
        Spin memory spinData = activeSpins[player];
        return (
            spinData.amount,
            spinData.lines,
            spinData.isResolved,
            spinData.reels,
            spinData.payout
        );
    }
    
    function getSymbolName(uint8 symbol) public pure returns (string memory) {
        if (symbol == 0) return "Cherry";
        if (symbol == 1) return "Lemon";
        if (symbol == 2) return "Orange";
        if (symbol == 3) return "Plum";
        if (symbol == 4) return "Bell";
        if (symbol == 5) return "Bar";
        if (symbol == 6) return "Seven";
        return "Unknown";
    }
}