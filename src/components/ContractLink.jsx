import React from 'react';
import { useChainId } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { getNetworkKeyByChainId } from '../config/networks';

const ContractLink = ({ contractName, style = {} }) => {
  const chainId = useChainId();
  const networkKey = getNetworkKeyByChainId(chainId);
  
  if (chainId !== baseSepolia.id || !networkKey) return null;
  
  const contractAddress = CONTRACT_ADDRESSES[networkKey]?.[contractName];
  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') return null;
  
  const explorerUrl = `https://base-sepolia.basescan.org/address/${contractAddress}`;
  
  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#60a5fa',
        textDecoration: 'none',
        fontSize: '0.875rem',
        padding: '0.5rem 1rem',
        background: 'rgba(96, 165, 250, 0.1)',
        border: '1px solid rgba(96, 165, 250, 0.3)',
        borderRadius: '0.5rem',
        transition: 'all 0.2s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
      }}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M10 14L21 3M21 3H15M21 3V9M14 21H5C4.44772 21 4 20.5523 4 20V11C4 10.4477 4.44772 10 5 10H10" />
      </svg>
      View Contract on Basescan
    </a>
  );
};

export default ContractLink;