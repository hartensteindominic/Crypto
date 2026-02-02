import React, { useState } from 'react';
import { useAccount, useConnect, useWriteContract, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { base } from 'wagmi/chains';

// This matches the Solidity logic we discussed
const CONTRACT_ADDRESS = '0xYourDeployedContractAddress'; 
const ART_POOL_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "nftContract", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "depositArtAndPayFee",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default function App() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const [nftAddr, setNftAddr] = useState('');
  const [tokenId, setTokenId] = useState('');

  const handleDeposit = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ART_POOL_ABI,
      functionName: 'depositArtAndPayFee',
      args: [nftAddr as `0x${string}`, BigInt(tokenId)],
      value: parseEther('0.001'), // The transaction fee
    });
  };

  return (
    <div className="p-8 text-white">
      {!isConnected ? (
        <button className="bg-blue-600 p-3 rounded">Connect MetaMask</button>
      ) : (
        <div className="space-y-6">
          <p class="text-sm font-mono text-gray-400">Connected: {address}</p>
          
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Deposit NFT to Pool</h2>
            <input 
              placeholder="NFT Contract Address" 
              className="w-full mb-2 p-2 bg-black border border-gray-600 rounded"
              onChange={(e) => setNftAddr(e.target.value)}
            />
            <input 
              placeholder="Token ID" 
              className="w-full mb-4 p-2 bg-black border border-gray-600 rounded"
              onChange={(e) => setTokenId(e.target.value)}
            />
            <button 
              onClick={handleDeposit}
              className="w-full bg-blue-500 py-2 rounded font-bold hover:bg-blue-400"
            >
              Pay Fee & Deposit Art
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
