// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {DiceSimple} from "../src/DiceSimple.sol";
import {RouletteSimple} from "../src/RouletteSimple.sol";
import {SlotsSimple} from "../src/SlotsSimple.sol";

contract DeploySimpleGames is Script {
    // Base Sepolia CHIP token address
    address constant CHIP_TOKEN = 0x38969f932c5830787B68676Edd6105534c3e60e0;
    
    function run() external {
        vm.startBroadcast();
        
        // Deploy DiceSimple
        DiceSimple dice = new DiceSimple(CHIP_TOKEN);
        console.log("DiceSimple deployed at:", address(dice));
        
        // Deploy RouletteSimple
        RouletteSimple roulette = new RouletteSimple(CHIP_TOKEN);
        console.log("RouletteSimple deployed at:", address(roulette));
        
        // Deploy SlotsSimple
        SlotsSimple slots = new SlotsSimple(CHIP_TOKEN);
        console.log("SlotsSimple deployed at:", address(slots));
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("DiceSimple:", address(dice));
        console.log("RouletteSimple:", address(roulette));
        console.log("SlotsSimple:", address(slots));
        console.log("\nDon't forget to:");
        console.log("1. Update frontend configuration with new addresses");
        console.log("2. Update hooks to use the simplified interfaces");
    }
}