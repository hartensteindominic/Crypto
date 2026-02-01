import React from 'react';

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

interface PlayerStatsProps {
  stats: PlayerStats;
  nfts: NFT[];
  onRefresh: () => void;
  loading: boolean;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, nfts, onRefresh, loading }) => {
  return (
    <>
      <div className="stats-container">
        <div className="stat-card">
          <h3>💎 Resources</h3>
          <div className="stat-value">{stats.resources.toString()}</div>
        </div>
        
        <div className="stat-card">
          <h3>🎨 NFTs Owned</h3>
          <div className="stat-value">{stats.nftCount.toString()}</div>
        </div>
        
        <div className="stat-card">
          <h3>⭐ Score</h3>
          <div className="stat-value">{stats.score.toString()}</div>
        </div>
        
        <div className="stat-card">
          <h3>🎯 Total Actions</h3>
          <div className="stat-value">{stats.totalActions.toString()}</div>
        </div>
      </div>

      {nfts.length > 0 && (
        <div className="action-card" style={{ maxWidth: '1200px', margin: '20px auto' }}>
          <h3>🎨 Your NFT Collection</h3>
          <div className="nft-list">
            {nfts.map((nft) => (
              <div key={nft.id.toString()} className="nft-item">
                <h4>{nft.name}</h4>
                <p>⚡ Power: {nft.power.toString()}</p>
                <p>🆔 ID: #{nft.id.toString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        className="action-button" 
        onClick={onRefresh}
        disabled={loading}
        style={{ maxWidth: '300px', margin: '20px auto' }}
      >
        {loading ? 'Loading...' : '🔄 Refresh Stats'}
      </button>
    </>
  );
};

export default PlayerStats;
