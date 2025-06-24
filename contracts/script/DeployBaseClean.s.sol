// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/CasinoBank.sol";
import "../src/CasinoChip.sol";
import "../src/Blackjack.sol";
import "../src/Dice.sol";
import "../src/Roulette.sol";
import "../src/Slots.sol";

contract DeployBaseCleanScript is Script {
    // Base Sepolia Chainlink VRF Coordinator
    address constant VRF_COORDINATOR = 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634;
    bytes32 constant KEY_HASH = 0x83d1b6e3388bed3d76426974512bb0d270e9542a765cd667242ea26c0cc0b730;
    uint256 constant SUBSCRIPTION_ID = 33044594880601817352894325160789429723471484151736253683391306672267394653937;
    
    // Base Sepolia ETH/USD price feed
    address constant ETH_USD_PRICE_FEED = 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;

    function run() external {
        vm.startBroadcast();

        console.log("=== CLEAN DEPLOYMENT TO BASE SEPOLIA ===");
        console.log("Deployer:", msg.sender);

        // Step 1: Predict the next two addresses
        uint256 currentNonce = vm.getNonce(msg.sender);
        address predictedChip = computeAddress(msg.sender, currentNonce);
        address predictedBank = computeAddress(msg.sender, currentNonce + 1);
        
        console.log("\nPredicted addresses:");
        console.log("- CasinoChip:", predictedChip);
        console.log("- CasinoBank:", predictedBank);

        // Step 2: Deploy with mutual references
        console.log("\nDeploying contracts...");
        
        // Deploy CasinoChip with predicted CasinoBank
        CasinoChip chip = new CasinoChip(predictedBank);
        console.log(" CasinoChip deployed at:", address(chip));
        
        // Deploy CasinoBank with actual CasinoChip address
        CasinoBank casinoBank = new CasinoBank(address(chip));
        console.log(" CasinoBank deployed at:", address(casinoBank));
        
        // Verify the mutual references
        console.log("\nVerifying references:");
        console.log("- CasinoChip.casinoBank():", chip.casinoBank());

        // Step 3: Configure CasinoBank
        casinoBank.setPriceFeed(address(0), ETH_USD_PRICE_FEED);
        console.log("\n ETH price feed configured");

        // Step 4: Deploy game contracts
        console.log("\nDeploying game contracts...");
        
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

        // Step 5: Grant permissions
        console.log("\nGranting permissions...");
        bytes32 casinoRole = chip.CASINO_ROLE();
        
        chip.grantRole(casinoRole, address(blackjack));
        chip.grantRole(casinoRole, address(dice));
        chip.grantRole(casinoRole, address(roulette));
        chip.grantRole(casinoRole, address(slots));
        console.log("CASINO_ROLE granted to all games");

        // Step 6: Fund CasinoBank
        uint256 initialSupply = 1_000_000 * 10**18;
        chip.mint(address(casinoBank), initialSupply);
        console.log("CasinoBank funded with 1,000,000 CHIP");

        // Final summary
        console.log("\n===  DEPLOYMENT COMPLETE ===");
        console.log("\nContract addresses for frontend config:");
        console.log("'base-sepolia': {");
        console.log("  casinoChip:", string.concat("'", toHexString(address(chip)), "',"));
        console.log("  casinoBank:", string.concat("'", toHexString(address(casinoBank)), "',"));
        console.log("  blackjack:", string.concat("'", toHexString(address(blackjack)), "',"));
        console.log("  dice:", string.concat("'", toHexString(address(dice)), "',"));
        console.log("  roulette:", string.concat("'", toHexString(address(roulette)), "',"));
        console.log("  slots:", string.concat("'", toHexString(address(slots)), "'"));
        console.log("}");
        
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Copy the addresses above to src/config/contracts.js");
        console.log("2. Add these VRF consumers to your subscription:");
        console.log("   -", address(blackjack));
        console.log("   -", address(roulette));
        console.log("   -", address(slots));
        console.log("3. Visit: https://vrf.chain.link/base-sepolia");

        vm.stopBroadcast();
    }

    function computeAddress(address deployer, uint256 nonce) internal pure returns (address) {
        bytes memory data;
        if (nonce == 0x00) {
            data = abi.encodePacked(bytes1(0xd6), bytes1(0x94), deployer, bytes1(0x80));
        } else if (nonce <= 0x7f) {
            data = abi.encodePacked(bytes1(0xd6), bytes1(0x94), deployer, uint8(nonce));
        } else if (nonce <= 0xff) {
            data = abi.encodePacked(bytes1(0xd7), bytes1(0x94), deployer, bytes1(0x81), uint8(nonce));
        } else if (nonce <= 0xffff) {
            data = abi.encodePacked(bytes1(0xd8), bytes1(0x94), deployer, bytes1(0x82), uint16(nonce));
        } else if (nonce <= 0xffffff) {
            data = abi.encodePacked(bytes1(0xd9), bytes1(0x94), deployer, bytes1(0x83), uint24(nonce));
        } else {
            data = abi.encodePacked(bytes1(0xda), bytes1(0x94), deployer, bytes1(0x84), uint32(nonce));
        }
        return address(uint160(uint256(keccak256(data))));
    }
    
    function toHexString(address addr) internal pure returns (string memory) {
        bytes memory buffer = new bytes(42);
        buffer[0] = '0';
        buffer[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            uint8 b = uint8(uint160(addr) >> (8 * (19 - i)));
            buffer[2 + i * 2] = bytes1(uint8(b >> 4) + (b >> 4 < 10 ? 48 : 87));
            buffer[2 + i * 2 + 1] = bytes1(uint8(b & 0x0f) + ((b & 0x0f) < 10 ? 48 : 87));
        }
        return string(buffer);
    }
}