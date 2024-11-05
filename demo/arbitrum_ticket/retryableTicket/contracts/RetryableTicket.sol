// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.6.11;

contract RetryableTicket {
    bool myBool;
    uint256 myUint;
    address myAddress;
    string myString;

    constructor(bool _myBool, uint256 _myUint, address _myAddress, string memory _myString) {
        myBool = _myBool;
        myUint = _myUint;
        myAddress = _myAddress;
        myString = _myString;
    }

    function showValues() public view returns (bool, uint256, address, string memory) {
        return (myBool, myUint, myAddress, myString);
    }

    function setValues(
        bool _myBool,
        uint256 _myUint,
        address _myAddress,
        string memory _myString
    ) public virtual {
        myBool = _myBool;
        myUint = _myUint;
        myAddress = _myAddress;
        myString = _myString;
    }
}
