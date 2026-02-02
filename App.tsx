import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';

const CONTRACT_ADDRESS = '0xYourDeployedContractAddress'; 
const MY_WALLET = '0x02f93c7547309ca50EEAB446DaEBE8ce8E694cBb'; // Your fee address

export default function App() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const [tokenId, setTokenId] = useState('');

  return (
    <div className="max-w-2xl mx-auto p-8 text-white bg-black rounded-3xl border border-gray-800 shadow-2xl mt-10">
      <h1 className="text-3xl font-bold mb-2">ArtPool Dashboard</h1>
      <p className="text-gray-400 mb-8">Secure your art. Access instant liquidity.</p>

      {!isConnected ? (
        <button className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-bold transition-all">
          Connect MetaMask to Start
        </button>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-900 p-4 rounded-lg border border-blue-900/50">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-1">Connected Wallet</p>
            <p className="font-mono text-sm truncate">{address}</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300 text-left">NFT Token ID</label>
            <input 
              type="text"
              placeholder="e.g. 4021" 
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setTokenId(e.target.value)}
            />
          </div>

          {/* Fee Disclosure Section */}
          <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-500/20 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Transaction Fee:</span>
              <span className="text-white font-bold">0.001 ETH</span>
            </div>
            <div className="text-[10px] text-gray-500 break-all leading-relaxed">
              Fees are sent to the pool manager at:<br/>
              <span className="text-blue-300">{MY_WALLET}</span>
            </div>
          </div>

          <button 
            className="w-full bg-white text-black font-extrabold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
            onClick={() => {/* Trigger Deposit Logic */}}
          >
            Deposit & Pay Fee
          </button>
        </div>
      )}
    </div>
  );
}
