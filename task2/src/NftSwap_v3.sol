// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NftSwap is ReentrancyGuard {
    struct Order {
        address owner; // 订单拥有者
        uint256 price; // 订单价格
    }

    // 合约地址和 tokenId 到订单的映射
    mapping(address => mapping(uint256 => Order)) public orders;

    // 自定义错误
    error PriceMustBeNonZero();
    error NotTheOwner();
    error ContractNotApproved();
    error OrderDoesNotExist();
    error InsufficientPayment();
    error NotOrderOwner();
    error TransferToSellerFailed();
    error RefundFailed();

    // 列出 NFT 出售
    function list(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external {
        if (price == 0) revert PriceMustBeNonZero(); // 价格必须非零
        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) revert NotTheOwner(); // 必须是拥有者
        if (!nft.isApprovedForAll(msg.sender, address(this)))
            revert ContractNotApproved(); // 合约未被批准

        orders[nftContract][tokenId] = Order({owner: msg.sender, price: price});
    }

    // 撤销订单
    function revoke(address nftContract, uint256 tokenId) external {
        Order storage order = orders[nftContract][tokenId];
        if (order.owner != msg.sender) revert NotOrderOwner(); // 必须是订单拥有者

        delete orders[nftContract][tokenId]; // 删除订单
    }

    // 更新订单价格
    function update(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) external {
        if (newPrice == 0) revert PriceMustBeNonZero(); // 价格必须非零
        Order storage order = orders[nftContract][tokenId];
        if (order.owner != msg.sender) revert NotOrderOwner(); // 必须是订单拥有者

        order.price = newPrice; // 更新价格
    }

    // 购买 NFT
    function purchase(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant {
        Order storage order = orders[nftContract][tokenId];
        if (order.price == 0) revert OrderDoesNotExist(); // 订单不存在
        if (msg.value < order.price) revert InsufficientPayment(); // 付款不足

        address seller = order.owner; // 卖家地址
        uint256 price = order.price; // 订单价格

        delete orders[nftContract][tokenId]; // 清除订单

        // 转移 NFT 到买家
        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);

        // 将付款转给卖家
        (bool success, ) = payable(seller).call{value: price}("");
        if (!success) revert TransferToSellerFailed(); // 转账失败

        // 如果有多余的付款，进行退款
        if (msg.value > price) {
            (success, ) = payable(msg.sender).call{value: msg.value - price}(
                ""
            );
            if (!success) revert RefundFailed(); // 退款失败
        }
    }
}
