// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract InsertionSort {
    // 自定义错误：数据长度不足以排序
    error InsufficientDataLength();

    // 排序函数
    function sort(uint[] memory data) public pure returns (uint[] memory) {
        // 检查数据长度是否小于 2
        if (data.length < 2) revert InsufficientDataLength(); // 如果数据长度小于 2，抛出错误

        // 遍历数据数组，从第二个数值开始
        for (uint i = 1; i < data.length; i++) {
            uint key = data[i]; // 取当前数值作为关键数值
            uint j = i; // 初始化 j 为当前索引 i
            // 当 j 大于 0 并且前一个数值大于关键数值时
            // 将关键数值插入到已排序部分
            while (j > 0 && data[j - 1] > key) {
                data[j] = data[j - 1]; // 将前一个数值移动到当前位置
                j--; // 向左移动 j
            }
            data[j] = key; // 将关键数值放置到正确位置
        }
        return data; // 返回排序后的数组
    }
}
