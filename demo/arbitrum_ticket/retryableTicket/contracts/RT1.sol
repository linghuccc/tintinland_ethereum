// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.6.11;

import "@arbitrum/nitro-contracts/src/bridge/Inbox.sol";
import "@arbitrum/nitro-contracts/src/bridge/Outbox.sol";
import "./RetryableTicket.sol";

contract RetryableTicketL1 is RetryableTicket {
    address public l2Target;
    IInbox public inbox;

    event RetryableTicketCreated(uint256 indexed ticketId);

    constructor(
        bool _myBool,
        uint256 _myUint,
        address _myAddress,
        string memory _myString,
        address _l2Target,
        address _inbox
    ) RetryableTicket(_myBool, _myUint, _myAddress, _myString) {
        l2Target = _l2Target;
        inbox = IInbox(_inbox);
    }

    function updateL2Target(address _l2Target) public {
        l2Target = _l2Target;
    }

    function setValuesInL2(
        bool _myBool,
        uint256 _myUint,
        address _myAddress,
        string memory _myString,
        uint256 maxSubmissionCost,
        uint256 maxGas,
        uint256 gasPriceBid
    ) public payable returns (uint256) {
        bytes memory data = abi.encodeWithSelector(
            RetryableTicket.setValues.selector,
            _myBool,
            _myUint,
            _myAddress,
            _myString
        );
        uint256 ticketID = inbox.createRetryableTicket{ value: msg.value }(
            l2Target,
            0,
            maxSubmissionCost,
            msg.sender,
            msg.sender,
            maxGas,
            gasPriceBid,
            data
        );

        emit RetryableTicketCreated(ticketID);
        return ticketID;
    }

    /// @notice only l2Target can update myString
    function setValues(
        bool _myBool,
        uint256 _myUint,
        address _myAddress,
        string memory _myString
    ) public override {
        IBridge bridge = inbox.bridge();
        // this prevents reentrancies on L2 to L1 txs
        require(msg.sender == address(bridge), "NOT_BRIDGE");
        IOutbox outbox = IOutbox(bridge.activeOutbox());
        address l2Sender = outbox.l2ToL1Sender();
        require(l2Sender == l2Target, "Values only updateable by L2");

        RetryableTicket.setValues(_myBool, _myUint, _myAddress, _myString);
    }
}
