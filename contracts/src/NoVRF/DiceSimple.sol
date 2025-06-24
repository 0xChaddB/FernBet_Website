// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {CasinoChip} from "./CasinoChip.sol";

contract DiceSimple is ReentrancyGuard {
    CasinoChip public immutable chip;
    
    struct Bet {
        uint88 amount;
        uint8 betType; // 0 = over, 1 = under
        uint8 target;
        bool isActive;
        bool isResolved;
        uint8 rolledNumber;
        uint88 payout;
    }
    
    mapping(address => Bet) public activeBets;
    
    uint88 public constant MINIMUM_BET = 1e16;
    uint88 public constant MAXIMUM_BET = 10e18;
    
    // Events
    event Dice__BetPlaced(address indexed player, uint88 amount, uint8 betType, uint8 target);
    event Dice__DiceRolled(address indexed player, uint8 rolledNumber, bool won, uint88 payout);
    event Dice__WinningsClaimed(address indexed player, uint88 payout);
    
    constructor(address _chip) {
        chip = CasinoChip(_chip);
    }
    
    function placeBet(uint8 _betType, uint8 _target, uint88 _betAmount) external nonReentrant {
        require(_betAmount >= MINIMUM_BET && _betAmount <= MAXIMUM_BET, "Invalid bet amount");
        require(!activeBets[msg.sender].isActive, "Bet already active");
        require(_betType <= 1, "Invalid bet type");
        require(_target >= 2 && _target <= 98, "Target must be between 2 and 98");
        
        // Transfer CHIP from player
        bool success = chip.transferFrom(msg.sender, address(this), _betAmount);
        require(success, "Token transfer failed");
        
        // Generate roll result immediately
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, block.number)));
        uint8 rolledNumber = uint8(randomSeed % 100) + 1; // 1-100
        
        // Check win condition
        bool won = false;
        if (_betType == 0) { // Over
            won = rolledNumber > _target;
        } else { // Under
            won = rolledNumber < _target;
        }
        
        // Calculate payout
        uint88 payout = 0;
        if (won) {
            payout = calculatePayout(_betType, _target, _betAmount);
        }
        
        // Store bet result
        activeBets[msg.sender] = Bet({
            amount: _betAmount,
            betType: _betType,
            target: _target,
            isActive: true,
            isResolved: true,
            rolledNumber: rolledNumber,
            payout: payout
        });
        
        emit Dice__BetPlaced(msg.sender, _betAmount, _betType, _target);
        emit Dice__DiceRolled(msg.sender, rolledNumber, won, payout);
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
        
        emit Dice__WinningsClaimed(msg.sender, payout);
    }
    
    function calculatePayout(uint8 betType, uint8 target, uint88 betAmount) public pure returns (uint88) {
        uint256 winChance;
        
        if (betType == 0) { // Over
            winChance = 100 - target;
        } else { // Under
            winChance = target - 1;
        }
        
        require(winChance > 0 && winChance < 99, "Invalid win chance");
        
        // Payout = (99 / winChance) * betAmount
        // 1% house edge
        uint256 payout = (99 * uint256(betAmount)) / winChance;
        
        require(payout <= type(uint88).max, "Payout overflow");
        return uint88(payout);
    }
    
    function getProbability(uint8 betType, uint8 target) public pure returns (uint8 numerator, uint8 denominator) {
        if (betType == 0) { // Over
            numerator = 100 - target;
        } else { // Under
            numerator = target - 1;
        }
        denominator = 100;
    }
    
    // View functions
    function hasActiveBet(address player) external view returns (bool) {
        return activeBets[player].isActive;
    }
    
    function getActiveBet(address player) external view returns (
        uint88 betAmount,
        uint8 betType,
        uint8 targetNumber,
        uint256 requestId, // Always 0 for compatibility
        bool isResolved,
        uint8 rolledNumber,
        uint88 payout
    ) {
        Bet memory bet = activeBets[player];
        return (
            bet.amount,
            bet.betType,
            bet.target,
            0, // No VRF request ID
            bet.isResolved,
            bet.rolledNumber,
            bet.payout
        );
    }
    
    function checkWin(uint8 betType, uint8 target, uint8 rolledNumber) public pure returns (bool) {
        if (betType == 0) { // Over
            return rolledNumber > target;
        } else { // Under
            return rolledNumber < target;
        }
    }
}