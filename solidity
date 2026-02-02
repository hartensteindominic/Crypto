// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ArtLiquidityPool {
    address public owner;
    uint256 public constant ENTRY_FEE = 0.001 ether; // ~ $2.50 on Base

    mapping(address => uint256) public borrowingPower;

    constructor(address _owner) {
        owner = _owner; // Set to your 0x02f... address
    }

    function depositArtAndPayFee(address nftContract, uint256 tokenId) external payable {
        require(msg.value >= ENTRY_FEE, "Fee required to enter pool");
        
        // Transfer NFT to contract
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        // Example: Add 0.1 ETH of 'credit' to the user's account
        borrowingPower[msg.sender] += 0.1 ether;
    }

    function borrow(uint256 amount) external {
        require(borrowingPower[msg.sender] >= amount, "Not enough collateral");
        borrowingPower[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
