# Task 2

## Practice 02: Insertion Sort

使用 Solidity 实现一个插入排序算法

排序算法解决的问题是将无序的一组数字，例如[2, 5, 3, 1]，从小到大依次排列好。插入排序（InsertionSort）是最简单的一种排序算法，也是很多人学习的第一个算法。它的思路很简单，从前往后，依次将每一个数和排在他前面的数字比大小，如果比前面的数字小，就互换位置。

Version Updates:

-   **v2**: Update **"require()"** statements to **custom errors**.

## Practice 03: NFT Swap

使用 Solidity 实现一个 NFT Swap

利用智能合约搭建一个零手续费的去中心化 NFT 交易所，主要逻辑：

-   卖家：出售 NFT 的一方，可以挂单 list、撤单 revoke、修改价格 update。

-   买家：购买 NFT 的一方，可以购买 purchase。

-   订单：卖家发布的 NFT 链上订单，一个系列的同一 tokenId 最多存在一个订单，其中包含挂单价格 price 和持有人 owner 信息。当一个订单交易完成或被撤单后，其中信息清零。

Version Updates:

-   **v2**: Add **ReentrancyGuard** for purchase() function; Update all **"payable(account).transfer()"** to **"(account).call{value: amount}()"**.
-   **v3**: Update all **"require()"** statements to **custom errors**.
