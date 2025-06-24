// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/CasinoBank.sol";
import "../src/CasinoChip.sol";
import "../src/Blackjack.sol";
import "../src/Dice.sol";
import "../src/Roulette.sol";
import "../src/Slots.sol";

contract DeployScript is Script {
    // Sepolia testnet Chainlink VRF Coordinator
    address constant VRF_COORDINATOR = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    bytes32 constant KEY_HASH = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    
    // You'll need to create a VRF subscription and fund it with LINK
    // Visit: https://vrf.chain.link/
    uint256 constant SUBSCRIPTION_ID = 103036806356572904141444650306175330773219057672506466552021010715624678697306;  
    
    // Sepolia ETH/USD price feed
    address constant ETH_USD_PRICE_FEED = 0x694AA1769357215DE4FAC081bf1f309aDC325306;

    function run() external {
        // When using --account flag, Forge handles the private key automatically
        vm.startBroadcast();

        console.log("Deploying to Sepolia testnet...");
        console.log("Deployer address:", msg.sender);

        // Deploy contracts in proper order to resolve circular dependency
        
        // 1. Deploy CasinoBank with zero address first (placeholder)
        CasinoBank casinoBank = new CasinoBank(address(0));
        console.log("CasinoBank deployed at:", address(casinoBank));

        // 2. Deploy CHIP token with CasinoBank address
        CasinoChip chip = new CasinoChip(address(casinoBank));
        console.log("CHIP Token deployed at:", address(chip));

        // Note: CasinoBank references the chip as immutable, so we need to redeploy it
        // with the correct chip address
        CasinoBank finalCasinoBank = new CasinoBank(address(chip));
        console.log("Final CasinoBank deployed at:", address(finalCasinoBank));

        // 3. Set up price feeds on the final bank
        finalCasinoBank.setPriceFeed(address(0), ETH_USD_PRICE_FEED); // ETH price feed
        console.log("ETH price feed configured");

        // Update reference for rest of deployment
        casinoBank = finalCasinoBank;

        // 4. Deploy game contracts
        Blackjack blackjack = new Blackjack(
            VRF_COORDINATOR,
            KEY_HASH,
            address(chip),
            SUBSCRIPTION_ID
        );
        console.log("Blackjack deployed at:", address(blackjack));

        Dice dice = new Dice(address(chip));
        console.log("Dice deployed at:", address(dice));

        Roulette roulette = new Roulette(
            VRF_COORDINATOR,
            KEY_HASH,
            address(chip),
            SUBSCRIPTION_ID
        );
        console.log("Roulette deployed at:", address(roulette));

        Slots slots = new Slots(
            VRF_COORDINATOR,
            KEY_HASH,
            address(chip),
            SUBSCRIPTION_ID
        );
        console.log("Slots deployed at:", address(slots));

        // 5. Grant CASINO_ROLE to all game contracts
        bytes32 casinoRole = chip.CASINO_ROLE();
        chip.grantRole(casinoRole, address(blackjack));
        chip.grantRole(casinoRole, address(dice));
        chip.grantRole(casinoRole, address(roulette));
        chip.grantRole(casinoRole, address(slots));
        console.log("CASINO_ROLE granted to all game contracts");

        // 6. Fund the final CasinoBank with ETH and mint CHIP tokens
        // Send 0.1 ETH to the final CasinoBank
        (bool success, ) = address(finalCasinoBank).call{value: 0.1 ether}("");
        require(success, "Failed to fund casino bank with ETH");
        console.log("CasinoBank funded with 0.1 ETH");
        
        // Grant CASINO_ROLE to the final CasinoBank so it can mint chips
        chip.grantRole(casinoRole, address(finalCasinoBank));
        
        // Mint a large amount of CHIP tokens to the CasinoBank
        // With ratio 1 CHIP = 0.000001 ETH, 0.1 ETH = 100,000 CHIP
        // Let's mint 1,000,000 CHIP tokens for casino liquidity
        uint256 casinoChipReserve = 1_000_000 * 10**18; // 1 million CHIP
        chip.mint(address(finalCasinoBank), casinoChipReserve);
        console.log("CasinoBank funded with 1,000,000 CHIP tokens");

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("CasinoBank:", address(finalCasinoBank));
        console.log("CasinoChip:", address(chip));
        console.log("Blackjack:", address(blackjack));
        console.log("Dice:", address(dice));
        console.log("Roulette:", address(roulette));
        console.log("Slots:", address(slots));
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Add these contracts as consumers to your VRF subscription");
        console.log("2. Fund your VRF subscription with LINK tokens");
        console.log("3. Update frontend with these contract addresses");

        vm.stopBroadcast();
    }
}