import React from 'react'
import BlackjackGame from '../components/BlackjackGame'
import SmartWalletConnect from '../components/SmartWalletConnect'

const GamePage = ({ onNavigateHome }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b, #065f46)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header avec navigation */}
      <nav style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(52, 211, 153, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onNavigateHome}
            style={{
              background: 'transparent',
              border: '1px solid rgba(52, 211, 153, 0.5)',
              color: '#34d399',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Back to Home
          </button>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#34d399'
          }}>
            🌿 FernBet Casino
          </div>
        </div>
        
        <SmartWalletConnect variant="navbar" />
      </nav>

      {/* Contenu du jeu */}
      <div style={{ padding: '1rem' }}>
        <BlackjackGame />
      </div>
    </div>
  )
}

export default GamePage