// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {InsertionSort} from "../src/InsertionSort_v2.sol";

contract InsertionSortTest is Test {
    InsertionSort sorter;

    function setUp() public {
        sorter = new InsertionSort(); // 实例化排序合约
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

        uint[] memory result = sorter.sort(input); // 调用排序函数

        // 验证排序结果
        for (uint i = 0; i < expected.length; i++) {
            assertEq(result[i], expected[i]); // 断言每个元素的值是否相等
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

        uint[] memory result = sorter.sort(input); // 调用排序函数

        // 验证排序结果
        for (uint i = 0; i < expected.length; i++) {
            assertEq(result[i], expected[i]); // 断言每个元素的值是否相等
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

        uint[] memory result = sorter.sort(input); // 调用排序函数

        // 验证排序结果
        for (uint i = 0; i < expected.length; i++) {
            assertEq(result[i], expected[i]); // 断言每个元素的值是否相等
        }
    }

    function testSortEmptyArray() public {
        // 测试数据长度不足的情况
        uint[] memory input = new uint[](0); // 创建一个空数组

        // 断言调用排序函数时会抛出自定义错误
        vm.expectRevert(InsertionSort.InsufficientDataLength.selector);
        sorter.sort(input); // 调用排序函数，预期会抛出错误
    }

    function testSortSingleElementArray() public {
        // 测试数据长度不足的情况
        uint[] memory input = new uint[](1);
        input[0] = 42;

        // 断言调用排序函数时会抛出自定义错误
        vm.expectRevert(InsertionSort.InsufficientDataLength.selector);
        sorter.sort(input); // 调用排序函数，预期会抛出错误
    }

    function testSortWithTwoElements() public view {
        uint[] memory input = new uint[](2);
        input[0] = 2;
        input[1] = 1;

        uint[] memory expected = new uint[](2);
        expected[0] = 1;
        expected[1] = 2;

        uint[] memory sorted = sorter.sort(input); // 调用排序函数

        for (uint i = 0; i < expected.length; i++) {
            assertEq(sorted[i], expected[i]); // 断言每个元素的值是否相等
        }
    }
}
