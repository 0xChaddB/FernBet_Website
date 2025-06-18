import React from 'react'
import BlackjackResponsive from '../components/BlackjackResponsive'
import DiceGameResponsive from '../components/DiceGameResponsive'
import RouletteGame from '../components/RouletteGame'
import SlotsGame from '../components/SlotsGame'
import SmartWalletConnect from '../components/SmartWalletConnect'

const GamePage = ({ currentGame, onNavigateHome, onNavigateToGames }) => {
  const renderGame = () => {
    switch(currentGame) {
      case 'dice':
        return <DiceGameResponsive demoMode={false} />
      case 'roulette':
        return <RouletteGame demoMode={false} />
      case 'slots':
        return <SlotsGame demoMode={false} />
      case 'blackjack':
      default:
        return <BlackjackResponsive demoMode={false} />
    }
  }

  const getGameTitle = () => {
    switch(currentGame) {
      case 'dice':
        return 'Dice Game'
      case 'roulette':
        return 'Roulette'
      case 'slots':
        return 'Slots'
      case 'blackjack':
      default:
        return 'Blackjack'
    }
  }
  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: '#0f172a',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header avec navigation */}
      <nav style={{
        padding: '0.5rem 1rem',
        borderBottom: '1px solid rgba(52, 211, 153, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onNavigateHome}
            style={{
              background: 'transparent',
              border: '1px solid rgba(52, 211, 153, 0.5)',
              color: '#34d399',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
              <path d="M20 12H4M4 12L10 18M4 12L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </button>

          <button
            onClick={onNavigateToGames}
            style={{
              background: 'transparent',
              border: '1px solid rgba(52, 211, 153, 0.5)',
              color: '#34d399',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Games
          </button>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#34d399'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
              <path d="M12 2L12 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 7C7 7 10 10 12 12C14 10 17 7 17 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 12C5 12 8 15 12 17C16 15 19 12 19 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 17C3 17 7 20 12 22C17 20 21 17 21 17" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            FernBet - {getGameTitle()}
          </div>
        </div>
        
        <SmartWalletConnect variant="navbar" />
      </nav>

      {/* Contenu du jeu */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {renderGame()}
      </div>
    </div>
  )
}

export default GamePage