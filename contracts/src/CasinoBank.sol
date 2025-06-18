// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {CasinoChip} from "./CasinoChip.sol";

// NOTE: Value-based chip conversion using Chainlink price feeds
// 1 CHIP = $100 USD
// Users get chips based on USD value of their deposit
// ETH at $2000 → 1 ETH = 20 chips
// USDC at $1 → 1000 USDC = 10 chips 

contract CasinoBank is Ownable {

    CasinoChip public immutable casinoChip;

    //////////////////////////
    //        EVENTS        //
    //////////////////////////

    event CasinoBank__Deposit(address indexed from, address indexed token, uint256 indexed amount);
    event CasinoBank__Withdrawal(address indexed to, address indexed token, uint256 indexed amount);
    event CasinoBank__FreeChipsClaimed(address indexed user, uint256 amount);
    event CasinoBank__PriceFeedUpdated(address indexed token, address indexed priceFeed);
    event CasinoBank__TokenWhitelisted(address indexed token);
    event CasinoBank__TokenDelisted(address indexed token);

    //////////////////////////
    //      PRICE FEEDS     //
    //////////////////////////
    
    // token address => Chainlink price feed
    mapping(address => AggregatorV3Interface) public priceFeeds;
    
    // Constants for value-based conversion
    uint256 public constant USD_PER_CHIP = 1; // 1 CHIP = $1 USD for easier calculation
    uint8 public constant CHIP_DECIMALS = 18;
    uint256 public constant PRICE_FEED_TIMEOUT = 3 hours; // Price feed staleness threshold

    //////////////////////////
    //      STORAGE         //
    //////////////////////////

    // user => token => balance (kept for deposit tracking)
    mapping(address => mapping(address => uint256)) public userBalances;
    
    mapping(address => bool) public whitelistedTokens;

    // DEMO CHIPS   
    mapping(address => bool) public hasClaimedFreeChips;
    uint256 public constant FREE_CHIPS = 5 * 10**18;

    //////////////////////////
    //      CONSTRUCTOR     //
    //////////////////////////

    constructor(address _chip) payable Ownable(msg.sender) {
        casinoChip = CasinoChip(_chip);
    }
    
    /// @notice Get latest price from Chainlink price feed
    /// @param token The token address (address(0) for ETH)
    /// @return price The latest price in USD with 8 decimals
    function getTokenPriceUSD(address token) public view returns (uint256 price) {
        AggregatorV3Interface priceFeed = priceFeeds[token];
        require(address(priceFeed) != address(0), "Price feed not set");
        
        (, int256 answer, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        require(answer > 0, "Invalid price");
        
        // Cache timestamp to avoid multiple TIMESTAMP opcodes
        uint256 currentTime = block.timestamp;
        require(currentTime - updatedAt <= PRICE_FEED_TIMEOUT, "Price feed stale");
        
        return uint256(answer);
    }
    
    /// @notice Convert token amount to chip amount based on USD value
    /// @param token The token address (address(0) for ETH)
    /// @param tokenAmount The amount of tokens to convert
    /// @return chipAmount The equivalent chip amount (18 decimals)
    function convertTokenToChips(address token, uint256 tokenAmount) public view returns (uint256 chipAmount) {
        // Cache price to avoid multiple external calls
        uint256 priceUSD = getTokenPriceUSD(token);
        
        // Cache token decimals with optimized check
        uint8 tokenDecimals;
        if (token == address(0)) {
            tokenDecimals = 18; // ETH decimals cached
        } else {
            tokenDecimals = IERC20Metadata(token).decimals();
        }
        
        // Optimize math operations by pre-calculating denominators
        uint256 denominator = 10**(tokenDecimals + 8);
        uint256 usdValue = (tokenAmount * priceUSD) / denominator;
        
        // Use cached constants for final calculation
        chipAmount = (usdValue * 10**CHIP_DECIMALS) / USD_PER_CHIP;
        
        return chipAmount;
    }
    
    /// @notice Convert chip amount to token amount based on USD value
    /// @param token The token address (address(0) for ETH)
    /// @param chipAmount The amount of chips to convert (18 decimals)
    /// @return tokenAmount The equivalent token amount in native decimals
    function convertChipsToToken(address token, uint256 chipAmount) public view returns (uint256 tokenAmount) {
        // Cache price to avoid multiple external calls
        uint256 priceUSD = getTokenPriceUSD(token);
        
        // Cache token decimals with optimized check
        uint8 tokenDecimals;
        if (token == address(0)) {
            tokenDecimals = 18; // ETH decimals cached
        } else {
            tokenDecimals = IERC20Metadata(token).decimals();
        }
        
        // Optimize math operations by pre-calculating values
        uint256 usdValue = (chipAmount * USD_PER_CHIP) / 10**CHIP_DECIMALS;
        uint256 numerator = usdValue * 10**(tokenDecimals + 8);
        tokenAmount = numerator / priceUSD;
        
        return tokenAmount;
    }

    function deposit(uint256 amount, address token) external payable returns (bool) {
        // Cache sender to avoid multiple CALLER opcodes
        address sender = msg.sender;
        
        if (token == address(0)) {
            // ETH deposit path - optimized with cached value
            require(msg.value > 0, "No ETH sent");
            require(amount == msg.value, "Amount mismatch");
            
            // Cache msg.value to avoid multiple CALLVALUE opcodes
            uint256 value = msg.value;
            userBalances[sender][address(0)] += value;
            
            // Convert ETH to chips based on USD value
            uint256 chipAmount = convertTokenToChips(token, amount);
            casinoChip.mint(sender, chipAmount);
            emit CasinoBank__Deposit(sender, address(0), amount);
        } else {
            // ERC20 deposit path - batch validation checks
            require(msg.value == 0, "Don't send ETH with token");
            require(amount > 0, "Invalid amount");
            require(whitelistedTokens[token], "Token not whitelisted");

            // Single external call for transfer
            bool success = ERC20(token).transferFrom(sender, address(this), amount);
            require(success, "Transfer failed");
            
            userBalances[sender][token] += amount;
            
            // Convert token to chips based on USD value
            uint256 chipAmount = convertTokenToChips(token, amount);
            casinoChip.mint(sender, chipAmount);
            emit CasinoBank__Deposit(sender, token, amount);
        }
        return true;
    }

    function cashout(address token, uint256 chipAmount) external returns (bool) {
        require(chipAmount > 0, "Invalid amount");
        
        // Check user has enough chips
        require(casinoChip.balanceOf(msg.sender) >= chipAmount, "Insufficient chip balance");
        
        // Convert chip amount to token amount based on current USD value
        uint256 tokenAmount = convertChipsToToken(token, chipAmount);
        
        // Check contract has enough of the requested token
        if (token == address(0)) {
            require(address(this).balance >= tokenAmount, "Insufficient ETH in contract");
        } else {
            require(ERC20(token).balanceOf(address(this)) >= tokenAmount, "Insufficient token in contract");
        }

        // Burn CasinoChip tokens
        casinoChip.burn(msg.sender, chipAmount);

        if (token == address(0)) {
            // ETH transfer
            (bool sent, ) = msg.sender.call{value: tokenAmount}("");
            require(sent, "ETH transfer failed");
        } else {
            // ERC-20 transfer
            bool success = ERC20(token).transfer(msg.sender, tokenAmount);
            require(success, "ERC20 transfer failed");
        }

        emit CasinoBank__Withdrawal(msg.sender, token, tokenAmount);
        return true;
    }
    
    function cashoutFor(address user, address token, uint256 chipAmount) external returns (bool) {
        require(chipAmount > 0, "Invalid amount");
        
        // Check user has enough chips
        require(casinoChip.balanceOf(user) >= chipAmount, "Insufficient chip balance");
        
        // Convert chip amount to token amount based on current USD value
        uint256 tokenAmount = convertChipsToToken(token, chipAmount);
        
        // Check contract has enough of the requested token
        if (token == address(0)) {
            require(address(this).balance >= tokenAmount, "Insufficient ETH in contract");
        } else {
            require(ERC20(token).balanceOf(address(this)) >= tokenAmount, "Insufficient token in contract");
        }

        // Burn CasinoChip tokens
        casinoChip.burn(user, chipAmount);

        if (token == address(0)) {
            // ETH transfer
            (bool sent, ) = user.call{value: tokenAmount}("");
            require(sent, "ETH transfer failed");
        } else {
            // ERC-20 transfer
            bool success = ERC20(token).transfer(user, tokenAmount);
            require(success, "ERC20 transfer failed");
        }

        emit CasinoBank__Withdrawal(user, token, tokenAmount);
        return true;
    }
    
    function addTokensToWhitelist(address token) external onlyOwner {
        require(!whitelistedTokens[token], "Token already whitelisted");
        require(token != address(0), "No Address(0)");
        whitelistedTokens[token] = true;
        emit CasinoBank__TokenWhitelisted(token);
    }

    function removeTokensToWhitelist(address token) external onlyOwner {
        require(whitelistedTokens[token], "Token not whitelisted");
        require(token != address(0), "No Address(0)");
        whitelistedTokens[token] = false;
        emit CasinoBank__TokenDelisted(token);
    }

    function claimFreeChips() external {
        require(!hasClaimedFreeChips[msg.sender], "Already claimed free chips");
        
        hasClaimedFreeChips[msg.sender] = true;
        casinoChip.mint(msg.sender, FREE_CHIPS);
        
        emit CasinoBank__FreeChipsClaimed(msg.sender, FREE_CHIPS);
    }
    
    function claimFreeChipsFor(address user) external {
        require(!hasClaimedFreeChips[user], "Already claimed free chips");
        
        hasClaimedFreeChips[user] = true;
        casinoChip.mint(user, FREE_CHIPS);
        
        emit CasinoBank__FreeChipsClaimed(user, FREE_CHIPS);
    }
    
    function depositFor(address user, uint256 amount, address token) external payable returns (bool) {
        if (token == address(0)) {
            // ETH deposit
            require(msg.value > 0, "No ETH sent");
            require(amount == msg.value, "Amount mismatch");
            userBalances[user][address(0)] += msg.value;
            
            // Convert ETH to chips based on USD value
            uint256 chipAmount = convertTokenToChips(token, amount);
            casinoChip.mint(user, chipAmount);
            emit CasinoBank__Deposit(user, address(0), amount);
            return true;
        } else {
            // ERC20 deposit
            require(msg.value == 0, "Don't send ETH with token");
            require(whitelistedTokens[token], "Token not whitelisted");
            require(amount > 0, "Invalid amount");

            bool success = ERC20(token).transferFrom(user, address(this), amount);
            require(success, "Transfer failed");
            userBalances[user][token] += amount;
            
            // Convert token to chips based on USD value
            uint256 chipAmount = convertTokenToChips(token, amount);
            casinoChip.mint(user, chipAmount);
            emit CasinoBank__Deposit(user, token, amount);
            return true;
        }
    }
    
    /// @notice Set price feed for a token
    /// @param token The token address (address(0) for ETH)
    /// @param priceFeed The Chainlink price feed address
    function setPriceFeed(address token, address priceFeed) external onlyOwner {
        require(priceFeed != address(0), "Invalid price feed");
        priceFeeds[token] = AggregatorV3Interface(priceFeed);
        emit CasinoBank__PriceFeedUpdated(token, priceFeed);
    }

    function hasUserClaimedFreeChips(address user) external view returns (bool) {
        return hasClaimedFreeChips[user];
    }

}