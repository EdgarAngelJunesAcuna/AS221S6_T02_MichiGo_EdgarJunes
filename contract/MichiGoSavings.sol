// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MichiGoSavings {
    address public owner;

    struct Contact {
        string name;
        address wallet;
    }

    mapping(address => Contact) private contacts;
    address[] public contactList;

    event ContactAdded(address indexed wallet, string name);
    event ContactUpdated(address indexed wallet, string newName);
    event ContactDeleted(address indexed wallet);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addContactBatch(string[] memory names, address[] memory wallets) public onlyOwner {
        require(names.length == wallets.length, "Names and wallets array length mismatch");
        for (uint256 i = 0; i < names.length; i++) {
            contacts[wallets[i]] = Contact(names[i], wallets[i]);
            contactList.push(wallets[i]);
            emit ContactAdded(wallets[i], names[i]);
        }
    }

    function updateContactBatch(string[] memory names, address[] memory wallets) public onlyOwner {
        require(names.length == wallets.length, "Names and wallets array length mismatch");
        for (uint256 i = 0; i < names.length; i++) {
            require(contacts[wallets[i]].wallet != address(0), "Contact does not exist");
            contacts[wallets[i]].name = names[i];
            emit ContactUpdated(wallets[i], names[i]);
        }
    }

    function deleteContactBatch(address[] memory wallets) public onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            require(contacts[wallets[i]].wallet != address(0), "Contact does not exist");
            delete contacts[wallets[i]];
            emit ContactDeleted(wallets[i]);
        }
    }

    function getContacts() public view returns (Contact[] memory) {
        Contact[] memory result = new Contact[](contactList.length);
        for (uint256 i = 0; i < contactList.length; i++) {
            result[i] = contacts[contactList[i]];
        }
        return result;
    }
}
