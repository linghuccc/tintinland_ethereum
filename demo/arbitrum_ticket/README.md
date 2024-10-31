## ✨ Arbitrum：（二选一）

1）编写一个基于 retryable ticket 系统的 layer1-》layer2 跨链消息系统，需要用户对 l1 合约进行操作，并且通过调用 retryable 来改写 layer2 上合约的状态。

(例子：合约 A 和合约 B 分别位于 l1 和 l2，每次对合约 A 状态的更改都需要更改对应合约 b 的状态。)

2）用 stylus （rust 或者 c/c++语言）重新改写 uniswap v1 或 v2 (或者其他你想要改写的合约)

## 🚀 代码实现

使用 Foundry 框架，部署在 Morph Holesky Testnet: [0xeB96a55Fec508c2F7f51116576F81E7c6c7793CC](https://explorer-holesky.morphl2.io/address/0xeB96a55Fec508c2F7f51116576F81E7c6c7793CC?tab=contract)
