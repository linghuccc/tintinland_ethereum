// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AMM is ERC20, Ownable {
    // 代币合约
    IERC20 public weth;
    IERC20 public token;

    // 代币储备量
    uint public reserveWeth;
    uint public reserveToken;

    // 事件
    event Mint(address indexed account, uint amountWeth, uint amountToken);
    event Burn(address indexed account, uint amountWeth, uint amountToken);
    event Swap(
        address indexed account,
        uint amountIn,
        address tokenIn,
        uint amountOut,
        address tokenOut
    );

    // 构造器，初始化代币地址和流动性
    constructor(
        address addrWeth,
        address addrToken
    ) ERC20("Automated Market Maker", "AMM") Ownable(_msgSender()) {
        weth = IERC20(addrWeth);
        token = IERC20(addrToken);
    }

    // 取两个数的最小值
    function min(uint x, uint y) internal pure returns (uint z) {
        z = x < y ? x : y;
    }

    // 计算平方根 babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
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

    // 添加初始流动性，转进代币，铸造 LP
    function addInitialLiquidity(
        uint amountWethDesired,
        uint amountTokenDesired
    ) public onlyOwner returns (uint liquidity) {
        // 检查添加代币数量是否为 0
        require(
            (amountWethDesired != 0) && (amountTokenDesired != 0),
            "Cannot add zero liquidity"
        );

        address sender = _msgSender();

        // 检查 WETH 的授权
        require(
            weth.allowance(sender, address(this)) >= amountWethDesired,
            "Insufficient WETH allowance"
        );

        // 检查 Token 的授权
        require(
            token.allowance(sender, address(this)) >= amountTokenDesired,
            "Insufficient Token allowance"
        );

        // 将添加的流动性转入 Swap 合约
        weth.transferFrom(sender, address(this), amountWethDesired);
        token.transferFrom(sender, address(this), amountTokenDesired);

        // 计算添加的流动性
        liquidity = sqrt(amountWethDesired * amountTokenDesired);

        // 更新储备量
        reserveWeth = weth.balanceOf(address(this));
        reserveToken = token.balanceOf(address(this));

        // 给初始流动性提供者铸造 LP 代币，代表他提供的流动性
        _mint(sender, liquidity);

        emit Mint(sender, amountWethDesired, amountTokenDesired);
    }

    // 添加流动性，转进代币，铸造 LP
    // 铸造的 LP 数量 = min(amountWeth/reserveWeth, amountToken/reserveToken)* totalSupply_LP
    // @param amount 添加的 WETH / Token 数量
    // @param isWETH 添加的是否 WETH 代币
    function addLiquidity(
        uint amount,
        bool isWETH
    ) public returns (uint liquidity) {
        // 检查添加代币数量是否为 0
        require(amount != 0, "Cannot add zero liquidity");

        // 检查是否首次添加流动性
        uint _totalSupply = totalSupply();
        require(
            _totalSupply != 0,
            "Please wait for admin to add liquidity first"
        );

        // 计算出添加 WETH 和 Token 的数量
        uint amountWethDesired; // 添加的 WETH 数量
        uint amountTokenDesired; // 添加的 Token 数量

        if (isWETH) {
            amountWethDesired = amount;
            amountTokenDesired = (amount * reserveToken) / reserveWeth;
        } else {
            amountWethDesired = (amount * reserveWeth) / reserveToken;
            amountTokenDesired = amount;
        }

        address sender = _msgSender();

        // 检查 WETH 的授权
        require(
            weth.allowance(sender, address(this)) >= amountWethDesired,
            "Insufficient WETH allowance"
        );

        // 检查 Token 的授权
        require(
            token.allowance(sender, address(this)) >= amountTokenDesired,
            "Insufficient Token allowance"
        );

        // 将添加的流动性转入 Swap 合约
        weth.transferFrom(sender, address(this), amountWethDesired);
        token.transferFrom(sender, address(this), amountTokenDesired);

        // 计算添加的流动性，按添加代币的数量比例铸造 LP，取两个代币更小的那个比例
        liquidity = min(
            (amountWethDesired * _totalSupply) / reserveWeth,
            (amountTokenDesired * _totalSupply) / reserveToken
        );

        // 检查铸造的 LP 数量
        require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_MINTED");

        // 更新储备量
        reserveWeth = weth.balanceOf(address(this));
        reserveToken = token.balanceOf(address(this));

        // 给流动性提供者铸造 LP 代币，代表他们提供的流动性
        _mint(sender, liquidity);

        emit Mint(sender, amountWethDesired, amountTokenDesired);
    }

    // 移除流动性，销毁 LP，转出代币
    // 转出数量 = (liquidity / totalSupply_LP) * reserve
    // @param liquidity 移除的流动性数量
    function removeLiquidity(
        uint liquidity
    ) external returns (uint amountWeth, uint amountToken) {
        // 获取余额
        uint balanceWeth = weth.balanceOf(address(this));
        uint balanceToken = token.balanceOf(address(this));

        // 按 LP 的比例计算要转出的代币数量
        uint _totalSupply = totalSupply();
        amountWeth = (liquidity * balanceWeth) / _totalSupply;
        amountToken = (liquidity * balanceToken) / _totalSupply;

        // 检查代币数量
        require(
            amountWeth > 0 && amountToken > 0,
            "INSUFFICIENT_LIQUIDITY_BURNED"
        );

        // 销毁 LP
        _burn(_msgSender(), liquidity);

        // 转出代币
        weth.transfer(_msgSender(), amountWeth);
        token.transfer(_msgSender(), amountToken);

        // 更新储备量
        reserveWeth = weth.balanceOf(address(this));
        reserveToken = token.balanceOf(address(this));

        emit Burn(_msgSender(), amountWeth, amountToken);
    }

    // 给定一个资产的数量和代币对的储备，计算交换另一个代币的数量
    // 由于乘积恒定
    // 交换前: k = x * y
    // 交换后: k = (x + delta_x) * (y - delta_y)
    // 可得 delta_y = delta_x * y / (x + delta_x)
    function getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) public pure returns (uint amountOut) {
        require(amountIn > 0, "INSUFFICIENT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");
        amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
    }

    // swap 代币
    // @param amountIn 用于交换的代币数量
    // @param addrTokenIn 用于交换的代币合约地址
    // @param amountOutMin 交换出另一种代币的最低数量
    function swap(
        uint amountIn,
        address addrTokenIn,
        uint amountOutMin
    ) external returns (uint amountOut, IERC20 tokenOut) {
        require(amountIn > 0, "INSUFFICIENT_OUTPUT_AMOUNT");
        IERC20 tokenIn = IERC20(addrTokenIn);
        require(tokenIn == weth || tokenIn == token, "INVALID_TOKEN");

        uint balanceWeth = weth.balanceOf(address(this));
        uint balanceToken = token.balanceOf(address(this));

        if (tokenIn == weth) {
            // 如果是 WETH 交换 Token
            tokenOut = token;
            // 计算能交换出的 Token 数量
            amountOut = getAmountOut(amountIn, balanceWeth, balanceToken);
            require(amountOut > amountOutMin, "INSUFFICIENT_OUTPUT_AMOUNT");
            // 进行交换
            tokenIn.transferFrom(_msgSender(), address(this), amountIn);
            tokenOut.transfer(_msgSender(), amountOut);
        } else {
            // 如果是 Token 交换 WETH
            tokenOut = weth;
            // 计算能交换出的 WETH 数量
            amountOut = getAmountOut(amountIn, balanceToken, balanceWeth);
            require(amountOut > amountOutMin, "INSUFFICIENT_OUTPUT_AMOUNT");
            // 进行交换
            tokenIn.transferFrom(_msgSender(), address(this), amountIn);
            tokenOut.transfer(_msgSender(), amountOut);
        }

        // 更新储备量
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
