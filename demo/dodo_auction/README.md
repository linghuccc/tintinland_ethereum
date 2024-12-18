## ✨ DoDo：公开拍卖

每个购买者在拍卖期间发送他们的竞标到智能合约。 竞标包括发送资金，以便将购买者与他们的竞标绑定。 如果最高出价被提高，之前的出价者就可以拿回他们的竞标资金。 竞价期结束后，出售人可以手动调用合约，收到他们的收益。

**公开拍卖**

1.每个购买者在拍卖期间发送他们的竞标到智能合约。

2.竞标包括发送资金，以便将购买者与他们的竞标绑定。

3.如果最高出价被提高，之前的出价者就可以拿回他们的竞标资金。

4.竞价期结束后，出售人可以手动调用合约，收到他们的收益。

5 竞拍冷却机制(为防止竞拍者连续快速出价，可以设置一个竞拍冷却期。每个出价者在一次出价后，需要等待一段时间后才能再次出价，让拍卖过程更具策略性。)

## 🚀 在线预览

网站已上线 Vercel，请浏览 https://dodoauction.vercel.app/

### 前端代码

frontend 文件夹：使用 morph starter kit。

已实现的功能：

-   拍卖发起人：发布新拍卖；
-   拍卖参与者：对特定拍卖进行竞价；

待实现的功能：

-   拍卖参与者：提取竞价失败的资金；
-   拍卖发起人：结束拍卖，提取最高出价的资金；

### Solidity 代码

contract 文件夹：使用 Foundry 框架，部署在 Morph Holesky Testnet。

增加了 Contract Factory 合约，用于部署多个 Auction 合约。

| 合约                  | 地址                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract Factory 合约 | [0x9d77341871358892378427e293ED4Bbe0493b9f7](https://explorer-holesky.morphl2.io/address/0x9d77341871358892378427e293ED4Bbe0493b9f7?tab=contract) |
| Auction 合约（范例）  | [0x92c8d7394178aaD687374638ED30fA343D7D144a](https://explorer-holesky.morphl2.io/address/0x92c8d7394178aaD687374638ED30fA343D7D144a?tab=contract) |
