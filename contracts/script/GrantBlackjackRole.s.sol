// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/CasinoChip.sol";

contract GrantBlackjackRoleScript is Script {
    function run() external {
        vm.startBroadcast();

        // Contract addresses
        address casinoChipAddress = 0x38969f932c5830787B68676Edd6105534c3e60e0;
        address newBlackjackAddress = 0x73e5BA331333bB83526e1Ef6437Dbf529ca5ed38;
        
        CasinoChip chip = CasinoChip(casinoChipAddress);
        bytes32 casinoRole = chip.CASINO_ROLE();
        
        console.log("Granting CASINO_ROLE to new Blackjack...");
        console.log("CasinoChip:", casinoChipAddress);
        console.log("New Blackjack:", newBlackjackAddress);
        
        // Grant CASINO_ROLE to new Blackjack
        chip.grantRole(casinoRole, newBlackjackAddress);
        
        console.log("✅ CASINO_ROLE granted to new Blackjack");
        
        vm.stopBroadcast();
    }
}