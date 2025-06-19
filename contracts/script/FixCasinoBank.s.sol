// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/CasinoBank.sol";
import "../src/CasinoChip.sol";

contract FixCasinoBankScript is Script {
    // Base Sepolia addresses
    address constant CASINO_BANK = 0x43414bFBE80CFfC83329217c55dE433e473a717f;
    address constant CASINO_CHIP = 0x52cBc9331983B8BC9b012EEbf50e43aD4c358f46;
    address constant ETH_USD_PRICE_FEED = 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;

    function run() external {
        vm.startBroadcast();

        CasinoBank casinoBank = CasinoBank(payable(CASINO_BANK));
        CasinoChip chip = CasinoChip(CASINO_CHIP);

        console.log("Fixing CasinoBank configuration...");
        
        // 1. Set ETH price feed
        try casinoBank.setPriceFeed(address(0), ETH_USD_PRICE_FEED) {
            console.log("ETH price feed set successfully");
        } catch {
            console.log("ETH price feed already set or failed");
        }

        // 2. Check if CasinoBank has CASINO_ROLE
        bytes32 casinoRole = chip.CASINO_ROLE();
        bool hasRole = chip.hasRole(casinoRole, CASINO_BANK);
        console.log("CasinoBank has CASINO_ROLE:", hasRole);

        if (!hasRole) {
            console.log("ERROR: CasinoBank doesn't have CASINO_ROLE on CasinoChip!");
            console.log("You need to grant CASINO_ROLE to", CASINO_BANK);
        }

        // 3. Check CHIP balance
        uint256 balance = chip.balanceOf(CASINO_BANK);
        console.log("CasinoBank CHIP balance:", balance / 1e18, "CHIP");

        if (balance == 0) {
            console.log("WARNING: CasinoBank has no CHIP tokens!");
            console.log("Trying to mint 1,000,000 CHIP...");
            
            // Try to mint tokens
            try chip.mint(CASINO_BANK, 1_000_000 * 1e18) {
                console.log("Successfully minted 1,000,000 CHIP to CasinoBank");
            } catch {
                console.log("Failed to mint - you may need to grant CASINO_ROLE first");
            }
        }

        console.log("\n=== Configuration Summary ===");
        console.log("CasinoBank:", CASINO_BANK);
        console.log("CasinoChip:", CASINO_CHIP);
        console.log("ETH Price Feed:", ETH_USD_PRICE_FEED);
        console.log("CHIP Balance:", chip.balanceOf(CASINO_BANK) / 1e18, "CHIP");
        console.log("Has CASINO_ROLE:", hasRole);

        vm.stopBroadcast();
    }
}