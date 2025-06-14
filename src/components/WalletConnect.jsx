import React from 'react'

const WalletConnect = () => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '1rem',
      border: '2px dashed rgba(52, 211, 153, 0.3)'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
      <h3 style={{ 
        color: '#34d399', 
        marginBottom: '1rem',
        fontSize: '1.5rem'
      }}>
        Connect Your Wallet
      </h3>
      <p style={{ 
        color: '#94a3b8', 
        marginBottom: '2rem',
        lineHeight: '1.6'
      }}>
        Connect your wallet to start playing blockchain blackjack
      </p>
      
      <button
        style={{
          background: 'linear-gradient(135deg, #0052ff, #0040c7)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '0.75rem',
          border: 'none',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 82, 255, 0.3)'
        }}
      >
        🔗 Connect Wallet
      </button>
    </div>
  )
}

export default WalletConnect