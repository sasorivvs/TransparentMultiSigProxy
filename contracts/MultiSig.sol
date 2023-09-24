// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Multisig {
    mapping(address => bool) public owners;
    address[] public ownersForConfirmations;
    uint public required;
    uint public transactionsCount;

    enum TransactionType {
        setProxyAdmin,
        upgradeImpl
    }
    struct Transaction {
        TransactionType transaction_type;
        uint duration;
        uint timestamp;
        bool executed;
    }
    event Submited(
        uint txId,
        address initiator,
        TransactionType _type,
        uint duration,
        uint timestamp
    );
    event Confirmed(uint txId, address owner);
    event Executed(uint txId, TransactionType _type, uint timestamp);

    mapping(uint => Transaction) public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;

    constructor(address[] memory _owners, uint _required) {
        require(_owners.length >= _required && _required > 0);
        for (uint i = 0; i < _owners.length; i++) {
            if (!owners[_owners[i]]) {
                owners[_owners[i]] = true;
            }
        }
        ownersForConfirmations = _owners;
        required = _required;
    }

    function isOwner(address _owner) internal view returns (bool) {
        return owners[_owner];
    }

    function addTransaction(
        TransactionType _transaction_type,
        uint _duration
    ) internal returns (uint) {
        require(isOwner(msg.sender), "Not An Owner");
        uint txId = transactionsCount;

        transactions[txId] = Transaction(
            _transaction_type,
            _duration,
            block.timestamp,
            false
        );
        transactionsCount++;
        emit Submited(
            txId,
            msg.sender,
            _transaction_type,
            _duration,
            block.timestamp
        );
        return (txId);
    }

    function getConfirmationsCount(uint _txId) internal view returns (uint) {
        uint confirmationsCount;
        for (uint i = 0; i < ownersForConfirmations.length; i++) {
            if (confirmations[_txId][ownersForConfirmations[i]]) {
                confirmationsCount++;
            }
        }
        return confirmationsCount;
    }

    function isConfirmed(uint _transactionId) public view returns (bool) {
        if (required <= getConfirmationsCount(_transactionId)) {
            return true;
        }

        return false;
    }

    function isExecuted(uint _txId) internal view returns (bool) {
        return transactions[_txId].executed;
    }

    function IsExpired(uint _txId) internal view returns (bool) {
        if (
            transactions[_txId].duration + transactions[_txId].timestamp <
            block.timestamp
        ) {
            return true;
        }
        return false;
    }

    function executeTransaction(uint _txId) internal {
        _executeTransaction(_txId);
    }

    function _executeTransaction(uint _txId) internal virtual {
        require(isConfirmed(_txId), "Not Confirmed");
        require(!isExecuted(_txId), "Already Executed");
        require(!IsExpired(_txId), "Transaction Expired");
        transactions[_txId].executed = true;

        emit Executed(
            _txId,
            transactions[_txId].transaction_type,
            block.timestamp
        );
    }

    function submitTransaction(
        TransactionType _transaction_type,
        uint _duration
    ) external {
        require(isOwner(msg.sender), "Not An Owner");

        uint _txId = addTransaction(_transaction_type, _duration);
        confirmTransaction(_txId);
    }

    function confirmTransaction(uint _txId) public {
        _confirmTransaction(_txId);
    }

    function _confirmTransaction(uint _txId) internal virtual {
        require(isOwner(msg.sender), "Not An Owner");
        confirmations[_txId][msg.sender] = true;
        emit Confirmed(_txId, msg.sender);
        if (isConfirmed(_txId)) {
            executeTransaction(_txId);
        }
    }

    receive() external payable {}
}
