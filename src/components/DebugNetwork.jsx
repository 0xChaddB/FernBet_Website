import React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { getNetworkKeyByChainId } from '../config/networks';

const DebugNetwork = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const networkKey = getNetworkKeyByChainId(chainId);
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '300px',
      border: '1px solid #333',
      zIndex: 9999
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#10b981' }}>🔍 Debug Info</h4>
      <div>Connected: {isConnected ? '✅' : '❌'}</div>
      <div>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</div>
      <div>Chain ID: {chainId}</div>
      <div>Expected: {baseSepolia.id} (Base Sepolia)</div>
      <div>Network Key: {networkKey || 'Unknown'}</div>
      <div style={{ 
        color: chainId === baseSepolia.id ? '#10b981' : '#ef4444',
        fontWeight: 'bold',
        marginTop: '5px'
      }}>
        {chainId === baseSepolia.id ? '✅ Correct Network' : '❌ Wrong Network!'}
      </div>
      {networkKey && (
        <div style={{ marginTop: '10px' }}>
          <strong>Contracts:</strong>
          <div style={{ fontSize: '10px', marginTop: '5px' }}>
            {Object.entries(CONTRACT_ADDRESSES[networkKey] || {}).map(([name, addr]) => (
              <div key={name}>
                {name}: {addr ? `${addr.slice(0, 8)}...` : 'Not deployed'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugNetwork;