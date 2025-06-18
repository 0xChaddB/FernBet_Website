import React from 'react'

const DebugInfo = ({ gameState, chipBalance }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Debug Info</h4>
      <pre style={{ margin: 0 }}>
        {JSON.stringify({
          status: gameState.status,
          isInGame: gameState.isInGame,
          isLoading: gameState.isLoading,
          playerCards: gameState.playerCards.length,
          dealerCards: gameState.dealerCards.length,
          playerScore: gameState.playerScore,
          dealerScore: gameState.dealerScore,
          bet: gameState.bet,
          balance: chipBalance,
          message: gameState.message
        }, null, 2)}
      </pre>
    </div>
  )
}

export default DebugInfo