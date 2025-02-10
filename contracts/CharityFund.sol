// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CharityFund is ReentrancyGuard, Ownable {
    mapping(address => uint256) public donations;
    uint256 public totalDonations;

    event Donated(address indexed donor, uint256 amount);
    event Withdrawn(address indexed receiver, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than 0");

        donations[msg.sender] += msg.value;
        totalDonations += msg.value;

        emit Donated(msg.sender, msg.value);
    }

    function withdraw(address payable _receiver, uint256 _amount) external onlyOwner nonReentrant {
        require(_receiver != address(0), "Invalid address");
        require(_amount > 0, "Withdrawal amount must be greater than 0");
        require(address(this).balance >= _amount, "Insufficient balance");

        totalDonations -= _amount;

        // Securely transfer funds
        (bool success, ) = _receiver.call{value: _amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(_receiver, _amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
