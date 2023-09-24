// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./StorageSlot.sol";

contract Proxy {
    mapping(address => uint) public balances;
    uint8 public transferFee = 1;

    bytes32 public constant IMPLEMENTATION_SLOT =
        bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
    bytes32 public constant ADMIN_SLOT =
        bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);

    modifier ifAdmin() {
        if (msg.sender == _getAdmin()) {
            _;
        } else {
            _fallback();
        }
    }

    constructor() {
        _setAdmin(msg.sender);
    }

    // function upgradeTo(address newImp) external ifAdmin {
    //     _setImplementation(newImp);
    // }

    function admin() external ifAdmin returns (address) {
        return _getAdmin();
    }

    function implementation() external ifAdmin returns (address) {
        return _getImplementation();
    }

    receive() external payable {
        _fallback();
    }

    fallback() external payable {
        _fallback();
    }

    function setAdmin(address _admin) external ifAdmin {
        _setAdmin(_admin);
    }

    function upgradeImplementation(address _implementation) external ifAdmin {
        _setImplementation(_implementation);
    }

    function _delegate(address _implementation) internal {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(
                gas(),
                _implementation,
                0,
                calldatasize(),
                0,
                0
            )

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    function _fallback() private {
        _delegate(_getImplementation());
    }

    function _getImplementation() private view returns (address) {
        return StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value;
    }

    function _getAdmin() private view returns (address) {
        return StorageSlot.getAddressSlot(ADMIN_SLOT).value;
    }

    function _setImplementation(address _address) private {
        StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value = _address;
    }

    function _setAdmin(address _address) private {
        StorageSlot.getAddressSlot(ADMIN_SLOT).value = _address;
    }
}
