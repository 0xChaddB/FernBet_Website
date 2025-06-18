import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, useChainId } from 'wagmi';
import { getNetworkByChainId } from '../config/networks';

const PaymasterBanner = () => {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const network = getNetworkByChainId(chainId);
  const [paymasterEnabled, setPaymasterEnabled] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  // Check if using Coinbase Smart Wallet
  const isCoinbaseWallet = walletClient?.transport?.name === 'Coinbase Wallet' || 
                          window.coinbaseWalletExtension || 
                          window.ethereum?.isCoinbaseWallet;

  // Check if paymaster is already enabled
  useEffect(() => {
    const checkPaymasterStatus = async () => {
      if (isCoinbaseWallet && window.ethereum) {
        try {
          // Check if paymaster is enabled in current session
          const permissions = await window.ethereum.request({
            method: 'wallet_getPermissions'
          });
          const hasPaymaster = permissions?.some(p => p.parentCapability === 'wallet_paymaster');
          setPaymasterEnabled(hasPaymaster);
        } catch (error) {
          console.error('Error checking paymaster status:', error);
        }
      }
    };

    if (isConnected) {
      checkPaymasterStatus();
    }
  }, [isConnected, isCoinbaseWallet]);

  const enablePaymaster = async () => {
    if (!isCoinbaseWallet) return;

    try {
      setIsEnabling(true);
      
      // For Coinbase Smart Wallet on Base Sepolia, paymaster is automatically enabled
      // We just need to inform the user
      if (window.ethereum?.chainId === '0x14a34') { // Base Sepolia
        setPaymasterEnabled(true);
        localStorage.setItem('paymasterEnabled', 'true');
      } else {
        // For Ethereum Sepolia, we need to use a different approach
        // Coinbase doesn't sponsor on Ethereum Sepolia by default
        console.log('Paymaster sponsorship is only available on Base network');
      }
    } catch (error) {
      console.error('Failed to enable paymaster:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  // Only show on Base Sepolia network
  if (!isConnected || !isCoinbaseWallet || network?.name !== 'Base Sepolia') return null;

  return (
    <div style={{
      background: paymasterEnabled 
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1))'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))',
      padding: '0.75rem 1rem',
      borderBottom: `1px solid ${paymasterEnabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      fontSize: '0.875rem'
    }}>
      {paymasterEnabled ? (
        <>
          <span style={{ color: '#10b981' }}>✅</span>
          <span style={{ color: '#10b981', fontWeight: '500' }}>
            Gas-free transactions enabled! Play without paying gas fees.
          </span>
        </>
      ) : (
        <>
          <span style={{ color: '#3b82f6' }}>💎</span>
          <span style={{ color: '#94a3b8' }}>
            Want to play without gas fees?
          </span>
          <button
            onClick={enablePaymaster}
            disabled={isEnabling}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: '500',
              cursor: isEnabling ? 'not-allowed' : 'pointer',
              opacity: isEnabling ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isEnabling) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {isEnabling ? 'Enabling...' : 'Enable Gas-Free Mode'}
          </button>
          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
            (Coinbase Wallet only)
          </span>
        </>
      )}
    </div>
  );
};

export default PaymasterBanner;