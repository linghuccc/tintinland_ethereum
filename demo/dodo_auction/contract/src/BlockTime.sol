// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BlockTime {
    function getBlockTime() external view returns (uint256) {
        return block.timestamp;
    }
}
