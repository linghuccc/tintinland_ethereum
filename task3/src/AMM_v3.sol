// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AMM is ERC20, Ownable {
    // Custom errors
    error ZeroLiquidity();
    error InsufficientWethAllowance();
    error InsufficientTokenAllowance();
    error NoLiquidityYet();
    error InsufficientLiquidityMinted();
    error InsufficientLiquidityBurned();
    error InsufficientAmount();
    error InsufficientLiquidity();
    error InsufficientOutputAmount();
    error InvalidToken();

    // Token contracts
    IERC20 public weth;
    IERC20 public token;

    // Token reserves
    uint public reserveWeth;
    uint public reserveToken;

    // Events
    event Mint(address indexed account, uint amountWeth, uint amountToken);
    event Burn(address indexed account, uint amountWeth, uint amountToken);
    event Swap(
        address indexed account,
        uint amountIn,
        address tokenIn,
        uint amountOut,
        address tokenOut
    );

    // Constructor to initialize token addresses and liquidity
    constructor(
        address addrWeth,
        address addrToken
    ) ERC20("Automated Market Maker", "AMM") Ownable(_msgSender()) {
        weth = IERC20(addrWeth);
        token = IERC20(addrToken);
    }

    // Get the minimum of two numbers
    function min(uint x, uint y) internal pure returns (uint z) {
        z = x < y ? x : y;
    }

    // Calculate square root using Babylonian method
    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    // Add initial liquidity, transfer tokens, and mint LP tokens
    function addInitialLiquidity(
        uint amountWethDesired,
        uint amountTokenDesired
    ) public onlyOwner returns (uint liquidity) {
        if (amountWethDesired == 0 || amountTokenDesired == 0)
            revert ZeroLiquidity();

        address sender = _msgSender();

        if (weth.allowance(sender, address(this)) < amountWethDesired)
            revert InsufficientWethAllowance();
        if (token.allowance(sender, address(this)) < amountTokenDesired)
            revert InsufficientTokenAllowance();

        weth.transferFrom(sender, address(this), amountWethDesired);
        token.transferFrom(sender, address(this), amountTokenDesired);

        liquidity = sqrt(amountWethDesired * amountTokenDesired);

        reserveWeth = weth.balanceOf(address(this));
        reserveToken = token.balanceOf(address(this));

        _mint(sender, liquidity);

        emit Mint(sender, amountWethDesired, amountTokenDesired);
    }

    // Add liquidity, transfer tokens, and mint LP tokens
    function addLiquidity(
        uint amount,
        bool isWETH
    ) public returns (uint liquidity) {
        if (amount == 0) revert ZeroLiquidity();

        uint _totalSupply = totalSupply();
        if (_totalSupply == 0) revert NoLiquidityYet();

        uint amountWethDesired;
        uint amountTokenDesired;

        if (isWETH) {
            amountWethDesired = amount;
            amountTokenDesired = (amount * reserveToken) / reserveWeth;
        } else {
            amountWethDesired = (amount * reserveWeth) / reserveToken;
            amountTokenDesired = amount;
        }

        address sender = _msgSender();

        if (weth.allowance(sender, address(this)) < amountWethDesired)
            revert InsufficientWethAllowance();
        if (token.allowance(sender, address(this)) < amountTokenDesired)
            revert InsufficientTokenAllowance();

        weth.transferFrom(sender, address(this), amountWethDesired);
        token.transferFrom(sender, address(this), amountTokenDesired);

        liquidity = min(
            (amountWethDesired * _totalSupply) / reserveWeth,
            (amountTokenDesired * _totalSupply) / reserveToken
        );

        if (liquidity == 0) revert InsufficientLiquidityMinted();

        reserveWeth = weth.balanceOf(address(this));
        reserveToken = token.balanceOf(address(this));

        _mint(sender, liquidity);

        emit Mint(sender, amountWethDesired, amountTokenDesired);
    }

    // Remove liquidity, burn LP tokens, and transfer tokens
    function removeLiquidity(
        uint liquidity
    ) external returns (uint amountWeth, uint amountToken) {
        uint balanceWeth = weth.balanceOf(address(this));
        uint balanceToken = token.balanceOf(address(this));

        uint _totalSupply = totalSupply();
        amountWeth = (liquidity * balanceWeth) / _totalSupply;
        amountToken = (liquidity * balanceToken) / _totalSupply;

        if (amountWeth == 0 || amountToken == 0)
            revert InsufficientLiquidityBurned();

        _burn(_msgSender(), liquidity);

        weth.transfer(_msgSender(), amountWeth);
        token.transfer(_msgSender(), amountToken);

        reserveWeth = weth.balanceOf(address(this));
        reserveToken = token.balanceOf(address(this));

        emit Burn(_msgSender(), amountWeth, amountToken);
    }

    // Calculate the output amount for a given input amount and reserves
    function getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) public pure returns (uint amountOut) {
        if (amountIn == 0) revert InsufficientAmount();
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();

        amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
    }

    // Swap tokens
    function swap(
        uint amountIn,
        address addrTokenIn,
        uint amountOutMin
    ) external returns (uint amountOut, IERC20 tokenOut) {
        if (amountIn == 0) revert InsufficientOutputAmount();
        IERC20 tokenIn = IERC20(addrTokenIn);
        if (tokenIn != weth && tokenIn != token) revert InvalidToken();

        uint balanceWeth = weth.balanceOf(address(this));
        uint balanceToken = token.balanceOf(address(this));

        if (tokenIn == weth) {
            tokenOut = token;
            amountOut = getAmountOut(amountIn, balanceWeth, balanceToken);
            if (amountOut <= amountOutMin) revert InsufficientOutputAmount();

            tokenIn.transferFrom(_msgSender(), address(this), amountIn);
            tokenOut.transfer(_msgSender(), amountOut);
        } else {
            tokenOut = weth;
            amountOut = getAmountOut(amountIn, balanceToken, balanceWeth);
            if (amountOut <= amountOutMin) revert InsufficientOutputAmount();

            tokenIn.transferFrom(_msgSender(), address(this), amountIn);
            tokenOut.transfer(_msgSender(), amountOut);
        }

        reserveWeth = weth.balanceOf(address(this));
        reserveToken = token.balanceOf(address(this));

        emit Swap(
            _msgSender(),
            amountIn,
            address(tokenIn),
            amountOut,
            address(tokenOut)
        );
    }
}
