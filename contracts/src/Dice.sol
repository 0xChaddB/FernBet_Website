// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CasinoChip.sol";

contract Dice is ReentrancyGuard, Ownable {
    CasinoChip public immutable chipToken;
    
    struct Bet {
        address player;
        uint256 amount;
        uint8 betType; // 0 = over, 1 = under
        uint8 target;
        bool isActive;
        uint256 seed;
    }
    
    mapping(address => Bet) public bets;
    uint256 private nonce;
    
    event BetPlaced(address indexed player, uint256 amount, uint8 betType, uint8 target);
    event DiceRolled(address indexed player, uint8 result, bool won, uint256 payout);
    
    constructor(address _chipToken) Ownable(msg.sender) {
        chipToken = CasinoChip(_chipToken);
    }
    
    function placeBet(uint8 _betType, uint8 _target, uint256 _amount) external nonReentrant {
        require(_amount > 0, "Bet must be greater than 0");
        require(!bets[msg.sender].isActive, "Bet already active");
        require(_betType <= 1, "Invalid bet type");
        require(_target >= 2 && _target <= 98, "Target must be between 2 and 98");
        require(chipToken.balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        // Transfer bet from player
        chipToken.burn(msg.sender, _amount);
        
        // Store bet
        bets[msg.sender] = Bet({
            player: msg.sender,
            amount: _amount,
            betType: _betType,
            target: _target,
            isActive: true,
            seed: uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce++)))
        });
        
        emit BetPlaced(msg.sender, _amount, _betType, _target);
    }
    
    function rollDice() external nonReentrant {
        Bet storage bet = bets[msg.sender];
        require(bet.isActive, "No active bet");
        
        // Generate random number between 1 and 100
        uint8 result = uint8((uint256(keccak256(abi.encodePacked(bet.seed, block.prevrandao))) % 100) + 1);
        
        bool won = false;
        if (bet.betType == 0) { // Over
            won = result > bet.target;
        } else { // Under
            won = result < bet.target;
        }
        
        uint256 payout = 0;
        if (won) {
            // Calculate payout based on probability
            uint256 winChance;
            if (bet.betType == 0) { // Over
                winChance = 100 - bet.target;
            } else { // Under
                winChance = bet.target - 1;
            }
            
            // Payout = bet * (99 / winChance) with 1% house edge
            payout = (bet.amount * 99) / winChance;
            chipToken.mint(msg.sender, payout);
        }
        
        bet.isActive = false;
        emit DiceRolled(msg.sender, result, won, payout);
    }
    
    function getBetInfo(address player) external view returns (
        uint256 amount,
        uint8 betType,
        uint8 target,
        bool isActive
    ) {
        Bet storage bet = bets[player];
        return (bet.amount, bet.betType, bet.target, bet.isActive);
    }
}