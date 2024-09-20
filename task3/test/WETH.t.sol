// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {WETH} from "../src/WETH.sol";

contract WETHTest is Test {
    WETH weth;
    address user = address(0x123);

    function setUp() public {
        weth = new WETH();
    }

    function testDeposit() public {
        // Arrange: Set the user to send 1 ether
        uint256 depositAmount = 1 ether;

        // Act: Deposit ETH
        vm.deal(user, depositAmount); // Give the user some ETH
        vm.prank(user); // Impersonate the user
        weth.deposit{value: depositAmount}(); // Deposit ETH to WETH

        // Assert: Check WETH balance and ETH balance
        assertEq(
            weth.balanceOf(user),
            depositAmount,
            "User's WETH balance should match the deposit amount"
        );
        assertEq(
            address(weth).balance,
            depositAmount,
            "WETH contract should hold the deposited ETH"
        );
    }

    function testWithdraw() public {
        // Arrange: Deposit ETH first
        uint256 depositAmount = 1 ether;
        vm.deal(user, depositAmount);
        vm.prank(user);
        weth.deposit{value: depositAmount}();

        // Act: Withdraw WETH
        uint256 withdrawAmount = depositAmount;
        vm.prank(user);
        weth.withdraw(withdrawAmount);

        // Assert: Check balances after withdrawal
        assertEq(
            user.balance,
            withdrawAmount,
            "User should hold the withdrawAmount ETH"
        );
        assertEq(
            address(weth).balance,
            0,
            "WETH contract should not hold any ETH"
        );
        assertEq(
            weth.balanceOf(address(weth)),
            0,
            "WETH contract should not hold any WETH"
        );
        assertEq(weth.balanceOf(user), 0, "User should not hold any WETH");
    }

    function testCannotWithdrawMoreThanBalance() public {
        // Arrange: Deposit ETH first
        uint256 depositAmount = 1 ether;
        vm.deal(user, depositAmount);
        vm.prank(user);
        weth.deposit{value: depositAmount}();

        // Act: Try to withdraw more than the balance
        vm.prank(user);
        vm.expectRevert("Insufficient WETH balance");
        weth.withdraw(depositAmount + 1 ether); // Attempt to withdraw more than deposited
    }

    function testCannotDepositZero() public {
        // Act: Try to deposit zero ETH
        vm.prank(user);
        vm.expectRevert("Must send ETH to deposit");
        weth.deposit{value: 0}(); // Attempt to deposit zero ETH
    }
}
