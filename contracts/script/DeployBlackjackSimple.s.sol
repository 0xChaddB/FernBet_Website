// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/BlackjackSimple.sol";
import "../src/CasinoChip.sol";

contract DeployBlackjackSimpleScript is Script {
    
    // Existing contracts
    address constant CASINO_CHIP = 0x38969f932c5830787B68676Edd6105534c3e60e0;

    function run() external {
        vm.startBroadcast();

        console.log("=== DEPLOYING SIMPLE BLACKJACK CONTRACT ===");
        console.log("Deployer:", msg.sender);
        console.log("CasinoChip:", CASINO_CHIP);

        // Deploy BlackjackSimple (no VRF needed)
        BlackjackSimple blackjack = new BlackjackSimple(CASINO_CHIP);
        console.log(" BlackjackSimple deployed at:", address(blackjack));

        // Grant CASINO_ROLE to BlackjackSimple
        CasinoChip chip = CasinoChip(CASINO_CHIP);
        bytes32 casinoRole = chip.CASINO_ROLE();
        
        chip.grantRole(casinoRole, address(blackjack));
        console.log(" CASINO_ROLE granted to BlackjackSimple");

        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("\nBlackjackSimple address for frontend:");
        console.log("blackjack:", string.concat("'", toHexString(address(blackjack)), "'"));

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