// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/CasinoBank.sol";
import "../src/CasinoChip.sol";
import "../src/Blackjack.sol";
import "../src/Dice.sol";
import "../src/Roulette.sol";
import "../src/Slots.sol";

contract DeployBasePredictedScript is Script {
    // Base Sepolia Chainlink VRF Coordinator
    address constant VRF_COORDINATOR = 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634;
    bytes32 constant KEY_HASH = 0x83d1b6e3388bed3d76426974512bb0d270e9542a765cd667242ea26c0cc0b730;
    uint256 constant SUBSCRIPTION_ID = 33044594880601817352894325160789429723471484151736253683391306672267394653937;
    
    // Base Sepolia ETH/USD price feed
    address constant ETH_USD_PRICE_FEED = 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;

    function run() external {
        vm.startBroadcast();
        
        // Get deployer address and current nonce after broadcast
        address deployer = msg.sender;
        uint256 currentNonce = vm.getNonce(deployer);

        console.log("Deploying to Base Sepolia with address prediction...");
        console.log("Deployer address:", deployer);
        console.log("Starting nonce:", currentNonce);

        // Predict future addresses
        address predictedChipAddress = computeAddress(deployer, currentNonce);
        address predictedBankAddress = computeAddress(deployer, currentNonce + 1);
        
        console.log("\n=== PREDICTED ADDRESSES ===");
        console.log("CasinoChip will be deployed at:", predictedChipAddress);
        console.log("CasinoBank will be deployed at:", predictedBankAddress);

        // 1. Deploy CHIP token with predicted CasinoBank address
        CasinoChip chip = new CasinoChip(predictedBankAddress);
        console.log("\nCHIP Token deployed at:", address(chip));
        console.log("Expected:", predictedChipAddress);
        
        // 2. Deploy CasinoBank with CHIP token address
        CasinoBank casinoBank = new CasinoBank(address(chip));
        console.log("CasinoBank deployed at:", address(casinoBank));
        console.log("Expected:", predictedBankAddress);
        
        // Note: If addresses don't match, it's because the nonce was different
        // The important thing is that they reference each other correctly

        // 3. Set up price feeds
        casinoBank.setPriceFeed(address(0), ETH_USD_PRICE_FEED);
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

        // 6. Fund CasinoBank with CHIP tokens
        uint256 casinoChipReserve = 1_000_000 * 10**18;
        chip.mint(address(casinoBank), casinoChipReserve);
        console.log("CasinoBank funded with 1,000,000 CHIP tokens");

        console.log("\n=== DEPLOYMENT SUMMARY (BASE SEPOLIA) ===");
        console.log("CasinoBank:", address(casinoBank));
        console.log("CasinoChip:", address(chip));
        console.log("Blackjack:", address(blackjack));
        console.log("Dice:", address(dice));
        console.log("Roulette:", address(roulette));
        console.log("Slots:", address(slots));
        
        console.log("\n=== CONTRACT VERIFICATION LINKS ===");
        console.log("CasinoBank: https://sepolia.basescan.org/address/", address(casinoBank));
        console.log("CasinoChip: https://sepolia.basescan.org/address/", address(chip));
        console.log("Blackjack: https://sepolia.basescan.org/address/", address(blackjack));
        console.log("Dice: https://sepolia.basescan.org/address/", address(dice));
        console.log("Roulette: https://sepolia.basescan.org/address/", address(roulette));
        console.log("Slots: https://sepolia.basescan.org/address/", address(slots));
        
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Add Blackjack, Roulette, and Slots as VRF consumers");
        console.log("2. Update frontend with these contract addresses");

        vm.stopBroadcast();
    }

    // Compute the address for a contract deployed with CREATE
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
}