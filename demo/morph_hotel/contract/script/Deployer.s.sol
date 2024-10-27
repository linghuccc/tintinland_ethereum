// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {HotelToken} from "../src/Token.sol";
import {HotelBooking} from "../src/Booking.sol";

contract DeployerScript is Script {
    function setUp() public {}

   function run() public returns(HotelBooking) {
        vm.startBroadcast();
        HotelToken token = new HotelToken();
        HotelBooking hotelBooking = new HotelBooking(address(token));

        vm.stopBroadcast();
        return hotelBooking;
    }
}
