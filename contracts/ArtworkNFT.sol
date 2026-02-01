// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArtworkNFT
 * @dev ERC721 token contract for game artwork/NFTs with layering and payment features
 */
contract ArtworkNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    // Fee wallet address
    address payable public constant FEE_WALLET = payable(0x13B87B819252A81381C3Ce35e3Bd33199F4c6650);
    
    // Fee percentage (in basis points, 100 = 1%)
    uint256 public feePercentage = 500; // 5% fee
    
    // Counter for token IDs
    uint256 private _nextTokenId;
    
    // Mapping from token ID to artwork layer count
    mapping(uint256 => uint256) public artworkLayers;
    
    // Mapping from token ID to price (for resale)
    mapping(uint256 => uint256) public tokenPrices;
    
    // Events
    event ArtworkMinted(address indexed to, uint256 indexed tokenId, uint256 layers);
    event ArtworkPurchased(address indexed from, address indexed to, uint256 indexed tokenId, uint256 price);
    event LayerAdded(uint256 indexed tokenId, uint256 newLayerCount);
    event FeeTransferred(address indexed to, uint256 amount);
    
    constructor() ERC721("CryptoGameArtwork", "CGA") Ownable(msg.sender) {}
    
    /**
     * @dev Mint new artwork NFT with specified layers
     * @param to Address to mint the NFT to
     * @param uri Metadata URI for the NFT
     * @param layers Number of artwork layers
     */
    function mintArtwork(
        address to,
        string memory uri,
        uint256 layers
    ) public payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Payment required to mint artwork");
        require(layers > 0, "Must have at least one layer");
        
        uint256 tokenId = _nextTokenId++;
        
        // Calculate and transfer fee
        uint256 fee = (msg.value * feePercentage) / 10000;
        uint256 remaining = msg.value - fee;
        
        // Transfer fee to fee wallet
        (bool feeSuccess, ) = FEE_WALLET.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        emit FeeTransferred(FEE_WALLET, fee);
        
        // Transfer remaining to contract owner
        if (remaining > 0) {
            (bool ownerSuccess, ) = owner().call{value: remaining}("");
            require(ownerSuccess, "Owner transfer failed");
        }
        
        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        artworkLayers[tokenId] = layers;
        
        emit ArtworkMinted(to, tokenId, layers);
        
        return tokenId;
    }
    
    /**
     * @dev Purchase an artwork NFT from another player
     * @param tokenId Token ID to purchase
     */
    function purchaseArtwork(uint256 tokenId) public payable nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(tokenPrices[tokenId] > 0, "Token not for sale");
        require(msg.value >= tokenPrices[tokenId], "Insufficient payment");
        
        address payable seller = payable(ownerOf(tokenId));
        require(seller != msg.sender, "Cannot buy your own token");
        
        uint256 price = tokenPrices[tokenId];
        
        // Calculate and transfer fee
        uint256 fee = (price * feePercentage) / 10000;
        uint256 sellerAmount = price - fee;
        
        // Transfer fee to fee wallet
        (bool feeSuccess, ) = FEE_WALLET.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        emit FeeTransferred(FEE_WALLET, fee);
        
        // Transfer payment to seller
        (bool sellerSuccess, ) = seller.call{value: sellerAmount}("");
        require(sellerSuccess, "Seller payment failed");
        
        // Transfer the NFT
        _transfer(seller, msg.sender, tokenId);
        
        // Remove from sale
        tokenPrices[tokenId] = 0;
        
        // Refund excess payment
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit ArtworkPurchased(seller, msg.sender, tokenId, price);
    }
    
    /**
     * @dev List an artwork for sale
     * @param tokenId Token ID to list
     * @param price Sale price in wei
     */
    function listForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the token owner");
        require(price > 0, "Price must be greater than 0");
        
        tokenPrices[tokenId] = price;
    }
    
    /**
     * @dev Remove artwork from sale
     * @param tokenId Token ID to remove from sale
     */
    function removeFromSale(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the token owner");
        
        tokenPrices[tokenId] = 0;
    }
    
    /**
     * @dev Add a layer to an artwork (requires payment)
     * @param tokenId Token ID to add layer to
     */
    function addLayer(uint256 tokenId) public payable nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the token owner");
        require(msg.value > 0, "Payment required to add layer");
        
        // Calculate and transfer fee
        uint256 fee = (msg.value * feePercentage) / 10000;
        uint256 remaining = msg.value - fee;
        
        // Transfer fee to fee wallet
        (bool feeSuccess, ) = FEE_WALLET.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        emit FeeTransferred(FEE_WALLET, fee);
        
        // Transfer remaining to contract owner
        if (remaining > 0) {
            (bool ownerSuccess, ) = owner().call{value: remaining}("");
            require(ownerSuccess, "Owner transfer failed");
        }
        
        // Increment layer count
        artworkLayers[tokenId]++;
        
        emit LayerAdded(tokenId, artworkLayers[tokenId]);
    }
    
    /**
     * @dev Update fee percentage (only owner)
     * @param newFeePercentage New fee percentage in basis points
     */
    function setFeePercentage(uint256 newFeePercentage) public onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%");
        feePercentage = newFeePercentage;
    }
    
    /**
     * @dev Get artwork layer count
     * @param tokenId Token ID to query
     */
    function getArtworkLayers(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return artworkLayers[tokenId];
    }
    
    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
