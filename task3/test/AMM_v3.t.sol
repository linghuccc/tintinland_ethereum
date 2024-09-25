// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AMM} from "../src/AMM_v3.sol";
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

    address public owner = address(0x999);
    address public user1 = address(0x123);
    address public user2 = address(0x456);

    uint public amountWethOwner = 100 ether;
    uint public amountTokenOwner = 2000 * 10 ** 18;
    uint public amountWethUser1 = 10 ether;
    uint public amountTokenUser1 = 200 * 10 ** 18;
    uint public amountWethUser2 = 1 ether;
    uint public amountTokenUser2 = 20 * 10 ** 18;
    uint public amountWethTotal =
        amountWethOwner + amountWethUser1 + amountWethUser2;
    uint public amountTokenTotal =
        amountTokenOwner + amountTokenUser1 + amountTokenUser2;

    function setUp() public {
        // Deploy mock tokens
        vm.startPrank(owner);
        weth = new MockToken(amountWethTotal); // 111 WETH
        token = new MockToken(amountTokenTotal); // 2220 Token

        // Transfer tokens to users
        weth.transfer(user1, amountWethUser1); // 10 WETH for user1
        token.transfer(user1, amountTokenUser1); // 200 Token for user1
        weth.transfer(user2, amountWethUser2); // 1 WETH for user2
        token.transfer(user2, amountTokenUser2); // 20 Token for user2

        // Deploy AMM contract
        amm = new AMM(address(weth), address(token));

        // Allow AMM to spend owner's tokens
        weth.approve(address(amm), type(uint256).max);
        token.approve(address(amm), type(uint256).max);
        vm.stopPrank();

        // Allow AMM to spend user1's tokens
        vm.startPrank(user1);
        weth.approve(address(amm), type(uint256).max);
        token.approve(address(amm), type(uint256).max);
        vm.stopPrank();

        // Allow AMM to spend user2's tokens
        vm.startPrank(user2);
        weth.approve(address(amm), type(uint256).max);
        token.approve(address(amm), type(uint256).max);
        vm.stopPrank();
    }

    function testAddInitialLiquidity() public {
        vm.prank(owner);
        uint liquidity = amm.addInitialLiquidity(
            amountWethOwner,
            amountTokenOwner
        );
        assertEq(amm.balanceOf(owner), liquidity);
        assertEq(amm.totalSupply(), liquidity);
        assertEq(amm.reserveWeth(), amountWethOwner);
        assertEq(amm.reserveToken(), amountTokenOwner);
    }

    function testAddLiquidity() public {
        // First add initial liquidity
        vm.prank(owner);
        uint liquidity0 = amm.addInitialLiquidity(
            amountWethOwner,
            amountTokenOwner
        );
        assertEq(amm.balanceOf(owner), liquidity0);
        assertEq(amm.totalSupply(), liquidity0);
        assertEq(amm.reserveWeth(), amountWethOwner);
        assertEq(amm.reserveToken(), amountTokenOwner);

        // User1 adds liquidity
        vm.prank(user1);
        uint liquidity1 = amm.addLiquidity(amountWethUser1, true); // Adding WETH
        assertApproxEqAbs(liquidity0, 10 * liquidity1, 10);
        assertEq(amm.balanceOf(user1), liquidity1);
        assertEq(amm.totalSupply(), liquidity0 + liquidity1); // LP tokens should be liquidity1 + liquidity2
        assertEq(amm.reserveWeth(), amountWethOwner + amountWethUser1);
        assertEq(amm.reserveToken(), amountTokenOwner + amountTokenUser1);
    }

    function testRemoveLiquidity() public {
        // First add initial liquidity
        vm.prank(owner);
        uint liquidity0 = amm.addInitialLiquidity(
            amountWethOwner,
            amountTokenOwner
        );

        // User1 adds liquidity
        vm.prank(user1);
        uint liquidity1 = amm.addLiquidity(amountWethUser1, true); // Adding WETH
        uint liquidity2 = amm.totalSupply();
        assertApproxEqAbs(liquidity0, 10 * liquidity1, 10);
        assertEq(liquidity2, liquidity0 + liquidity1);
        assertEq(amm.balanceOf(user1), liquidity1);
        assertEq(weth.balanceOf(user1), 0);
        assertEq(token.balanceOf(user1), 0);

        // User1 removes liquidity
        vm.prank(user1);
        (uint amountWeth, uint amountToken) = amm.removeLiquidity(liquidity1);
        assertEq(amm.balanceOf(user1), 0, "User 1 liquidity should be zero");
        assertApproxEqAbs(
            amountWeth,
            amountWethUser1,
            1,
            "User 1 WETH amount check failed"
        );
        assertApproxEqAbs(
            amountToken,
            amountTokenUser1,
            1,
            "User 1 token amount check failed"
        );
        assertApproxEqAbs(
            weth.balanceOf(user1),
            amountWethUser1,
            1,
            "User 1 WETH balance check failed"
        );
        assertApproxEqAbs(
            token.balanceOf(user1),
            amountTokenUser1,
            1,
            "User 1 token balance check failed"
        );
    }

    function testSwap() public {
        // First add initial liquidity
        vm.prank(owner);
        amm.addInitialLiquidity(amountWethOwner, amountTokenOwner);

        uint reserveWeth = amm.reserveWeth();
        uint reserveToken = amm.reserveToken();

        // User1 swaps WETH for TOKEN
        vm.prank(user1);
        (uint amountOut, ) = amm.swap(amountWethUser1, address(weth), 0);
        assertGt(amountOut, 0);
        assertEq(
            amountOut,
            amm.getAmountOut(amountWethUser1, reserveWeth, reserveToken)
        );
    }
}
