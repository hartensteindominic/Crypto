import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

const CONTRACT_ADDRESS = '0xYourDeployedContractAddress'; 
const MY_WALLET = '0x02f93c7547309ca50EEAB446DaEBE8ce8E694cBb';

export default function App() {
  const { address, isConnected } = useAccount();
  const [tokenId, setTokenId] = useState('');
  
  // 1. Hook to send the transaction
  const { data: hash, writeContract, isPending } = useWriteContract();

  // 2. Hook to wait for the blockchain to confirm
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return (
    <div className="relative min-h-screen bg-black text-white p-8">
      
      {/* SUCCESS TOAST NOTIFICATION */}
      {isSuccess && (
        <div className="fixed top-5 right-5 bg-green-600 border border-green-400 p-4 rounded-2xl shadow-2xl animate-bounce z-50 max-w-xs">
          <p className="font-bold text-sm">Success! 🎉</p>
          <p className="text-xs opacity-90">0.001 ETH fee sent to {MY_WALLET.slice(0,6)}...{MY_WALLET.slice(-4)}</p>
          <a href={`https://basescan.org/tx/${hash}`} target="_blank" className="text-[10px] underline block mt-2">View on BaseScan</a>
        </div>
      )}

      <div className="max-w-md mx-auto bg-gray-900 border border-gray-800 p-8 rounded-3xl mt-20">
        <h1 className="text-2xl font-bold mb-6">ArtPool Collateral</h1>
        
        <input 
          placeholder="NFT Token ID" 
          className="w-full p-4 bg-black border border-gray-700 rounded-xl mb-4"
          onChange={(e) => setTokenId(e.target.value)}
        />

        <button 
          disabled={isPending || isConfirming}
          className={`w-full py-4 rounded-xl font-bold transition-all ${
            isPending || isConfirming ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
          }`}
          onClick={() => writeContract({
            address: CONTRACT_ADDRESS,
            abi: ART_POOL_ABI, // Defined in previous step
            functionName: 'depositArtAndPayFee',
            args: ["0xNFT_CONTRACT_ADDRESS", BigInt(tokenId)],
            value: parseEther('0.001'),
          })}
        >
          {isPending ? 'Confirming in Wallet...' : isConfirming ? 'Verifying on Base...' : 'Deposit & Pay Fee'}
        </button>
      </div>
    </div>
  );
}
