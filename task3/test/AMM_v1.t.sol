// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AMM} from "../src/AMM_v1.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Mock Token", "MTK") {
        _mint(msg.sender, initialSupply);
    }
}

contract AMMTest is Test {
    AMM public amm;
    MockToken public weth;
    MockToken public token;

    address user1 = address(0x123);
    address user2 = address(0x456);

    function setUp() public {
        // Deploy mock tokens
        weth = new MockToken(101e18); // 101 WETH
        token = new MockToken(101e20); // 10100 Token

        // Transfer tokens to users
        weth.transfer(user1, 1e20); // 100 WETH for user1
        token.transfer(user1, 1e22); // 10000 Token for user1
        weth.transfer(user2, 1e18); // 1 WETH for user2
        token.transfer(user2, 1e20); // 100 Token for user2

        // Deploy AMM contract
        amm = new AMM(address(weth), address(token));

        // Allow AMM to spend user1's tokens
        vm.startPrank(user1);
        weth.approve(address(amm), 1e20);
        token.approve(address(amm), 1e22);
        vm.stopPrank();

        // Allow AMM to spend user2's tokens
        vm.startPrank(user2);
        weth.approve(address(amm), 1e18);
        token.approve(address(amm), 1e20);
        vm.stopPrank();
    }

    function testAddInitialLiquidity() public {
        vm.prank(user1);
        uint liquidity = amm.addLiquidity(1e20, 1e22);
        assertEq(amm.balanceOf(user1), liquidity);
        assertEq(amm.totalSupply(), liquidity);
        assertEq(amm.reserveWeth(), 1e20);
        assertEq(amm.reserveToken(), 1e22);
    }

    function testAddLiquidity() public {
        // First add initial liquidity
        vm.prank(user1);
        uint liquidity1 = amm.addLiquidity(1e20, 1e22);
        assertEq(amm.balanceOf(user1), liquidity1);
        assertEq(amm.totalSupply(), liquidity1);
        assertEq(amm.reserveWeth(), 1e20);
        assertEq(amm.reserveToken(), 1e22);

        // User1 adds liquidity
        vm.prank(user2);
        uint liquidity2 = amm.addLiquidity(1e18, 1e20);
        assertEq(liquidity1, 100 * liquidity2);
        assertEq(amm.balanceOf(user2), liquidity2);
        assertEq(amm.totalSupply(), liquidity1 + liquidity2); // LP tokens should be liquidity1 + liquidity2
        assertEq(amm.reserveWeth(), 101e18);
        assertEq(amm.reserveToken(), 101e20);
    }

    function testRemoveLiquidity() public {
        // First add initial liquidity
        vm.prank(user1);
        uint liquidity1 = amm.addLiquidity(1e20, 1e22);

        // User2 adds liquidity
        vm.prank(user2);
        uint liquidity2 = amm.addLiquidity(1e18, 1e20);
        uint liquidity3 = amm.totalSupply();
        assertEq(liquidity1, 100 * liquidity2);
        assertEq(liquidity3, liquidity1 + liquidity2);
        assertEq(amm.balanceOf(user2), liquidity2);
        assertEq(weth.balanceOf(user2), 0);
        assertEq(token.balanceOf(user2), 0);

        // User2 removes liquidity
        vm.prank(user2);
        (uint amountWeth, uint amountToken) = amm.removeLiquidity(liquidity2);
        assertEq(amm.balanceOf(user2), 0);
        assertEq(amountWeth, 1e18);
        assertEq(amountToken, 1e20);
        assertEq(weth.balanceOf(user2), 1e18);
        assertEq(token.balanceOf(user2), 1e20);
    }

    function testSwap() public {
        // First add initial liquidity
        vm.prank(user1);
        amm.addLiquidity(1e20, 1e22);

        uint reserveWeth = amm.reserveWeth();
        uint reserveToken = amm.reserveToken();

        // User2 swaps WETH for Token
        vm.prank(user2);
        (uint amountOut, ) = amm.swap(1e18, address(weth), 0);
        assertGt(amountOut, 0);
        assertEq(amountOut, amm.getAmountOut(1e18, reserveWeth, reserveToken));
    }
}
