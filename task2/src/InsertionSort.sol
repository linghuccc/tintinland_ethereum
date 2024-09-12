// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract InsertionSort {
    function sort(uint[] memory data) public pure returns (uint[] memory) {
        for (uint i = 1; i < data.length; i++) {
            uint key = data[i];
            uint j = i;
            while (j > 0 && data[j - 1] > key) {
                data[j] = data[j - 1];
                j--;
            }
            data[j] = key;
        }
        return data;
    }
}
