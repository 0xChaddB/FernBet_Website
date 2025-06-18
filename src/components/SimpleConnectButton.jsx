import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

const SimpleConnectButton = ({ variant = 'default' }) => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showMenu, setShowMenu] = useState(false);

  // Auto-switch to Base Sepolia if connected to wrong network
  React.useEffect(() => {
    if (isConnected && chainId !== baseSepolia.id) {
      switchChain({ chainId: baseSepolia.id });
    }
  }, [isConnected, chainId, switchChain]);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            background: variant === 'navbar' 
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            padding: variant === 'navbar' ? '0.5rem 1rem' : '0.875rem 2rem',
            borderRadius: '0.75rem',
            fontSize: variant === 'navbar' ? '0.875rem' : '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
          }}
        >
          Connect Wallet
        </button>

        {showMenu && (
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
            zIndex: 1000,
          }}>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setShowMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: '#e2e8f0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  marginBottom: '0.25rem',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'transparent';
                }}
              >
                {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      {chainId !== baseSepolia.id && (
        <button
          onClick={() => switchChain({ chainId: baseSepolia.id })}
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Switch to Base Sepolia
        </button>
      )}
      
      <button
        onClick={() => disconnect()}
        style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          padding: variant === 'navbar' ? '0.5rem 1rem' : '0.625rem 1.25rem',
          borderRadius: '0.5rem',
          fontSize: variant === 'navbar' ? '0.875rem' : '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <div style={{
          width: variant === 'navbar' ? '24px' : '28px',
          height: variant === 'navbar' ? '24px' : '28px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: variant === 'navbar' ? '0.75rem' : '0.875rem',
          fontWeight: 'bold',
        }}>
          {formatAddress(address).charAt(0).toUpperCase()}
        </div>
        {formatAddress(address)}
      </button>
    </div>
  );
};

export default SimpleConnectButton;