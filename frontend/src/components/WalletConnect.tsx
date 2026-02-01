import React from 'react';

interface WalletConnectProps {
  account: string;
  onConnect: () => void;
  loading: boolean;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ account, onConnect, loading }) => {
  return (
    <div className="wallet-section">
      {!account ? (
        <button 
          className="wallet-button" 
          onClick={onConnect}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="wallet-info">
          <p><strong>Connected Wallet:</strong></p>
          <p style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
