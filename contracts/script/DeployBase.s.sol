// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/CasinoBank.sol";
import "../src/CasinoChip.sol";
import "../src/Blackjack.sol";
import "../src/Dice.sol";
import "../src/Roulette.sol";
import "../src/Slots.sol";

contract DeployBaseScript is Script {
    // Base Sepolia Chainlink VRF Coordinator
    address constant VRF_COORDINATOR = 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634;
    bytes32 constant KEY_HASH = 0x83d1b6e3388bed3d76426974512bb0d270e9542a765cd667242ea26c0cc0b730;
    
    // You'll need to create a VRF subscription and fund it with LINK
    // Visit: https://vrf.chain.link/base-sepolia
    uint256 constant SUBSCRIPTION_ID = 33044594880601817352894325160789429723471484151736253683391306672267394653937;
    
    // Base Sepolia ETH/USD price feed
    address constant ETH_USD_PRICE_FEED = 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;

    function run() external {
        // When using --account flag, Forge handles the private key automatically
        vm.startBroadcast();

        console.log("Deploying to Base Sepolia testnet...");
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

        // 6. Fund the final CasinoBank with CHIP tokens
        // Grant CASINO_ROLE to the final CasinoBank so it can mint chips
        chip.grantRole(casinoRole, address(finalCasinoBank));
        console.log("CASINO_ROLE granted to CasinoBank");
        
        // Mint a large amount of CHIP tokens to the CasinoBank
        // With ratio 1 CHIP = 0.000001 ETH, we mint 1,000,000 CHIP for casino liquidity
        uint256 casinoChipReserve = 1_000_000 * 10**18; // 1 million CHIP
        chip.mint(address(finalCasinoBank), casinoChipReserve);
        console.log("CasinoBank funded with 1,000,000 CHIP tokens");

        console.log("\n=== DEPLOYMENT SUMMARY (BASE SEPOLIA) ===");
        console.log("CasinoBank:", address(finalCasinoBank));
        console.log("CasinoChip:", address(chip));
        console.log("Blackjack:", address(blackjack));
        console.log("Dice:", address(dice));
        console.log("Roulette:", address(roulette));
        console.log("Slots:", address(slots));
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Create a VRF subscription at https://vrf.chain.link/base-sepolia");
        console.log("2. Add these contracts as consumers to your VRF subscription");
        console.log("3. Fund your VRF subscription with LINK tokens");
        console.log("4. Update frontend with these contract addresses");
        console.log("\n=== GASLESS TRANSACTIONS ===");
        console.log("Coinbase Smart Wallet will automatically sponsor transactions on Base!");

        vm.stopBroadcast();
    }
}