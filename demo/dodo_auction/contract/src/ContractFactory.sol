// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PublicAuction} from "./Auction.sol"; // 导入 PublicAuction 合约

contract ContractFactory {
    PublicAuction[] public auctions; // 存储所有已部署的 PublicAuction 合约

    // 创建新的竞拍合约
    function createAuction(
        address _beneficiary,
        string memory _title,
        string memory _imageUrl,
        uint256 _biddingTime,
        uint256 _cooldownTime
    ) external returns (PublicAuction) {
        // 部署新的 PublicAuction 合约
        PublicAuction newAuction = new PublicAuction(
            _beneficiary,
            _title,
            _imageUrl,
            _biddingTime,
            _cooldownTime
        );
        auctions.push(newAuction); // 将新合约添加到数组中
        return newAuction; // 返回新创建的合约地址
    }

    // 获取所有已部署的竞拍合约
    function getAuctions() external view returns (PublicAuction[] memory) {
        return auctions; // 返回所有竞拍合约的地址
    }
}
