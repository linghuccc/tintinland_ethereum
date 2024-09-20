// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NftSwap is ReentrancyGuard {
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
    function purchase(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant {
        Order storage order = orders[nftContract][tokenId];
        require(order.price > 0, "Order does not exist");
        require(msg.value >= order.price, "Insufficient payment");

        // Store the seller's address and the excess payment
        address seller = order.owner;
        uint256 price = order.price;

        // Clear the order before making external calls
        delete orders[nftContract][tokenId];

        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);

        // Transfer payment to seller using call
        (bool success, ) = payable(seller).call{value: price}("");
        require(success, "Transfer to seller failed");

        // Refund excess payment using call
        if (msg.value > price) {
            (success, ) = payable(msg.sender).call{value: msg.value - price}(
                ""
            );
            require(success, "Refund failed");
        }
    }
}
