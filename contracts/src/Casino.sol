// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {CasinoBank} from "./CasinoBank.sol";
import {CasinoChip} from "./CasinoChip.sol";
import {Blackjack} from "./Blackjack.sol";
import {Roulette} from "./Roulette.sol";
import {Slots} from "./Slots.sol";
import {Dice} from "./Dice.sol";

contract Casino is Ownable, ReentrancyGuard {
    
    CasinoBank public immutable casinoBank;
    CasinoChip public immutable casinoChip;
    
    // Game contracts
    Blackjack public blackjack;
    Roulette public roulette;
    Slots public slots;
    Dice public dice;
    
    // Game statistics - optimized for storage packing
    struct GameStats {
        uint256 totalBets;      // Slot 0
        uint256 totalPayout;    // Slot 1
        uint128 totalPlayers;   // Slot 2 (first half) - unlikely to exceed 2^128
        uint128 houseEdge;      // Slot 2 (second half) - basis points, max 10000
    }
    
    mapping(string => GameStats) public gameStats;
    mapping(address => mapping(string => uint256)) public playerStats; // player => game => total bet
    
    // Events
    event GameRegistered(string indexed gameName, address indexed gameContract);
    event GameRemoved(string indexed gameName);
    event PlayerActivity(address indexed player, string indexed game, uint256 amount);
    
    // Game registry
    mapping(string => address) public games;
    string[] public gameNames;
    
    constructor(address _casinoBank, address _casinoChip) payable Ownable(msg.sender) {
        casinoBank = CasinoBank(_casinoBank);
        casinoChip = CasinoChip(_casinoChip);
    }
    
    function registerGame(string memory gameName, address gameContract) external onlyOwner {
        require(games[gameName] == address(0), "Game already registered");
        require(gameContract != address(0), "Invalid game contract");
        
        games[gameName] = gameContract;
        gameNames.push(gameName);
        
        emit GameRegistered(gameName, gameContract);
    }
    
    function _registerGame(string memory gameName, address gameContract) internal {
        require(games[gameName] == address(0), "Game already registered");
        require(gameContract != address(0), "Invalid game contract");
        
        games[gameName] = gameContract;
        gameNames.push(gameName);
        
        emit GameRegistered(gameName, gameContract);
    }
    
    function removeGame(string memory gameName) external onlyOwner {
        require(games[gameName] != address(0), "Game not registered");
        
        delete games[gameName];
        
        // Remove from gameNames array
        for (uint256 i = 0; i < gameNames.length; i++) {
            if (keccak256(abi.encodePacked(gameNames[i])) == keccak256(abi.encodePacked(gameName))) {
                gameNames[i] = gameNames[gameNames.length - 1];
                gameNames.pop();
                break;
            }
        }
        
        emit GameRemoved(gameName);
    }
    
    function setGameContracts(
        address _blackjack,
        address _roulette,
        address _slots,
        address _dice
    ) external onlyOwner {
        if (_blackjack != address(0)) {
            blackjack = Blackjack(_blackjack);
            _registerGame("blackjack", _blackjack);
        }
        if (_roulette != address(0)) {
            roulette = Roulette(_roulette);
            _registerGame("roulette", _roulette);
        }
        if (_slots != address(0)) {
            slots = Slots(_slots);
            _registerGame("slots", _slots);
        }
        if (_dice != address(0)) {
            dice = Dice(_dice);
            _registerGame("dice", _dice);
        }
        
        // Initialize game stats
        gameStats["blackjack"].houseEdge = 50; // 0.5%
        gameStats["roulette"].houseEdge = 270; // 2.7%
        gameStats["slots"].houseEdge = 400; // 4%
        gameStats["dice"].houseEdge = 167; // 1.67%
    }
    
    function updateGameStats(
        string memory gameName,
        uint256 betAmount,
        uint256 payoutAmount,
        address player
    ) external {
        require(games[gameName] == msg.sender, "Only registered games can update stats");
        
        GameStats storage stats = gameStats[gameName];
        stats.totalBets += betAmount;
        stats.totalPayout += payoutAmount;
        
        // Check if this is a new player for this game
        if (playerStats[player][gameName] == 0) {
            stats.totalPlayers++;
        }
        
        playerStats[player][gameName] += betAmount;
        
        emit PlayerActivity(player, gameName, betAmount);
    }
    
    // Helper functions for players
    function getPlayerChipBalance(address player) external view returns (uint256) {
        return casinoChip.balanceOf(player);
    }
    
    function hasPlayerClaimedFreeChips(address player) external view returns (bool) {
        return casinoBank.hasUserClaimedFreeChips(player);
    }
    
    function claimFreeChips() external {
        casinoBank.claimFreeChipsFor(msg.sender);
    }
    
    function depositETH() external payable {
        require(msg.value > 0, "Must send ETH");
        casinoBank.depositFor{value: msg.value}(msg.sender, msg.value, address(0));
    }
    
    function depositToken(address token, uint256 amount) external {
        casinoBank.depositFor(msg.sender, amount, token);
    }
    
    function cashoutETH(uint256 amount) external {
        casinoBank.cashoutFor(msg.sender, address(0), amount);
    }
    
    function cashoutToken(address token, uint256 amount) external {
        casinoBank.cashoutFor(msg.sender, token, amount);
    }
    
    // Game status functions
    function isPlayerInGame(address player) external view returns (bool) {
        // Cache game contract addresses to reduce SLOAD operations
        address blackjackAddr = address(blackjack);
        address rouletteAddr = address(roulette);
        address slotsAddr = address(slots);
        address diceAddr = address(dice);
        
        // Check each game with cached addresses and early returns
        if (blackjackAddr != address(0) && blackjack.isInGame(player)) return true;
        if (rouletteAddr != address(0) && roulette.hasActiveBet(player)) return true;
        if (slotsAddr != address(0) && slots.hasActiveSpin(player)) return true;
        if (diceAddr != address(0)) {
            (, , , bool isActive) = dice.getBetInfo(player);
            if (isActive) return true;
        }
        
        return false;
    }
    
    function getActiveGames(address player) external view returns (string[] memory) {
        // Cache game addresses to reduce storage reads
        address blackjackAddr = address(blackjack);
        address rouletteAddr = address(roulette);
        address slotsAddr = address(slots);
        address diceAddr = address(dice);
        
        // Pre-allocate with maximum possible size
        string[] memory activeGames = new string[](4);
        uint256 count = 0;
        
        // Check each game and build array
        if (blackjackAddr != address(0) && blackjack.isInGame(player)) {
            activeGames[count++] = "blackjack";
        }
        if (rouletteAddr != address(0) && roulette.hasActiveBet(player)) {
            activeGames[count++] = "roulette";
        }
        if (slotsAddr != address(0) && slots.hasActiveSpin(player)) {
            activeGames[count++] = "slots";
        }
        if (diceAddr != address(0)) {
            (, , , bool isActive) = dice.getBetInfo(player);
            if (isActive) {
                activeGames[count++] = "dice";
            }
        }
        
        // Return right-sized array
        string[] memory result = new string[](count);
        for (uint256 i = 0; i < count;) {
            result[i] = activeGames[i];
            unchecked { ++i; } // Gas optimization: unchecked increment
        }
        
        return result;
    }
    
    // Game information functions
    function getAllGames() external view returns (string[] memory) {
        return gameNames;
    }
    
    function getGameContract(string memory gameName) external view returns (address) {
        return games[gameName];
    }
    
    function getGameStats(string memory gameName) external view returns (
        uint256 totalBets,
        uint256 totalPayout,
        uint256 totalPlayers,
        uint256 houseEdge
    ) {
        GameStats storage stats = gameStats[gameName];
        return (stats.totalBets, stats.totalPayout, stats.totalPlayers, stats.houseEdge);
    }
    
    function getPlayerStats(address player, string memory gameName) external view returns (uint256) {
        return playerStats[player][gameName];
    }
    
    function getCasinoSummary() external view returns (
        uint256 totalChipsInCirculation,
        uint256 totalGames,
        uint256 totalBetsAllGames,
        uint256 totalPayoutAllGames
    ) {
        totalChipsInCirculation = casinoChip.totalSupply();
        
        // Cache array length to avoid repeated SLOAD
        uint256 gamesLength = gameNames.length;
        totalGames = gamesLength;
        
        // Use unchecked increment for gas optimization
        for (uint256 i = 0; i < gamesLength;) {
            GameStats storage stats = gameStats[gameNames[i]];
            totalBetsAllGames += stats.totalBets;
            totalPayoutAllGames += stats.totalPayout;
            unchecked { ++i; }
        }
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = owner().call{value: balance}("");
            require(success, "Emergency withdraw failed");
        }
    }
    
    function emergencyWithdrawChips() external onlyOwner {
        uint256 chipBalance = casinoChip.balanceOf(address(this));
        if (chipBalance > 0) {
            bool success = casinoChip.transfer(owner(), chipBalance);
            require(success, "Emergency chip withdraw failed");
        }
    }
    
    // Receive function to accept ETH
    receive() external payable {
        // Automatically deposit received ETH for the sender
        casinoBank.depositFor{value: msg.value}(msg.sender, msg.value, address(0));
    }
}