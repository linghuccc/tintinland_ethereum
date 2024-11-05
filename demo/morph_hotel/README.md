## ✨ Morph：根据提供的指南开发一个基于 Morph 的去中心化酒店预定 app

https://morph.ghost.io/developer-guide-building-a-decentralized-hotel-booking-system-on-morph-2/

## 🚀 在线预览

网站已上线 Vercel，请浏览 https://morphhotel.vercel.app/

### 前端代码

frontend 文件夹：使用 morph starter kit。

更新了以下界面：

-   网页 icon；
-   房间图片显示界面（调整图片大小，增加 Room ID 显示、代币类型显示）；
-   pop up box 界面（下拉菜单、Radio button、日期选择菜单，将 Room ID 设为不可更改）

添加 / 完善了以下功能：

-   区分管理员和普通用户的界面；
-   管理员 Set Availability 的功能；
-   Book Room 的功能（可以指定 check-in date，duration）；

### Solidity 代码

contract 文件夹：使用 Foundry 框架，部署在 Morph Holesky Testnet。

使用了教程中的大部分代码，根据实际 app 进行了部分修改（主要是 Book Room 部分）。

| 合约               | 地址                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Token 合约         | [0x3694b20E27246725B472a0cB601D642f057e8fde](https://explorer-holesky.morphl2.io/address/0x3694b20E27246725B472a0cB601D642f057e8fde?tab=contract) |
| Hotel Booking 合约 | [0xE82b4A48A333b09Cf279494A24B02A58dc104c3c](https://explorer-holesky.morphl2.io/address/0xE82b4A48A333b09Cf279494A24B02A58dc104c3c?tab=contract) |
