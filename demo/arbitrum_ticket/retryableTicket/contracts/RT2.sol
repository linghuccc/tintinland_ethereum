// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.6.11;

import "@arbitrum/nitro-contracts/src/precompiles/ArbSys.sol";
import "@arbitrum/nitro-contracts/src/libraries/AddressAliasHelper.sol";
import "./RetryableTicket.sol";

contract RetryableTicketL2 is RetryableTicket {
    ArbSys constant arbsys = ArbSys(address(100));
    address public l1Target;

    event L2ToL1TxCreated(uint256 indexed withdrawalId);

    constructor(
        bool _myBool,
        uint256 _myUint,
        address _myAddress,
        string memory _myString,
        address _l1Target
    ) RetryableTicket(_myBool, _myUint, _myAddress, _myString) {
        l1Target = _l1Target;
    }

    function updateL1Target(address _l1Target) public {
        l1Target = _l1Target;
    }

    function setValuesInL1(
        bool _myBool,
        uint256 _myUint,
        address _myAddress,
        string memory _myString
    ) public returns (uint256) {
        bytes memory data = abi.encodeWithSelector(
            RetryableTicket.setValues.selector,
            _myBool,
            _myUint,
            _myAddress,
            _myString
        );

        uint256 withdrawalId = arbsys.sendTxToL1(l1Target, data);

        emit L2ToL1TxCreated(withdrawalId);
        return withdrawalId;
    }

    /// @notice only l1Target can update greeting
    function setValues(
        bool _myBool,
        uint256 _myUint,
        address _myAddress,
        string memory _myString
    ) public override {
        // To check that message came from L1, we check that the sender is the L1 contract's L2 alias.
        require(
            msg.sender == AddressAliasHelper.applyL1ToL2Alias(l1Target),
            "Values only updateable by L1"
        );
        RetryableTicket.setValues(_myBool, _myUint, _myAddress, _myString);
    }
}
