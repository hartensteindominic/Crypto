// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ArtLiquidityPool {
    // This is YOUR address set as the receiver for all fees
    address public constant feeRecipient = 0x02f93c7547309ca50EEAB446DaEBE8ce8E694cBb;
    uint256 public constant ENTRY_FEE = 0.001 ether; 

    mapping(address => uint256) public borrowingPower;

    // The 'Pool' now points specifically to your address for fees
    function depositArtAndPayFee(address nftContract, uint256 tokenId) external payable {
        require(msg.value >= ENTRY_FEE, "Fee required");
        
        // Transfer the fee directly to YOU
        (bool success, ) = payable(feeRecipient).call{value: msg.value}("");
        require(success, "Fee transfer failed");

        // Take NFT collateral
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        // Grant borrowing power to the user
        borrowingPower[msg.sender] += 0.1 ether; 
    }

    // Allow user to withdraw from the pool
    function borrow(uint256 amount) external {
        require(borrowingPower[msg.sender] >= amount, "Not enough collateral");
        borrowingPower[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    // Function to allow people to add funds to the pool (trading pool)
    receive() external payable {}
}
