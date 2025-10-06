// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentContract
 * @dev Simple contract for accepting payments.
 */
contract PaymentContract is Ownable, ReentrancyGuard {
    uint256 public totalPayments;
    uint256 public paymentCount;
    uint256 public accessPrice = 0.00001 ether; // Price to get access (0.00001 POL)
    
    mapping(address => bool) public hasAccess;
    
    event PaymentReceived(address indexed payer, uint256 amount);
    event AccessGranted(address indexed user);
    event AccessRevoked(address indexed user);
    event AccessPriceUpdated(uint256 newPrice);

    // ✅ Pass msg.sender explicitly to Ownable constructor
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Accept payment and grant access
     */
    function makePayment() external payable nonReentrant {
        require(msg.value >= accessPrice, "Insufficient payment for access");
        
        totalPayments += msg.value;
        paymentCount++;
        
        hasAccess[msg.sender] = true;
        
        emit PaymentReceived(msg.sender, msg.value);
        emit AccessGranted(msg.sender);
        
        uint256 excess = msg.value - accessPrice;
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "Failed to refund excess payment");
        }
    }

    function getTotalPayments() external view returns (uint256) {
        return totalPayments;
    }

    function getPaymentCount() external view returns (uint256) {
        return paymentCount;
    }

    function checkAccess(address user) external view returns (bool) {
        return hasAccess[user];
    }

    function getAccessPrice() external view returns (uint256) {
        return accessPrice;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function grantAccess(address user) external onlyOwner {
        hasAccess[user] = true;
        emit AccessGranted(user);
    }

    function revokeAccess(address user) external onlyOwner {
        hasAccess[user] = false;
        emit AccessRevoked(user);
    }

    function updateAccessPrice(uint256 newPrice) external onlyOwner {
        accessPrice = newPrice;
        emit AccessPriceUpdated(newPrice);
    }

    receive() external payable {
        require(msg.value >= accessPrice, "Insufficient payment for access");
        
        totalPayments += msg.value;
        paymentCount++;
        
        hasAccess[msg.sender] = true;
        
        emit PaymentReceived(msg.sender, msg.value);
        emit AccessGranted(msg.sender);
        
        uint256 excess = msg.value - accessPrice;
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "Failed to refund excess payment");
        }
    }
}
