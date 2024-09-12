// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NftSwap {
    struct Order {
        address owner;
        uint256 price;
    }

    // Mapping from contract address and tokenId to Order
    mapping(address => mapping(uint256 => Order)) public orders;

    // List an NFT for sale
    function list(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external {
        require(price > 0, "Price must be non-zero");
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)),
            "Contract not approved"
        );

        orders[nftContract][tokenId] = Order({owner: msg.sender, price: price});
    }

    // Revoke an order
    function revoke(address nftContract, uint256 tokenId) external {
        Order storage order = orders[nftContract][tokenId];
        require(order.owner == msg.sender, "Not the order owner");

        delete orders[nftContract][tokenId];
    }

    // Update the price of an order
    function update(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) external {
        require(newPrice > 0, "Price must be non-zero");
        Order storage order = orders[nftContract][tokenId];
        require(order.owner == msg.sender, "Not the order owner");

        order.price = newPrice;
    }

    // Purchase an NFT
    function purchase(address nftContract, uint256 tokenId) external payable {
        Order storage order = orders[nftContract][tokenId];
        require(order.price > 0, "Order does not exist");
        require(msg.value >= order.price, "Insufficient payment");

        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(order.owner, msg.sender, tokenId);

        // Transfer payment to seller, refund excess payment
        payable(order.owner).transfer(order.price);

        if (msg.value > order.price) {
            payable(msg.sender).transfer(msg.value - order.price);
        }

        // Clear the order
        delete orders[nftContract][tokenId];
    }
}
