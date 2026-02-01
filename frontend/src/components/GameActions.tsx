import React, { useState } from 'react';

interface GameActionsProps {
  fees: {
    mintResource: string;
    mintNFT: string;
    gameAction: string;
  } | null;
  onMintResources: (amount: number) => void;
  onMintNFT: (name: string, power: number) => void;
  onPerformAction: (actionType: string, scoreGained: number) => void;
  onUseResources: (resourceAmount: number) => void;
  loading: boolean;
  playerResources: number;
}

const GameActions: React.FC<GameActionsProps> = ({
  fees,
  onMintResources,
  onMintNFT,
  onPerformAction,
  onUseResources,
  loading,
  playerResources
}) => {
  const [resourceAmount, setResourceAmount] = useState<string>('10');
  const [nftName, setNftName] = useState<string>('');
  const [nftPower, setNftPower] = useState<string>('50');
  const [useResourceAmount, setUseResourceAmount] = useState<string>('1');

  const handleMintResources = () => {
    const amount = parseInt(resourceAmount);
    if (amount > 0) {
      onMintResources(amount);
    }
  };

  const handleMintNFT = () => {
    const power = parseInt(nftPower);
    if (nftName && power > 0 && power <= 100) {
      onMintNFT(nftName, power);
      setNftName('');
    }
  };

  const handleQuickAction = (actionType: string, score: number) => {
    onPerformAction(actionType, score);
  };

  const handleUseResources = () => {
    const amount = parseInt(useResourceAmount);
    if (amount > 0 && amount <= playerResources) {
      onUseResources(amount);
    }
  };

  return (
    <div className="actions-container">
      {/* Mint Resources */}
      <div className="action-card">
        <h3>💎 Mint Resources</h3>
        <p>Create in-game resources to use later</p>
        {fees && <p><strong>Fee: {fees.mintResource} ETH</strong></p>}
        <input
          type="number"
          value={resourceAmount}
          onChange={(e) => setResourceAmount(e.target.value)}
          placeholder="Amount"
          min="1"
        />
        <button 
          className="action-button"
          onClick={handleMintResources}
          disabled={loading}
        >
          Mint Resources
        </button>
      </div>

      {/* Mint NFT */}
      <div className="action-card">
        <h3>🎨 Mint NFT</h3>
        <p>Create a unique NFT with custom power</p>
        {fees && <p><strong>Fee: {fees.mintNFT} ETH</strong></p>}
        <input
          type="text"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          placeholder="NFT Name"
        />
        <input
          type="number"
          value={nftPower}
          onChange={(e) => setNftPower(e.target.value)}
          placeholder="Power (1-100)"
          min="1"
          max="100"
        />
        <button 
          className="action-button"
          onClick={handleMintNFT}
          disabled={loading || !nftName}
        >
          Mint NFT
        </button>
      </div>

      {/* Use Resources */}
      <div className="action-card">
        <h3>⚡ Use Resources</h3>
        <p>Convert resources to score points (10pts per resource)</p>
        <p>Available: <strong>{playerResources}</strong> resources</p>
        {fees && <p><strong>Fee: {fees.gameAction} ETH</strong></p>}
        <input
          type="number"
          value={useResourceAmount}
          onChange={(e) => setUseResourceAmount(e.target.value)}
          placeholder="Amount to use"
          min="1"
          max={playerResources}
        />
        <button 
          className="action-button"
          onClick={handleUseResources}
          disabled={loading || playerResources === 0}
        >
          Use Resources
        </button>
      </div>

      {/* Quick Actions */}
      <div className="action-card">
        <h3>🎮 Quick Actions</h3>
        <p>Perform game actions to gain points</p>
        {fees && <p><strong>Fee: {fees.gameAction} ETH each</strong></p>}
        <button 
          className="action-button"
          onClick={() => handleQuickAction('Battle', 50)}
          disabled={loading}
          style={{ marginTop: '10px' }}
        >
          ⚔️ Battle (+50 pts)
        </button>
        <button 
          className="action-button"
          onClick={() => handleQuickAction('Quest', 100)}
          disabled={loading}
          style={{ marginTop: '10px' }}
        >
          🗺️ Complete Quest (+100 pts)
        </button>
        <button 
          className="action-button"
          onClick={() => handleQuickAction('Treasure', 75)}
          disabled={loading}
          style={{ marginTop: '10px' }}
        >
          💰 Find Treasure (+75 pts)
        </button>
      </div>
    </div>
  );
};

export default GameActions;
