// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test} from "forge-std/Test.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {NftSwap} from "../src/NftSwap.sol";

contract MockNFT is ERC721 {
    uint256 public currentTokenId;

    constructor() ERC721("MockNFT", "MNFT") {}

    function mint() external {
        currentTokenId++;
        _mint(msg.sender, currentTokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://mock-nft.com/";
    }
}

contract NftSwapTest is Test {
    NftSwap nftSwap;
    MockNFT mockNft;

    address seller = address(0x111);
    address buyer = address(0x222);

    function setUp() public {
        nftSwap = new NftSwap();
        mockNft = new MockNFT();
        vm.startPrank(seller);
        mockNft.mint(); // Seller mints an NFT
        vm.stopPrank();
    }

    function testListNFT() public {
        vm.startPrank(seller);
        uint256 tokenId = 1; // The minted token
        uint256 price = 1 ether;

        // Approve the NftSwap contract
        mockNft.setApprovalForAll(address(nftSwap), true);

        // List the NFT
        nftSwap.list(address(mockNft), tokenId, price);

        // Check the order
        // NftSwap.Order memory order = nftSwap.orders[address(mockNft)][tokenId];
        // assertEq(order.owner, seller);
        // assertEq(order.price, price);
        (address orderOwner, uint orderPrice) = nftSwap.orders(
            address(mockNft),
            tokenId
        );
        assertEq(orderOwner, seller);
        assertEq(orderPrice, price);
        vm.stopPrank();
    }

    function testRevokeOrder() public {
        vm.startPrank(seller);
        uint256 tokenId = 1;
        uint256 price = 1 ether;

        mockNft.setApprovalForAll(address(nftSwap), true);
        nftSwap.list(address(mockNft), tokenId, price);

        // Revoke the order
        nftSwap.revoke(address(mockNft), tokenId);

        // Check that the order no longer exists
        // NftSwap.Order memory order = nftSwap.orders[address(mockNft)][tokenId];
        // assertEq(order.owner, address(0)); // Order should be deleted
        // assertEq(order.price, 0);
        (address orderOwner, uint orderPrice) = nftSwap.orders(
            address(mockNft),
            tokenId
        );
        assertEq(orderOwner, address(0)); // Order should be deleted
        assertEq(orderPrice, 0);
        vm.stopPrank();
    }

    function testUpdateOrderPrice() public {
        vm.startPrank(seller);
        uint256 tokenId = 1;
        uint256 price = 1 ether;
        uint256 newPrice = 2 ether;

        mockNft.setApprovalForAll(address(nftSwap), true);
        nftSwap.list(address(mockNft), tokenId, price);

        // Update the order price
        nftSwap.update(address(mockNft), tokenId, newPrice);

        // Check that the price is updated
        // NftSwap.Order memory order = nftSwap.orders[address(mockNft)][tokenId];
        // assertEq(order.price, newPrice);
        (, uint orderPrice) = nftSwap.orders(address(mockNft), tokenId);
        assertEq(orderPrice, newPrice);
        vm.stopPrank();
    }

    function testPurchaseNFT() public {
        vm.startPrank(seller);
        uint256 tokenId = 1;
        uint256 price = 1 ether;

        mockNft.setApprovalForAll(address(nftSwap), true);
        nftSwap.list(address(mockNft), tokenId, price);
        vm.stopPrank();

        // Buyer purchases the NFT
        vm.startPrank(buyer);
        vm.deal(buyer, price); // Give the buyer enough ether
        nftSwap.purchase{value: price}(address(mockNft), tokenId);

        // Check that the buyer is now the owner of the NFT
        assertEq(mockNft.ownerOf(tokenId), buyer);
        // Check that the order is deleted
        // NftSwap.Order memory order = nftSwap.orders[address(mockNft)][tokenId];
        // assertEq(order.owner, address(0));
        // assertEq(order.price, 0);
        (address orderOwner, uint orderPrice) = nftSwap.orders(
            address(mockNft),
            tokenId
        );
        assertEq(orderOwner, address(0));
        assertEq(orderPrice, 0);
        vm.stopPrank();
    }

    function testFailPurchaseWithInsufficientPayment() public {
        vm.startPrank(seller);
        uint256 tokenId = 1;
        uint256 price = 1 ether;

        mockNft.setApprovalForAll(address(nftSwap), true);
        nftSwap.list(address(mockNft), tokenId, price);
        vm.stopPrank();

        // Buyer tries to purchase with insufficient funds
        vm.startPrank(buyer);
        // vm.expectRevert(); // Expect any revert ~ Not working
        vm.expectRevert("Insufficient payment"); // Should work but having error ~ "[Revert] revert: Insufficient payment"
        // vm.expectRevert("revert: Insufficient payment"); // No error
        nftSwap.purchase{value: 0}(address(mockNft), tokenId);
        vm.stopPrank();
    }
}
