// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/CasinoChip.sol";

contract GrantCasinoBankRoleScript is Script {
    function run() external {
        vm.startBroadcast();

        // Contract addresses from deployment
        address casinoChipAddress = 0x38969f932c5830787B68676Edd6105534c3e60e0;
        address casinoBankAddress = 0x540A3e89E545C799976B0BC2e251f86CF74635c5;
        
        CasinoChip chip = CasinoChip(casinoChipAddress);
        bytes32 casinoRole = chip.CASINO_ROLE();
        
        console.log("Granting CASINO_ROLE to CasinoBank...");
        console.log("CasinoChip:", casinoChipAddress);
        console.log("CasinoBank:", casinoBankAddress);
        
        // Grant CASINO_ROLE to CasinoBank
        chip.grantRole(casinoRole, casinoBankAddress);
        
        console.log(" CASINO_ROLE granted to CasinoBank");
        
        vm.stopBroadcast();
    }
}