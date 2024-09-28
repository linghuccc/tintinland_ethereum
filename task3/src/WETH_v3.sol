// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract WETH is ERC20, Ownable, ReentrancyGuard {
    // Custom errors
    error AmountMustBeGreaterThanZero();
    error InsufficientBalance(uint256 amount);
    error TransferFailed();

    // Events: Deposit and Withdrawal events
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    constructor() ERC20("Wrapped Ether", "WETH") Ownable(_msgSender()) {}

    // Deposit: Convert ETH to WETH
    function deposit() public payable {
        if (msg.value == 0) {
            revert AmountMustBeGreaterThanZero();
        }

        // Mint the corresponding amount of WETH
        _mint(_msgSender(), msg.value);
        emit Deposit(_msgSender(), msg.value);
    }

    // Withdrawal: Convert WETH to ETH
    function withdraw(uint256 amount) public nonReentrant {
        if (amount == 0) {
            revert AmountMustBeGreaterThanZero();
        }

        if (balanceOf(_msgSender()) < amount) {
            revert InsufficientBalance(amount);
        }

        // Burn the corresponding amount of WETH
        _burn(_msgSender(), amount);

        // Send ETH to the user using call
        (bool success, ) = _msgSender().call{value: amount}("");
        if (!success) {
            revert TransferFailed(); // Use custom error for transfer failure
        }

        emit Withdrawal(_msgSender(), amount);
    }

    // Override transfer and transferFrom to include balance check
    function transfer(
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        if (balanceOf(_msgSender()) < amount) {
            revert InsufficientBalance(amount);
        }

        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        if (balanceOf(sender) < amount) {
            revert InsufficientBalance(amount);
        }

        return super.transferFrom(sender, recipient, amount);
    }

    // Receive ETH to deposit
    receive() external payable {
        deposit();
    }
}
