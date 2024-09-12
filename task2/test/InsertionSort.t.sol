// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test} from "forge-std/Test.sol";
import {InsertionSort} from "../src/InsertionSort.sol";

contract InsertionSortTest is Test {
    InsertionSort insertionSort;

    function setUp() public {
        insertionSort = new InsertionSort();
    }

    function testSort() public view {
        uint[] memory unsortedArray = new uint[](4);
        unsortedArray[0] = 2;
        unsortedArray[1] = 5;
        unsortedArray[2] = 3;
        unsortedArray[3] = 1;

        uint[] memory expectedArray = new uint[](4);
        expectedArray[0] = 1;
        expectedArray[1] = 2;
        expectedArray[2] = 3;
        expectedArray[3] = 5;

        uint[] memory sortedArray = insertionSort.sort(unsortedArray);

        for (uint i = 0; i < sortedArray.length; i++) {
            assertEq(
                sortedArray[i],
                expectedArray[i],
                "Array is not sorted correctly"
            );
        }
    }
}
