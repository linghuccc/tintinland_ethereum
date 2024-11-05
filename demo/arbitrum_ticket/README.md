## ✨ Arbitrum：

编写一个基于 retryable ticket 系统的 layer1-》layer2 跨链消息系统，需要用户对 l1 合约进行操作，并且通过调用 retryable 来改写 layer2 上合约的状态。

(例子：合约 A 和合约 B 分别位于 l1 和 l2，每次对合约 A 状态的更改都需要更改对应合约 b 的状态。)

## 🚀 代码实现

使用 Hardhat 框架，部署在 Sepolia Testnet 和 Arbitrum Sepolia Testnet。

完成以下类型的数据 layer1-》layer2 的跨链调用：

-   boolean
-   uint256
-   address
-   string
