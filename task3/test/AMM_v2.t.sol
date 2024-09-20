// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AMM} from "../src/AMM_v2.sol";
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

    address owner = address(0x999);
    address user1 = address(0x123);
    address user2 = address(0x456);

    function setUp() public {
        // Deploy mock tokens
        vm.startPrank(owner);
        weth = new MockToken(111e18); // 111 WETH
        token = new MockToken(111e20); // 11100 Token

        // Transfer tokens to users
        weth.transfer(user1, 1e19); // 10 WETH for user1
        token.transfer(user1, 1e21); // 1000 Token for user1
        weth.transfer(user2, 1e18); // 1 WETH for user2
        token.transfer(user2, 1e20); // 100 Token for user2

        // Deploy AMM contract
        amm = new AMM(address(weth), address(token));

        // Allow AMM to spend owner's tokens
        weth.approve(address(amm), 1e20);
        token.approve(address(amm), 1e22);
        vm.stopPrank();

        // Allow AMM to spend user1's tokens
        vm.startPrank(user1);
        weth.approve(address(amm), 1e19);
        token.approve(address(amm), 1e21);
        vm.stopPrank();

        // Allow AMM to spend user2's tokens
        vm.startPrank(user2);
        weth.approve(address(amm), 1e18);
        token.approve(address(amm), 1e20);
        vm.stopPrank();
    }

    function testAddInitialLiquidity() public {
        vm.prank(owner);
        uint liquidity = amm.addInitialLiquidity(1e20, 1e22);
        assertEq(amm.balanceOf(owner), liquidity);
        assertEq(amm.totalSupply(), liquidity);
        assertEq(amm.reserveWeth(), 1e20);
        assertEq(amm.reserveToken(), 1e22);
    }

    function testAddLiquidity() public {
        // First add initial liquidity
        vm.prank(owner);
        uint liquidity0 = amm.addInitialLiquidity(1e20, 1e22);
        assertEq(amm.balanceOf(owner), liquidity0);
        assertEq(amm.totalSupply(), liquidity0);
        assertEq(amm.reserveWeth(), 1e20);
        assertEq(amm.reserveToken(), 1e22);

        // User1 adds liquidity
        vm.prank(user1);
        uint liquidity1 = amm.addLiquidity(1e19, true); // Adding WETH
        assertEq(liquidity0, 10 * liquidity1);
        assertEq(amm.balanceOf(user1), liquidity1);
        assertEq(amm.totalSupply(), liquidity0 + liquidity1); // LP tokens should be liquidity1 + liquidity2
        assertEq(amm.reserveWeth(), 11e19);
        assertEq(amm.reserveToken(), 11e21);
    }

    function testRemoveLiquidity() public {
        // First add initial liquidity
        vm.prank(owner);
        uint liquidity0 = amm.addInitialLiquidity(1e20, 1e22);

        // User1 adds liquidity
        vm.prank(user1);
        uint liquidity1 = amm.addLiquidity(1e19, true); // Adding WETH
        uint liquidity2 = amm.totalSupply();
        assertEq(liquidity0, 10 * liquidity1);
        assertEq(liquidity2, liquidity0 + liquidity1);
        assertEq(amm.balanceOf(user1), liquidity1);
        assertEq(weth.balanceOf(user1), 0);
        assertEq(token.balanceOf(user1), 0);

        // User1 removes liquidity
        vm.prank(user1);
        (uint amountWeth, uint amountToken) = amm.removeLiquidity(liquidity1);
        assertEq(amm.balanceOf(user1), 0);
        assertEq(amountWeth, 1e19);
        assertEq(amountToken, 1e21);
        assertEq(weth.balanceOf(user1), 1e19);
        assertEq(token.balanceOf(user1), 1e21);
    }

    function testSwap() public {
        // First add initial liquidity
        vm.prank(owner);
        amm.addInitialLiquidity(1e20, 1e22);

        uint reserveWeth = amm.reserveWeth();
        uint reserveToken = amm.reserveToken();

        // User1 swaps WETH for TOKEN
        vm.prank(user1);
        (uint amountOut, ) = amm.swap(1e19, address(weth), 0);
        assertGt(amountOut, 0);
        assertEq(amountOut, amm.getAmountOut(1e19, reserveWeth, reserveToken));
    }
}
