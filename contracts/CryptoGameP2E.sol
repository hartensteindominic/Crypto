// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CryptoGame
 * @dev A play-to-earn game contract with fee collection and resource minting
 * @notice The owner wallet is hardcoded and cannot be changed after deployment.
 * Ensure the owner wallet address is correct before deploying to mainnet.
 */
contract CryptoGame {
    // Owner wallet that receives all fees
    // NOTE: This address is immutable and cannot be changed after deployment
    address public constant OWNER_WALLET = 0x13B87B819252A81381C3Ce35e3Bd33199F4c6650;
    
    // Fee amounts
    uint256 public constant MINT_RESOURCE_FEE = 0.001 ether;
    uint256 public constant MINT_NFT_FEE = 0.01 ether;
    uint256 public constant GAME_ACTION_FEE = 0.0005 ether;
    
    // Player resources
    mapping(address => uint256) public playerResources;
    
    // Player NFTs
    mapping(address => uint256[]) public playerNFTs;
    uint256 private nextNFTId = 1;
    
    // NFT metadata
    struct NFT {
        uint256 id;
        address owner;
        string name;
        uint256 power;
        uint256 mintedAt;
    }
    
    mapping(uint256 => NFT) public nfts;
    
    // Game stats
    mapping(address => uint256) public playerScore;
    mapping(address => uint256) public totalActionsPerformed;
    
    // Events
    event ResourceMinted(address indexed player, uint256 amount, uint256 fee);
    event NFTMinted(address indexed player, uint256 nftId, string name, uint256 power);
    event GameActionPerformed(address indexed player, string actionType, uint256 fee);
    event FeeTransferred(address indexed to, uint256 amount);
    
    /**
     * @dev Mint resources for the player
     * @param amount Amount of resources to mint
     * @notice Follows checks-effects-interactions pattern for security
     */
    function mintResources(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= MINT_RESOURCE_FEE, "Insufficient fee");
        
        // Effects: Update state before external call
        playerResources[msg.sender] += amount;
        
        // Interactions: Transfer fee to owner wallet
        (bool success, ) = OWNER_WALLET.call{value: msg.value}("");
        require(success, "Fee transfer failed");
        
        emit ResourceMinted(msg.sender, amount, msg.value);
        emit FeeTransferred(OWNER_WALLET, msg.value);
    }
    
    /**
     * @dev Mint an NFT with specified attributes
     * @param name Name of the NFT
     * @param power Power level of the NFT
     * @notice Follows checks-effects-interactions pattern for security
     */
    function mintNFT(string memory name, uint256 power) external payable {
        require(msg.value >= MINT_NFT_FEE, "Insufficient fee for NFT minting");
        require(power > 0 && power <= 100, "Power must be between 1 and 100");
        
        // Effects: Update state before external call
        uint256 nftId = nextNFTId++;
        
        NFT memory newNFT = NFT({
            id: nftId,
            owner: msg.sender,
            name: name,
            power: power,
            mintedAt: block.timestamp
        });
        
        nfts[nftId] = newNFT;
        playerNFTs[msg.sender].push(nftId);
        
        // Interactions: Transfer fee to owner wallet
        (bool success, ) = OWNER_WALLET.call{value: msg.value}("");
        require(success, "Fee transfer failed");
        
        emit NFTMinted(msg.sender, nftId, name, power);
        emit FeeTransferred(OWNER_WALLET, msg.value);
    }
    
    /**
     * @dev Perform a game action (e.g., battle, quest completion)
     * @param actionType Type of action being performed
     * @param scoreGained Score points gained from this action
     * @notice Follows checks-effects-interactions pattern for security
     */
    function performGameAction(string memory actionType, uint256 scoreGained) external payable {
        require(msg.value >= GAME_ACTION_FEE, "Insufficient fee for game action");
        
        // Effects: Update state before external call
        playerScore[msg.sender] += scoreGained;
        totalActionsPerformed[msg.sender] += 1;
        
        // Interactions: Transfer fee to owner wallet
        (bool success, ) = OWNER_WALLET.call{value: msg.value}("");
        require(success, "Fee transfer failed");
        
        emit GameActionPerformed(msg.sender, actionType, msg.value);
        emit FeeTransferred(OWNER_WALLET, msg.value);
    }
    
    /**
     * @dev Use resources to boost score
     * @param resourceAmount Amount of resources to use
     * @notice Follows checks-effects-interactions pattern for security
     */
    function useResources(uint256 resourceAmount) external payable {
        require(msg.value >= GAME_ACTION_FEE, "Insufficient fee");
        require(playerResources[msg.sender] >= resourceAmount, "Insufficient resources");
        
        // Effects: Update state before external call
        playerResources[msg.sender] -= resourceAmount;
        playerScore[msg.sender] += resourceAmount * 10; // 10 points per resource
        
        // Interactions: Transfer fee to owner wallet
        (bool success, ) = OWNER_WALLET.call{value: msg.value}("");
        require(success, "Fee transfer failed");
        
        emit GameActionPerformed(msg.sender, "UseResources", msg.value);
        emit FeeTransferred(OWNER_WALLET, msg.value);
    }
    
    /**
     * @dev Get player's resource balance
     */
    function getPlayerResources(address player) external view returns (uint256) {
        return playerResources[player];
    }
    
    /**
     * @dev Get player's NFT count
     */
    function getPlayerNFTCount(address player) external view returns (uint256) {
        return playerNFTs[player].length;
    }
    
    /**
     * @dev Get player's NFT IDs
     */
    function getPlayerNFTs(address player) external view returns (uint256[] memory) {
        return playerNFTs[player];
    }
    
    /**
     * @dev Get NFT details
     */
    function getNFT(uint256 nftId) external view returns (NFT memory) {
        return nfts[nftId];
    }
    
    /**
     * @dev Get player stats
     */
    function getPlayerStats(address player) external view returns (
        uint256 resources,
        uint256 nftCount,
        uint256 score,
        uint256 totalActions
    ) {
        return (
            playerResources[player],
            playerNFTs[player].length,
            playerScore[player],
            totalActionsPerformed[player]
        );
    }
}
