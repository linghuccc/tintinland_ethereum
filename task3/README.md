# Task 3

## Practice 02: WETH

实现一个 WETH，将 ETH 包装成 ERC20

WETH (Wrapped ETH) 是 ETH 的包装版本。由于以太币本身并不符合 ERC20 标准，导致与其他代币之间的互操作性较弱，难以用于去中心化应用程序（dApps）。

本练习要求实现一个符合 ERC20 标准的 WETH ，它比普通的 ERC20 多了两个功能：存款和取款，通过这两个功能，WETH 可以 1:1 兑换 ETH。

Version Updates:

-   **v2**: Update all **"require()"** statements to **custom errors**.
-   **v3**: Update all **"payable(account).transfer()"** to **"(account).call{value: amount}()"**; Add **ReentrancyGuard** for withdraw() function.

## Practice 03: AMM

实现一个基于常数乘积的 AMM 流动性池

自动做市商（Automated Market Maker，AMM）是一种智能合约，它允许数字资产之间的去中心化交易。AMM 的引入开创了一种全新的交易方式，无需传统的买家和卖家进行订单匹配，而是通过一种预设的数学公式（比如，常数乘积公式）创建一个流动性池，使得用户可以随时进行交易。

本练习只要求实现一个 WETH 的流动性池，初始化时确定另一种 ERC20 代币。

PS：可以参考 Uniswap V2 版本

Version Updates:

-   **v2**: Split **"addLiquidity()"** function to **"addInitialLiquidity()"** and **"addLiquidity()"**.
-   **v3**: Update all **"require()"** statements to **custom errors**.
