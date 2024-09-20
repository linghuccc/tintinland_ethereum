// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test} from "forge-std/Test.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {NftSwap} from "../src/NftSwap_v2.sol";

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

    function setUp() public {
        nftSwap = new NftSwap();
        mockNFT = new MockNFT();

        vm.startPrank(seller);
        tokenId = mockNFT.mint(); // Mint an NFT for testing
        // mockNFT.approve(address(nftSwap), tokenId);
        mockNFT.setApprovalForAll(address(nftSwap), true); // Approve the swap contract to transfer the NFT
        vm.stopPrank();
    }

    function testListNft() public {
        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, 1 ether);

        (address orderOwner, uint orderPrice) = nftSwap.orders(
            address(mockNFT),
            tokenId
        );
        assertEq(orderOwner, seller);
        assertEq(orderPrice, 1 ether);
    }

    function testRevokeOrder() public {
        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, 1 ether);

        vm.prank(seller);
        nftSwap.revoke(address(mockNFT), tokenId);

        (address orderOwner, ) = nftSwap.orders(address(mockNFT), tokenId);
        assertEq(orderOwner, address(0)); // Ensure order is deleted
    }

    function testUpdateOrderPrice() public {
        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, 1 ether);

        vm.prank(seller);
        nftSwap.update(address(mockNFT), tokenId, 2 ether);

        (, uint orderPrice) = nftSwap.orders(address(mockNFT), tokenId);
        assertEq(orderPrice, 2 ether);
    }

    function testPurchaseNft() public {
        uint price = 1 ether;

        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, price);

        vm.deal(buyer, price);
        vm.prank(buyer);
        nftSwap.purchase{value: price}(address(mockNFT), tokenId);

        // Check that the NFT was transferred
        assertEq(mockNFT.ownerOf(tokenId), buyer);

        // Check that the sell had the ether
        assertEq(seller.balance, price);

        (address orderOwner, ) = nftSwap.orders(address(mockNFT), tokenId);
        assertEq(orderOwner, address(0)); // Ensure the order is cleared
    }

    function testPurchaseNftWithRefund() public {
        uint price = 1 ether;

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
        uint price = 1 ether;
        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, price);

        vm.deal(buyer, price / 2);
        vm.prank(buyer);
        vm.expectRevert("Insufficient payment");
        nftSwap.purchase{value: price / 2}(address(mockNFT), tokenId);
    }

    function testOrderDoesNotExist() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        vm.expectRevert("Order does not exist");
        nftSwap.purchase{value: 1 ether}(address(mockNFT), tokenId);
    }

    function testNotOrderOwner() public {
        vm.prank(seller);
        nftSwap.list(address(mockNFT), tokenId, 1 ether);

        vm.prank(buyer);
        vm.expectRevert("Not the order owner");
        nftSwap.revoke(address(mockNFT), tokenId);
    }
}
