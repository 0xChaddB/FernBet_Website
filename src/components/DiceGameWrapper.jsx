import React, { useState } from 'react'
import DiceGame from './DiceGame'
import CHIPBalance from './CHIPBalance'
import CHIPBalanceDemo from './CHIPBalanceDemo'
import SmartWalletConnect from './SmartWalletConnect'
import { useMockBlackjackContract } from '../hooks/useMockBlackjack'
import { useAccount } from 'wagmi'

const DiceGameWrapper = () => {
  const { isConnected } = useAccount()
  const [demoMode, setDemoMode] = useState(true)
  
  // Check if contracts are deployed by looking at the addresses
  const contractsDeployed = false // Set to true once you deploy contracts
  const mockContract = useMockBlackjackContract()
  
  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#0f172a'
    }}>
      {/* Top bar with wallet and balance */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        background: 'rgba(15, 23, 42, 0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Demo Mode Badge */}
          {!contractsDeployed && (
            <div style={{
              background: 'rgba(251, 191, 36, 0.2)',
              border: '1px solid rgba(251, 191, 36, 0.5)',
              borderRadius: '20px',
              padding: '5px 15px',
              fontSize: '0.85rem',
              color: '#fbbf24',
              fontWeight: '500'
            }}>
              Demo Mode
            </div>
          )}
          
          {/* Balance Display */}
          {demoMode ? (
            <div style={{
              background: 'rgba(52, 211, 153, 0.1)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              borderRadius: '8px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Balance:</span>
              <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '1.1rem' }}>
                {mockContract.useMockCHIPBalance().balance} CHIP
              </span>
              <button
                onClick={() => mockContract.useMockCasinoBank().useDepositETH().deposit(1)}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                +20 CHIP
              </button>
            </div>
          ) : (
            isConnected && <CHIPBalance />
          )}
        </div>
        
        {/* Wallet Connection */}
        {!demoMode && <SmartWalletConnect variant="navbar" />}
      </div>
      
      {/* Game */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <DiceGame demoMode={demoMode && !contractsDeployed} />
      </div>
    </div>
  )
}

export default DiceGameWrapper