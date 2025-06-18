import React, { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { NETWORKS, switchNetwork, getNetworkByChainId } from '../config/networks';

const NetworkSelector = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const currentNetwork = getNetworkByChainId(chainId);
  const isSupported = !!currentNetwork;

  const handleNetworkSwitch = async (networkKey) => {
    setIsSwitching(true);
    try {
      const success = await switchNetwork(networkKey);
      if (success) {
        setIsOpen(false);
        window.location.reload(); // Reload to update contracts
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!isConnected) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isSupported 
            ? currentNetwork?.gasless 
              ? 'linear-gradient(135deg, #10b981, #059669)' 
              : 'linear-gradient(135deg, #3b82f6, #2563eb)'
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isSupported ? '#10b981' : '#ef4444'
        }} />
        {isSupported ? currentNetwork.name : 'Unsupported Network'}
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: '#1e293b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.5rem',
          padding: '0.5rem',
          minWidth: '200px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}>
          {Object.entries(NETWORKS).map(([key, network]) => (
            <button
              key={key}
              onClick={() => handleNetworkSwitch(key)}
              disabled={isSwitching || network.chainId === chainId}
              style={{
                width: '100%',
                background: network.chainId === chainId 
                  ? 'rgba(59, 130, 246, 0.1)' 
                  : 'transparent',
                border: network.chainId === chainId
                  ? '1px solid rgba(59, 130, 246, 0.3)'
                  : '1px solid transparent',
                color: network.chainId === chainId ? '#60a5fa' : '#e2e8f0',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: network.chainId === chainId ? 'default' : 'pointer',
                textAlign: 'left',
                marginBottom: '0.25rem',
                transition: 'all 0.2s ease',
                opacity: isSwitching ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (network.chainId !== chainId && !isSwitching) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (network.chainId !== chainId) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{network.name}</div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: network.gasless ? '#10b981' : '#94a3b8',
                    marginTop: '0.125rem'
                  }}>
                    {network.gasless ? '✨ Gas-free' : 'Gas required'}
                  </div>
                </div>
                {network.chainId === chainId && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#60a5fa">
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;