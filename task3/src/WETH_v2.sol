// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract WETH is ERC20, Ownable {
    // Custom errors
    error AmountMustBeGreaterThanZero();
    error InsufficientBalance(uint256 amount);

    // 事件：存款和取款事件
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    constructor() ERC20("Wrapped Ether", "WETH") Ownable(_msgSender()) {}

    // 存款：将 ETH 转换为 WETH
    function deposit() public payable {
        if (msg.value == 0) {
            revert AmountMustBeGreaterThanZero();
        }

        // 将接收到的 ETH 转换为相应数量的 WETH
        _mint(_msgSender(), msg.value);
        emit Deposit(_msgSender(), msg.value);
    }

    // 取款：将 WETH 兑换为 ETH
    function withdraw(uint256 amount) public {
        if (amount == 0) {
            revert AmountMustBeGreaterThanZero();
        }

        if (balanceOf(_msgSender()) < amount) {
            revert InsufficientBalance(amount);
        }

        // 销毁相应数量的 WETH
        _burn(_msgSender(), amount);

        // 将 ETH 发送给用户
        payable(_msgSender()).transfer(amount);
        emit Withdrawal(_msgSender(), amount);
    }

    // 重写 `transfer` 和 `transferFrom` ，增加 Balance check
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
        if (balanceOf(_msgSender()) < amount) {
            revert InsufficientBalance(amount);
        }

        return super.transferFrom(sender, recipient, amount);
    }

    // 为合约接收 ETH
    receive() external payable {
        deposit();
    }
}
