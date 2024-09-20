// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test} from "forge-std/Test.sol";
import {InsertionSort} from "../src/InsertionSort.sol";

contract InsertionSortTest is Test {
    InsertionSort insertionSort;

    function setUp() public {
        insertionSort = new InsertionSort();
    }

    function testSortAlreadySortedArray() public view {
        uint[] memory input = new uint[](5);
        input[0] = 1;
        input[1] = 2;
        input[2] = 3;
        input[3] = 4;
        input[4] = 5;

        uint[] memory expected = new uint[](5);
        expected[0] = 1;
        expected[1] = 2;
        expected[2] = 3;
        expected[3] = 4;
        expected[4] = 5;

        uint[] memory result = insertionSort.sort(input);
        for (uint i = 0; i < expected.length; i++) {
            assertEq(result[i], expected[i]);
        }
    }

    function testSortReverseSortedArray() public view {
        uint[] memory input = new uint[](5);
        input[0] = 5;
        input[1] = 4;
        input[2] = 3;
        input[3] = 2;
        input[4] = 1;

        uint[] memory expected = new uint[](5);
        expected[0] = 1;
        expected[1] = 2;
        expected[2] = 3;
        expected[3] = 4;
        expected[4] = 5;

        uint[] memory result = insertionSort.sort(input);
        for (uint i = 0; i < expected.length; i++) {
            assertEq(result[i], expected[i]);
        }
    }

    function testSortUnsortedArray() public view {
        uint[] memory input = new uint[](5);
        input[0] = 3;
        input[1] = 1;
        input[2] = 4;
        input[3] = 5;
        input[4] = 2;

        uint[] memory expected = new uint[](5);
        expected[0] = 1;
        expected[1] = 2;
        expected[2] = 3;
        expected[3] = 4;
        expected[4] = 5;

        uint[] memory result = insertionSort.sort(input);
        for (uint i = 0; i < expected.length; i++) {
            assertEq(result[i], expected[i]);
        }
    }

    function testSortEmptyArray() public {
        uint[] memory input = new uint[](0);

        vm.expectRevert("No need to sort");
        insertionSort.sort(input);
    }

    function testSortSingleElementArray() public {
        uint[] memory input = new uint[](1);
        input[0] = 42;

        vm.expectRevert("No need to sort");
        insertionSort.sort(input);
    }
}
