import React, { useState, useEffect } from 'react';
import './App.css';
import { ethers } from 'ethers';
import WalletConnect from './components/WalletConnect';
import GameActions from './components/GameActions';
import PlayerStats from './components/PlayerStats';

// Contract ABI - simplified for key functions
const CONTRACT_ABI = [
  "function mintResources(uint256 amount) payable",
  "function mintNFT(string name, uint256 power) payable",
  "function performGameAction(string actionType, uint256 scoreGained) payable",
  "function useResources(uint256 resourceAmount) payable",
  "function getPlayerStats(address player) view returns (uint256 resources, uint256 nftCount, uint256 score, uint256 totalActions)",
  "function getPlayerNFTs(address player) view returns (uint256[])",
  "function getNFT(uint256 nftId) view returns (tuple(uint256 id, address owner, string name, uint256 power, uint256 mintedAt))",
  "function MINT_RESOURCE_FEE() view returns (uint256)",
  "function MINT_NFT_FEE() view returns (uint256)",
  "function GAME_ACTION_FEE() view returns (uint256)",
  "function OWNER_WALLET() view returns (address)"
];

// Contract address - update this after deployment
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

interface PlayerStats {
  resources: bigint;
  nftCount: bigint;
  score: bigint;
  totalActions: bigint;
}

interface NFT {
  id: bigint;
  owner: string;
  name: string;
  power: bigint;
  mintedAt: bigint;
}

function App() {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [playerNFTs, setPlayerNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [fees, setFees] = useState<{
    mintResource: string;
    mintNFT: string;
    gameAction: string;
  } | null>(null);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask to use this app!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setProvider(provider);
      setAccount(accounts[0]);
      setContract(contract);
      setError('');
      setSuccess('Wallet connected successfully!');

      // Load fees
      const mintResourceFee = await contract.MINT_RESOURCE_FEE();
      const mintNFTFee = await contract.MINT_NFT_FEE();
      const gameActionFee = await contract.GAME_ACTION_FEE();
      
      setFees({
        mintResource: ethers.formatEther(mintResourceFee),
        mintNFT: ethers.formatEther(mintNFTFee),
        gameAction: ethers.formatEther(gameActionFee)
      });

      // Load initial stats
      await loadPlayerStats(accounts[0], contract);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to connect wallet: ${err.message}`);
    }
  };

  // Load player stats
  const loadPlayerStats = async (playerAddress: string, contractInstance: ethers.Contract) => {
    try {
      const stats = await contractInstance.getPlayerStats(playerAddress);
      setPlayerStats({
        resources: stats[0],
        nftCount: stats[1],
        score: stats[2],
        totalActions: stats[3]
      });

      // Load NFTs
      const nftIds = await contractInstance.getPlayerNFTs(playerAddress);
      const nfts: NFT[] = [];
      for (const id of nftIds) {
        const nft = await contractInstance.getNFT(id);
        nfts.push(nft);
      }
      setPlayerNFTs(nfts);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  // Refresh stats
  const refreshStats = async () => {
    if (contract && account) {
      await loadPlayerStats(account, contract);
    }
  };

  // Mint resources
  const mintResources = async (amount: number) => {
    if (!contract || !fees) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const tx = await contract.mintResources(amount, {
        value: ethers.parseEther(fees.mintResource)
      });
      await tx.wait();
      setSuccess(`Successfully minted ${amount} resources!`);
      await refreshStats();
    } catch (err: any) {
      console.error(err);
      setError(`Failed to mint resources: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Mint NFT
  const mintNFT = async (name: string, power: number) => {
    if (!contract || !fees) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const tx = await contract.mintNFT(name, power, {
        value: ethers.parseEther(fees.mintNFT)
      });
      await tx.wait();
      setSuccess(`Successfully minted NFT: ${name}!`);
      await refreshStats();
    } catch (err: any) {
      console.error(err);
      setError(`Failed to mint NFT: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Perform game action
  const performGameAction = async (actionType: string, scoreGained: number) => {
    if (!contract || !fees) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const tx = await contract.performGameAction(actionType, scoreGained, {
        value: ethers.parseEther(fees.gameAction)
      });
      await tx.wait();
      setSuccess(`Successfully performed ${actionType} and gained ${scoreGained} points!`);
      await refreshStats();
    } catch (err: any) {
      console.error(err);
      setError(`Failed to perform action: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Use resources
  const useResources = async (resourceAmount: number) => {
    if (!contract || !fees) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const tx = await contract.useResources(resourceAmount, {
        value: ethers.parseEther(fees.gameAction)
      });
      await tx.wait();
      setSuccess(`Successfully used ${resourceAmount} resources!`);
      await refreshStats();
    } catch (err: any) {
      console.error(err);
      setError(`Failed to use resources: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(() => {
      if (contract && account) {
        refreshStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [contract, account]);

  return (
    <div className="App">
      <div className="header">
        <h1>🎮 Crypto Game 🎮</h1>
        <p>Play to Earn - Mint Resources, Create NFTs, and Climb the Leaderboard!</p>
      </div>

      <WalletConnect 
        account={account}
        onConnect={connectWallet}
        loading={loading}
      />

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {account && playerStats && (
        <>
          <PlayerStats 
            stats={playerStats}
            nfts={playerNFTs}
            onRefresh={refreshStats}
            loading={loading}
          />

          <GameActions
            fees={fees}
            onMintResources={mintResources}
            onMintNFT={mintNFT}
            onPerformAction={performGameAction}
            onUseResources={useResources}
            loading={loading}
            playerResources={Number(playerStats.resources)}
          />
        </>
      )}

      {!account && (
        <div className="wallet-info">
          <h2>Welcome to Crypto Game!</h2>
          <p>Connect your wallet to start playing</p>
          <p>All game fees support the development at:</p>
          <p style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
            0x13B87B819252A81381C3Ce35e3Bd33199F4c6650
          </p>
        </div>
      )}

      <div className="footer">
        <p>Powered by Ethereum Smart Contracts</p>
        <p>Contract: {CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" ? "Not deployed" : CONTRACT_ADDRESS}</p>
      </div>
    </div>
  );
}

export default App;
