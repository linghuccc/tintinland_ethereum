// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {WETH} from "../src/WETH_v3.sol";

contract WETHTest is Test {
    WETH weth;
    address user1 = address(0x123);
    address user2 = address(0x456);

    function setUp() public {
        weth = new WETH();
    }

    // Helper function
    function deposit(uint amount) internal {
        vm.deal(user1, amount);
        vm.prank(user1);
        weth.deposit{value: amount}();
    }

    function testDeposit() public {
        // Arrange: Set the user1 to send 1 ether
        uint256 depositAmount = 1 ether;

        // Act: Deposit ETH
        deposit(depositAmount);

        // Assert: Check WETH balance and ETH balance
        assertEq(
            weth.balanceOf(user1),
            depositAmount,
            "user1's WETH balance should match the deposit amount"
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
        deposit(depositAmount);

        // Act: Withdraw WETH
        uint256 withdrawAmount = depositAmount;
        vm.prank(user1);
        weth.withdraw(withdrawAmount);

        // Assert: Check balances after withdrawal
        assertEq(
            user1.balance,
            withdrawAmount,
            "user1 should hold the withdrawAmount ETH"
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
        assertEq(weth.balanceOf(user1), 0, "user1 should not hold any WETH");
    }

    // Transfer Test
    function testTransfer() public {
        // Deposit and transfer
        uint256 depositAmount = 2 ether;
        uint256 transferAmount = 1 ether;
        deposit(depositAmount);

        vm.prank(user1);
        weth.transfer(user2, transferAmount);

        // Check balances updated
        assertEq(
            weth.balanceOf(user1),
            depositAmount - transferAmount,
            "Transfer failed - sender balance not updated"
        );
        assertEq(
            weth.balanceOf(user2),
            transferAmount,
            "Transfer failed - recipient balance not updated"
        );
    }

    function testCannotWithdrawMoreThanBalance() public {
        // Arrange: Deposit ETH first
        uint256 depositAmount = 1 ether;
        uint256 withdrawAmount = depositAmount + 1 ether;
        deposit(depositAmount);

        // Act: Try to withdraw more than the balance
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                WETH.InsufficientBalance.selector,
                withdrawAmount
            )
        );
        weth.withdraw(withdrawAmount); // Attempt to withdraw more than deposited
    }

    function testCannotDepositZero() public {
        // Act: Try to deposit zero ETH
        vm.prank(user1);
        vm.expectRevert(WETH.AmountMustBeGreaterThanZero.selector);
        weth.deposit{value: 0}(); // Attempt to deposit zero ETH
    }

    function testWithdrawTransferFailed() public {
        // User deposits 1 ether first
        uint256 depositAmount = 1 ether;

        // Act: Deposit ETH
        FailingContract failingContract;
        failingContract = new FailingContract{value: depositAmount}(
            address(weth)
        );
        address failingAddress = address(failingContract);

        // Simulate a failure in the transfer by sending to a contract that reverts
        vm.prank(failingAddress);
        vm.expectRevert(WETH.TransferFailed.selector); // Expect the TransferFailed error
        weth.withdraw(depositAmount);
    }
}

contract FailingContract {
    WETH weth;

    constructor(address addrWeth) payable {
        weth = WETH(payable(addrWeth));
        weth.deposit{value: msg.value}();
    }

    // This contract will revert on receiving ether
    receive() external payable {
        revert("Transfer failed");
    }
}
