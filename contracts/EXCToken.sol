// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EXCToken
 * @dev Platform token for the Crypto Exchange with governance and utility features
 */
contract EXCToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant MAX_SUPPLY = 10000000000 * 10**18; // 10 billion tokens max
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor() ERC20("Exchange Token", "EXC") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Add a new minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mint new tokens (only by authorized minters)
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
}
