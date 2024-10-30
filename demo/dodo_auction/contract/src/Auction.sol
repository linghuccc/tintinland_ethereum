// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PublicAuction {
    address public beneficiary; // 受益人地址
    uint256 public auctionEndTime; // 竞拍结束时间
    uint256 public cooldownTime; // 竞拍冷却时间
    address public highestBidder; // 当前最高的竞标者地址
    uint256 public highestBid; // 当前最高的竞标
    mapping(address => uint256) public pendingReturns; // 记录每个竞标者的待返还金额
    mapping(address => uint256) public lastBidTime; // 记录每个竞标者最后一次出价时间
    bool public auctionFinalized; // 竞拍是否已结束标志

    // 事件，用于通知出价
    event NewHighestBid(address indexed bidder, uint256 amount);
    // 事件，当竞拍结束时触发
    event AuctionEnded(address indexed winner, uint256 amount);

    // 构造函数，初始化受益人、竞拍时间和冷却时间
    constructor(
        address _beneficiary,
        uint256 _biddingTime,
        uint256 _cooldownTime
    ) {
        beneficiary = _beneficiary; // 设置受益人
        auctionEndTime = block.timestamp + _biddingTime; // 设置竞拍结束时间
        cooldownTime = _cooldownTime; // 设置冷却时间
    }

    // 竞标函数
    function bid() external payable {
        require(block.timestamp < auctionEndTime, "Auction has ended."); // 确保竞拍未结束
        require(msg.value > highestBid, "Bid amount must be higher."); // 确保出价高于当前最高出价
        require(
            block.timestamp >= lastBidTime[msg.sender] + cooldownTime,
            "You must wait before bidding again."
        ); // 检查冷却时间

        // 如果有更高的出价，退还之前竞标者的资金; 用 `!=` 比 `>` 节省一点 gas
        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid; // 记录待返还的金额
        }

        // 更新最高的竞标者地址和最高出价
        highestBidder = msg.sender;
        highestBid = msg.value;

        lastBidTime[msg.sender] = block.timestamp; // 更新最后出价时间
        emit NewHighestBid(msg.sender, msg.value); // 触发出价事件
    }

    // 提取资金函数
    function withdraw() external {
        uint256 amount = pendingReturns[msg.sender]; // 获取待返还金额
        require(amount > 0, "No funds to withdraw."); // 确保有可提取的资金

        // 先清零，再转账，防止重入攻击
        pendingReturns[msg.sender] = 0; // 清零待返还金额
        payable(msg.sender).transfer(amount); // 转账
    }

    // 结束竞拍并提取收益
    function finalizeAuction() external {
        require(block.timestamp >= auctionEndTime, "Auction is still ongoing."); // 确保竞拍已结束
        require(!auctionFinalized, "Auction already finalized."); // 确保竞拍未结束过

        // 将最高出价转给受益人
        if (highestBid > 0) {
            payable(beneficiary).transfer(highestBid); // 受益人收到资金
            emit AuctionEnded(highestBidder, highestBid); // 触发竞拍结束事件
        }

        auctionFinalized = true; // 标记为已结束
    }
}
