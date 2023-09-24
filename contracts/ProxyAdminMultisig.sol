// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Proxy.sol";
import "./MultiSig.sol";

contract ProxyAdminMultisig is Multisig {
    constructor(
        address[] memory _owners,
        uint _required
    ) Multisig(_owners, _required) {}

    function getProxyAdmin(address proxy) external view returns (address) {
        require(isOwner(msg.sender), "Not An Owner");
        (bool ok, bytes memory res) = proxy.staticcall(
            abi.encodeCall(Proxy.admin, ())
        );
        require(ok, "call failed");
        return abi.decode(res, (address));
    }

    function getProxyImplementation(
        address proxy
    ) external view returns (address) {
        require(isOwner(msg.sender), "Not An Owner");
        (bool ok, bytes memory res) = proxy.staticcall(
            abi.encodeCall(Proxy.implementation, ())
        );
        require(ok, "call failed");
        return abi.decode(res, (address));
    }

    function _setAdminCall(address payable proxy, address _admin) internal {
        require(isOwner(msg.sender), "Not An Owner");
        Proxy(proxy).setAdmin(_admin);
    }

    function _upgradeCall(
        address payable proxy,
        address _implementation
    ) internal {
        require(isOwner(msg.sender), "Not An Owner");
        Proxy(proxy).upgradeImplementation(_implementation);
    }

    function _executeTx(
        uint _txId,
        address payable proxy,
        address _implOrAdmin
    ) internal {
        super._executeTransaction(_txId);
        if (
            transactions[_txId].transaction_type ==
            TransactionType.setProxyAdmin
        ) {
            _setAdminCall(proxy, _implOrAdmin);
        } else {
            _upgradeCall(proxy, _implOrAdmin);
        }
    }

    function _confirmTransaction(uint _txId) internal override {
        require(isOwner(msg.sender), "Not An Owner");
        confirmations[_txId][msg.sender] = true;
        emit Confirmed(_txId, msg.sender);
    }

    function confirm(
        uint _txId,
        address payable proxy,
        address _implOrAdmin
    ) external {
        _confirmTransaction(_txId);
        if (isConfirmed(_txId)) {
            _executeTx(_txId, proxy, _implOrAdmin);
        }
    }
}
