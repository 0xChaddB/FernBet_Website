import React, { useState } from 'react'

const BlackjackGame = () => {
  const [isConnected, setIsConnected] = useState(false) // Simulation
  const [gameState, setGameState] = useState({
    playerCards: [12, 25], // Roi de pique, 3 de coeur
    dealerCards: [7], // 8 de pique
    playerScore: 23,
    dealerScore: 8,
    bet: '0.5',
    balance: '5.0',
    gameStatus: 'playing', // playing, playerStood, gameOver
    message: 'Hit or Stand?',
    isAnimating: false
  })

  // Fonction pour convertir une carte (0-51) en valeur lisible
  const formatCard = (cardIndex) => {
    const suits = ['♠️', '♥️', '♦️', '♣️']
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    
    const suit = suits[Math.floor(cardIndex / 13)]
    const rank = ranks[cardIndex % 13]
    
    return { rank, suit, display: `${rank}${suit}` }
  }

  const hit = () => {
    setGameState(prev => ({ ...prev, isAnimating: true }))
    setTimeout(() => {
      const newCard = Math.floor(Math.random() * 52)
      setGameState(prev => ({
        ...prev,
        playerCards: [...prev.playerCards, newCard],
        isAnimating: false,
        message: 'Hit or Stand?'
      }))
    }, 600)
  }

  const stand = () => {
    setGameState(prev => ({ 
      ...prev, 
      gameStatus: 'playerStood',
      message: 'Dealer is playing...'
    }))
    
    setTimeout(() => {
      const newCard = Math.floor(Math.random() * 52)
      setGameState(prev => ({
        ...prev,
        dealerCards: [...prev.dealerCards, newCard],
        gameStatus: 'gameOver',
        message: 'Game Over!'
      }))
    }, 1500)
  }

  const newGame = () => {
    setGameState(prev => ({
      ...prev,
      playerCards: [Math.floor(Math.random() * 52), Math.floor(Math.random() * 52)],
      dealerCards: [Math.floor(Math.random() * 52)],
      gameStatus: 'playing',
      message: 'Hit or Stand?'
    }))
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '1rem',
      background: 'linear-gradient(135deg, #1e293b, #065f46)',
      borderRadius: '1rem',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      minHeight: 'calc(100vh - 2rem)'
    }}>
      {/* Message si pas connecté */}
      {!isConnected && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '2px dashed rgba(59, 130, 246, 0.3)',
          borderRadius: '1rem',
          padding: '1.5rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔗</div>
          <h3 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Connect to Play with Real Money</h3>
          <p style={{ color: '#93c5fd', fontSize: '0.9rem' }}>
            You can try the demo below, but connect your wallet to play with real ETH!
          </p>
        </div>
      )}
      {/* Header simple */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(52, 211, 153, 0.3)',
        paddingBottom: '1rem'
      }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 'bold', 
          color: '#34d399',
          margin: '0 0 0.5rem 0'
        }}>
          ♠️ Blackjack ♥️
        </h2>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          fontSize: '0.9rem',
          color: '#94a3b8'
        }}>
          <span>Balance: <strong style={{ color: '#34d399' }}>{gameState.balance} ETH</strong></span>
          <span>Bet: <strong style={{ color: '#fbbf24' }}>{gameState.bet} ETH</strong></span>
        </div>
      </div>

      {/* Dealer */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <span style={{ 
            color: '#f87171', 
            fontWeight: '600',
            fontSize: '1.1rem'
          }}>
            🎭 Dealer
          </span>
          <span style={{ 
            color: '#f87171', 
            background: 'rgba(248, 113, 113, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            {gameState.gameStatus === 'playing' ? '?' : gameState.dealerScore}
          </span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          minHeight: '120px',
          alignItems: 'center'
        }}>
          {gameState.dealerCards.map((card, index) => {
            const formattedCard = formatCard(card)
            return (
              <div key={index} style={{
                background: 'white',
                color: formattedCard.suit === '♥️' || formattedCard.suit === '♦️' ? '#ef4444' : '#1f2937',
                padding: '1rem 0.75rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                minWidth: '60px',
                height: '90px',
                textAlign: 'center',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                {formattedCard.display}
              </div>
            )
          })}
          
          {gameState.gameStatus === 'playing' && (
            <div style={{
              background: 'linear-gradient(145deg, #1e3a8a, #1e40af)',
              border: '2px solid #3b82f6',
              padding: '1rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '1.5rem',
              minWidth: '60px',
              height: '90px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              🂠
            </div>
          )}
        </div>
      </div>

      {/* Player */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <span style={{ 
            color: '#34d399', 
            fontWeight: '600',
            fontSize: '1.1rem'
          }}>
            🌿 You
          </span>
          <span style={{ 
            color: gameState.playerScore > 21 ? '#ef4444' : '#34d399',
            background: gameState.playerScore > 21 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 211, 153, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            {gameState.playerScore}
          </span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          minHeight: '120px',
          alignItems: 'center'
        }}>
          {gameState.playerCards.map((card, index) => {
            const formattedCard = formatCard(card)
            return (
              <div key={index} style={{
                background: 'white',
                color: formattedCard.suit === '♥️' || formattedCard.suit === '♦️' ? '#ef4444' : '#1f2937',
                padding: '1rem 0.75rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                minWidth: '60px',
                height: '90px',
                textAlign: 'center',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                {formattedCard.display}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        {gameState.gameStatus === 'playing' && (
          <>
            <button
              onClick={hit}
              disabled={gameState.isAnimating}
              style={{
                background: gameState.isAnimating ? '#6b7280' : '#3b82f6',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: gameState.isAnimating ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px'
              }}
            >
              {gameState.isAnimating ? '🔄 Drawing...' : '👊 Hit'}
            </button>
            
            <button
              onClick={stand}
              disabled={gameState.isAnimating}
              style={{
                background: gameState.isAnimating ? '#6b7280' : '#f59e0b',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: gameState.isAnimating ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px'
              }}
            >
              ✋ Stand
            </button>
          </>
        )}
        
        {gameState.gameStatus === 'gameOver' && (
          <button
            onClick={newGame}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
          >
            🎯 New Game
          </button>
        )}
      </div>

      {/* Message */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '1rem',
        borderRadius: '0.75rem',
        textAlign: 'center',
        fontSize: '1.1rem',
        color: '#e2e8f0',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {gameState.message}
      </div>
    </div>
  )
}

export default BlackjackGame