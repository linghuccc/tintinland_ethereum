// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console} from "forge-std/Script.sol";
import {ShowBalanceScript} from "./riclic/ShowBalanceScript.sol";
import {HotelToken} from "../src/Token.sol";
import {HotelBooking} from "../src/Booking.sol";

contract DeployerScript is Script {
    function setUp() public {}

    function run() public {
        // =========   Get Private Key from .env   ========= //
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        console.log("The Deployer address is            : ", deployer);

        // =========   Deploy ShowBalanceScript contract and show Deployer account balance   ========= //
        ShowBalanceScript showBalanceScript = new ShowBalanceScript();
        showBalanceScript.showBalance(deployer);

        // =========   Deploy contracts   ========= //
        vm.startBroadcast(deployerPrivateKey);
        HotelToken token = new HotelToken();
        address addrToken = address(token);

        HotelBooking hotelBooking = new HotelBooking(addrToken);
        address addrBooking = address(hotelBooking);
        vm.stopBroadcast();

        // =========   Show contract addresses   ========= //
        console.log("Token contract deployed at         : ", addrToken);
        console.log("Hotel Booking contract deployed at : ", addrBooking);
    }
}
