// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/Blackjack.sol";
import "../src/CasinoChip.sol";

contract DeployBlackjackOnlyScript is Script {
    // Base Sepolia Chainlink VRF Coordinator
    address constant VRF_COORDINATOR = 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634;
    bytes32 constant KEY_HASH = 0x83d1b6e3388bed3d76426974512bb0d270e9542a765cd667242ea26c0cc0b730;
    uint256 constant SUBSCRIPTION_ID = 33044594880601817352894325160789429723471484151736253683391306672267394653937;
    
    // Existing contracts
    address constant CASINO_CHIP = 0x38969f932c5830787B68676Edd6105534c3e60e0;

    function run() external {
        vm.startBroadcast();

        console.log("=== DEPLOYING NEW BLACKJACK CONTRACT ===");
        console.log("Deployer:", msg.sender);
        console.log("CasinoChip:", CASINO_CHIP);

        // Deploy new Blackjack with increased gas limit (now 500k)
        Blackjack blackjack = new Blackjack(
            VRF_COORDINATOR,
            KEY_HASH,
            CASINO_CHIP,
            SUBSCRIPTION_ID
        );
        console.log(" New Blackjack deployed at:", address(blackjack));

        // Grant CASINO_ROLE to new Blackjack
        CasinoChip chip = CasinoChip(CASINO_CHIP);
        bytes32 casinoRole = chip.CASINO_ROLE();
        
        chip.grantRole(casinoRole, address(blackjack));
        console.log("CASINO_ROLE granted to new Blackjack");

        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("\nNew Blackjack address for frontend:");
        console.log("blackjack:", string.concat("'", toHexString(address(blackjack)), "'"));
        
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Update frontend config with new Blackjack address");
        console.log("2. Add this contract as VRF consumer:");
        console.log("   -", address(blackjack));
        console.log("3. Visit: https://vrf.chain.link/base-sepolia");

        vm.stopBroadcast();
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