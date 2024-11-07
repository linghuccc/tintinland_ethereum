// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ContractFactory} from "../src/ContractFactory.sol";
import {PublicAuction} from "../src/Auction.sol";

contract ContractFactoryTest is Test {
    ContractFactory factory; // 合约工厂实例
    address beneficiary = address(0x123); // 受益人地址
    string title = "auction test";
    string imageUrl =
        "https://img.freepik.com/free-photo/modern-country-houses-construction_1385-16.jpg";

    // 在每个测试之前部署一个新的合约工厂
    function setUp() public {
        factory = new ContractFactory();
    }

    // 测试创建竞拍合约
    function testCreateAuction() public {
        uint256 biddingTime = 1 days; // 竞拍时间设置为 1 天
        uint256 cooldownTime = 1 hours; // 冷却时间设置为 1 小时

        // 创建一个新的竞拍合约
        PublicAuction auction = factory.createAuction(
            beneficiary,
            title,
            imageUrl,
            biddingTime,
            cooldownTime
        );

        // 确保新合约的受益人地址正确
        assertEq(auction.beneficiary(), beneficiary);
        // 确保竞拍结束时间正确
        assertEq(auction.auctionEndTime(), block.timestamp + biddingTime);
        // 确保冷却时间设置正确
        assertEq(auction.cooldownTime(), cooldownTime);
    }

    // 测试获取已创建的竞拍合约
    function testGetAuctions() public {
        uint256 biddingTime = 1 days;
        uint256 cooldownTime = 1 hours;

        // 创建两个竞拍合约
        factory.createAuction(
            beneficiary,
            title,
            imageUrl,
            biddingTime,
            cooldownTime
        );
        factory.createAuction(
            beneficiary,
            title,
            imageUrl,
            biddingTime,
            cooldownTime
        );

        // 获取已创建的竞拍合约数组
        PublicAuction[] memory auctions = factory.getAuctions();

        // 确保数量正确
        assertEq(auctions.length, 2);
    }
}
