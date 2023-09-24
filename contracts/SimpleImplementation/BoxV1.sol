// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract BoxV1 {
    mapping(address => uint) private balances;
    uint8 private transferFee;

    event Mint(address indexed minter);
    event Transfer(
        address indexed sender,
        address indexed recipient,
        uint indexed value
    );

    function mint() public {
        balances[msg.sender] += 100;
        emit Mint(msg.sender);
    }

    function transfer(address _to, uint value) public {
        require(balances[msg.sender] >= value);
        uint fee = (value * transferFee) / 100;
        uint amount = value - fee;
        balances[msg.sender] -= value;
        balances[_to] += amount;
        emit Transfer(msg.sender, _to, amount);
    }

    function mintSel() public pure returns (bytes memory) {
        return abi.encodeWithSelector(this.mint.selector);
    }

    function transferSel(
        address _to,
        uint value
    ) public pure returns (bytes memory) {
        return abi.encodeWithSignature("transfer(address,uint256)", _to, value);
    }

    function admin() external pure returns (address) {
        return address(1);
    }

    function implementation() external pure returns (address) {
        return address(2);
    }

    function adminSel() public pure returns (bytes memory) {
        return abi.encodeWithSelector(this.admin.selector);
    }
}
