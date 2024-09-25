// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {NftSwap} from "../src/NftSwap_v3.sol";

contract MockNFT is ERC721 {
    uint256 public nextTokenId;

    constructor() ERC721("MockNFT", "MNFT") {}

    function mint() external returns (uint256) {
        uint256 tokenId = nextTokenId;
        _mint(msg.sender, tokenId);
        nextTokenId++;
        return tokenId;
    }
}

contract NftSwapTest is Test {
    NftSwap nftSwap;
    MockNFT mockNFT;

    address seller = address(0x123);
    address buyer = address(0x456);
    uint256 tokenId;

    uint256 price = 1 ether;

    function setUp() public {
        mockNFT = new MockNFT(); // 创建 Mock NFT 合约
        nftSwap = new NftSwap(); // 创建 NFT Swap 合约

        // seller 铸造 NFT
        vm.startPrank(seller);
        tokenId = mockNFT.mint(); // 铸造 tokenId 0
        // mockNFT.approve(address(nftSwap), tokenId); // 授权 NFT Swap 合约操作 tokenId 0
        mockNFT.setApprovalForAll(address(nftSwap), true);
        vm.stopPrank();
    }

    function testListNft() public {
        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, price); // 列出 NFT

        // 验证订单是否被正确创建
        (address orderOwner, uint orderPrice) = nftSwap.orders(
            address(mockNFT),
            tokenId
        );
        assertEq(orderOwner, seller); // 验证订单拥有者
        assertEq(orderPrice, price); // 验证价格
    }

    function testRevokeOrder() public {
        vm.startPrank(seller);
        nftSwap.list(address(mockNFT), tokenId, price); // 列出 NFT

        nftSwap.revoke(address(mockNFT), tokenId); // 撤销订单
        vm.stopPrank();

        // 验证订单是否被删除
        (address orderOwner, ) = nftSwap.orders(address(mockNFT), tokenId);
        assertEq(orderOwner, address(0)); // 验证订单被删除
    }

    function testUpdateOrderPrice() public {
        uint256 newPrice = 2 ether;

        vm.startPrank(seller);
        nftSwap.list(address(mockNFT), tokenId, price);

        nftSwap.update(address(mockNFT), tokenId, newPrice);
        vm.stopPrank();

        // 验证价格是否被更新
        (, uint orderPrice) = nftSwap.orders(address(mockNFT), tokenId);
        assertEq(orderPrice, newPrice); // 验证新价格
    }

    function testPurchaseNft() public {
        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, price); // 列出NFT

        // 用户需要发送足够的以太币购买 NFT
        vm.deal(buyer, price);

        vm.prank(buyer);
        nftSwap.purchase{value: price}(address(mockNFT), tokenId); // 购买 NFT

        // 验证 NFT 的拥有权
        assertEq(mockNFT.ownerOf(tokenId), buyer); // 验证 NFT 拥有者是 buyer

        // Check that the sell had the ether
        assertEq(seller.balance, price);

        (address orderOwner, ) = nftSwap.orders(address(mockNFT), tokenId);
        assertEq(orderOwner, address(0)); // 验证订单被删除
    }

    function testPurchaseNftWithRefund() public {
        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, price);

        uint256 excessAmount = 2 ether;

        // Buyer purchases the NFT with excess payment
        vm.deal(buyer, excessAmount);
        vm.prank(buyer);
        nftSwap.purchase{value: excessAmount}(address(mockNFT), tokenId);

        // Check that the NFT was transferred
        assertEq(mockNFT.ownerOf(tokenId), buyer);

        // Check that the sell had the ether
        assertEq(seller.balance, price);

        // Check that the buyer had excess ether
        assertEq(buyer.balance, excessAmount - price);

        // Ensure the order is cleared
        (address orderOwner, ) = nftSwap.orders(address(mockNFT), tokenId);
        assertEq(orderOwner, address(0)); // Ensure the order is cleared
    }

    function testInsufficientPayment() public {
        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, price); // 列出NFT

        vm.deal(buyer, price / 2);

        // 用户尝试以不足的付款购买 NFT
        vm.prank(buyer);
        // 预期抛出不足付款的错误
        vm.expectRevert(NftSwap.InsufficientPayment.selector);
        nftSwap.purchase{value: price / 2}(address(mockNFT), tokenId); // 尝试购买
    }

    function testOrderDoesNotExist() public {
        vm.deal(buyer, price);

        vm.prank(buyer);
        vm.expectRevert(NftSwap.OrderDoesNotExist.selector);
        nftSwap.purchase{value: price}(address(mockNFT), tokenId);
    }

    function testNotOrderOwner() public {
        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, price); // 列出 NFT

        // 用户尝试撤销非自己拥有的订单
        vm.prank(buyer);
        // 预期抛出不是订单拥有者的错误
        vm.expectRevert(NftSwap.NotOrderOwner.selector);
        nftSwap.revoke(address(mockNFT), tokenId); // 尝试撤销订单
    }
}
