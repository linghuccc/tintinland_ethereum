// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {PublicAuction} from "../src/Auction.sol";

contract PublicAuctionTest is Test {
    PublicAuction auction;
    address beneficiary = address(0x999);
    address bidder1 = address(0x123);
    address bidder2 = address(0x456);

    function setUp() public {
        // Make block.timestamp > cooldownTime
        vm.warp(block.timestamp + 1 days);

        auction = new PublicAuction(beneficiary, 1 days, 1 hours);
        vm.deal(bidder1, 1 ether);
        vm.deal(bidder2, 2 ether);
    }

    function testInitialSetup() public view {
        assertEq(auction.beneficiary(), beneficiary);
        assertEq(auction.highestBid(), 0);
        assertEq(auction.auctionFinalized(), false);
    }

    function testBid() public {
        // console.log(block.timestamp);
        // console.log(auction.lastBidTime(bidder1));
        // console.log(auction.cooldownTime());
        // assertGt(
        //     block.timestamp,
        //     auction.lastBidTime(bidder1) + auction.cooldownTime()
        // );

        vm.prank(bidder1);
        auction.bid{value: 1 ether}();

        assertEq(auction.highestBidder(), bidder1);
        assertEq(auction.highestBid(), 1 ether);
    }

    function testHigherBid() public {
        vm.prank(bidder1);
        auction.bid{value: 1 ether}();

        vm.prank(bidder2);
        auction.bid{value: 2 ether}();

        assertEq(auction.highestBidder(), bidder2);
        assertEq(auction.highestBid(), 2 ether);
        assertEq(auction.pendingReturns(bidder1), 1 ether);
    }

    function testWithdraw() public {
        vm.prank(bidder1);
        auction.bid{value: 1 ether}();

        vm.prank(bidder2);
        auction.bid{value: 2 ether}();

        uint256 initialBalance = bidder1.balance;
        vm.prank(bidder1);
        auction.withdraw();

        assertEq(bidder1.balance, initialBalance + 1 ether);
    }

    function testFinalizeAuction() public {
        vm.prank(bidder1);
        auction.bid{value: 1 ether}();

        vm.warp(block.timestamp + 1 days);

        uint256 initialBalance = beneficiary.balance;
        auction.finalizeAuction();

        assertEq(beneficiary.balance, initialBalance + 1 ether);
        assertEq(auction.auctionFinalized(), true);
    }
}
