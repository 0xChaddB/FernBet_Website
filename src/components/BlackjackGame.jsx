import React, { useState, useEffect } from 'react'
import { useBlackjackContract } from '../hooks/useBlackjackContract'
import { useCHIPBalance } from '../hooks/useCHIPToken'
import { useMockBlackjackContract } from '../hooks/useMockBlackjack'
import CHIPBalance from './CHIPBalance'
import CHIPBalanceDemo from './CHIPBalanceDemo'
import SmartWalletConnect from './SmartWalletConnect'

// Composant de carte avec animation de distribution depuis le deck
const GameCard = ({ card, isHidden = false, animationDelay = 0, startAnimation = false }) => {
  const [position, setPosition] = useState('deck') // deck, flying, landed
  const [isFlipped, setIsFlipped] = useState(isHidden)

  const formatCard = (cardIndex) => {
    const suits = ['♠️', '♥️', '♦️', '♣️']
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    
    const suit = suits[Math.floor(cardIndex / 13)]
    const rank = ranks[cardIndex % 13]
    
    return { rank, suit, display: `${rank}${suit}` }
  }

  useEffect(() => {
    if (startAnimation) {
      const timer1 = setTimeout(() => {
        setPosition('flying')
      }, animationDelay)

      const timer2 = setTimeout(() => {
        setPosition('landed')
        // Si la carte n'est pas cachée, la retourner immédiatement
        if (!isHidden) {
          setIsFlipped(false)
        }
      }, animationDelay + 600)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [startAnimation, animationDelay, isHidden])

  // Révéler la carte cachée plus tard (pour le dealer)
  useEffect(() => {
    if (isHidden === false && isFlipped && position === 'landed') {
      setTimeout(() => {
        setIsFlipped(false)
      }, 300)
    }
  }, [isHidden, isFlipped, position])

  const formattedCard = card !== undefined ? formatCard(card) : null

  const getTransform = () => {
    switch (position) {
      case 'deck':
        return 'translate(200px, 0px) scale(0.8)'
      case 'flying':
        return 'translate(0px, 0px) scale(0.9)'
      case 'landed':
        return 'translate(0px, 0px) scale(1)'
      default:
        return 'translate(0px, 0px) scale(1)'
    }
  }

  const getOpacity = () => {
    return position === 'deck' ? 0 : 1
  }

  return (
    <div
      style={{
        perspective: '1000px',
        transform: getTransform(),
        opacity: getOpacity(),
        transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        zIndex: position === 'flying' ? 20 : 1
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '60px',
          height: '84px',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (position === 'landed' && !isFlipped) {
            e.currentTarget.style.transform = 'rotateY(0deg) translateY(-5px)'
          }
        }}
        onMouseLeave={(e) => {
          if (position === 'landed' && !isFlipped) {
            e.currentTarget.style.transform = 'rotateY(0deg) translateY(0px)'
          }
        }}
      >
        {/* Face cachée */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(145deg, #1e3a8a, #2563eb)',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
            boxShadow: '0 6px 12px rgba(0,0,0,0.4)'
          }}
        >
          🂠
        </div>

        {/* Face visible */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            background: 'white',
            color: formattedCard && (formattedCard.suit === '♥️' || formattedCard.suit === '♦️') ? '#dc2626' : '#1f2937',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1rem',
            textAlign: 'center',
            boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #e5e7eb'
          }}
        >
          {formattedCard ? formattedCard.display : ''}
        </div>
      </div>
    </div>
  )
}

// Deck de cartes fixe sur le côté
const CardDeck = ({ cardsRemaining = 52, isDealing = false, isVisible = true, showCardCount = true }) => {
  if (!isVisible) return null
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      right: '2rem',
      transform: 'translateY(-50%)',
      zIndex: 5,
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '1rem',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          fontSize: '0.9rem',
          color: '#94a3b8',
          marginBottom: '0.5rem',
          fontWeight: '600'
        }}>
          Deck
        </div>
        
        {/* Pile de cartes */}
        <div style={{ 
          position: 'relative',
          transform: isDealing ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease'
        }}>
          {[...Array(Math.min(6, Math.ceil(cardsRemaining / 8)))].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '60px',
                height: '84px',
                background: 'linear-gradient(145deg, #1e3a8a, #2563eb)',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
                transform: `translate(${i * -2}px, ${i * -2}px)`,
                zIndex: 10 - i
              }}
            >
              🂠
            </div>
          ))}
        </div>

        {/* Indicateur de cartes - only show if showCardCount is true */}
        {showCardCount && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            fontSize: '0.9rem',
            color: '#60a5fa',
            fontWeight: '600',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginTop: '2rem'
          }}>
            {cardsRemaining} cartes
          </div>
        )}
      </div>
    </div>
  )
}

const BlackjackGame = ({ demoMode = false }) => {
  // Mock contract for demo mode
  const mockContract = useMockBlackjackContract()
  
  // Real blockchain integration
  const realContract = useBlackjackContract()
  const { balance: realChipBalance } = useCHIPBalance()
  
  // Use mock or real based on demo mode
  const {
    gameState: contractGameState,
    startGame,
    hit,
    stand,
    resolveGame,
    isConnected,
    sessionActive,
    createGameSession,
    revokeSession
  } = demoMode ? mockContract : realContract
  
  const chipBalance = demoMode ? mockContract.useMockCHIPBalance().balance : realChipBalance
  
  // Local UI state
  const [localGameState, setLocalGameState] = useState({
    isAnimating: false,
    cardsRemaining: 52,
    dealingAnimation: false,
    message: 'Connect wallet to play',
    showResultPopup: false,
    gameResult: null
  })
  
  const [betAmount, setBetAmount] = useState('1') // Default 1 CHIP

  // Merge contract state with local UI state
  const gameState = {
    ...contractGameState,
    ...localGameState,
    balance: chipBalance
  }

  // Use playerScore and dealerScore from contract
  const playerScore = contractGameState.playerScore
  const dealerScore = contractGameState.dealerScore

  const handleStartGame = async () => {
    const bet = parseFloat(betAmount)
    const balance = parseFloat(chipBalance)
    
    if (bet <= 0) {
      setLocalGameState(prev => ({ ...prev, message: 'Please enter a valid bet amount' }))
      return
    }
    
    if (bet > balance) {
      setLocalGameState(prev => ({ ...prev, message: 'Insufficient CHIP balance' }))
      return
    }

    // Start animation
    setLocalGameState(prev => ({ 
      ...prev, 
      isAnimating: true, 
      dealingAnimation: true,
      message: 'Starting game...' 
    }))

    try {
      await startGame(bet)
      
      // Animation will be triggered by contract state update
      setTimeout(() => {
        setLocalGameState(prev => ({
          ...prev,
          dealingAnimation: false
        }))
      }, 1500)
    } catch (error) {
      setLocalGameState(prev => ({
        ...prev,
        isAnimating: false,
        dealingAnimation: false,
        message: 'Failed to start game'
      }))
    }
  }

  const handleHit = async () => {
    if (playerScore >= 21 || localGameState.isAnimating) return
    
    setLocalGameState(prev => ({ ...prev, isAnimating: true, dealingAnimation: true }))
    
    try {
      const result = await hit()
      
      // If demo mode and player busted, hit() returns the result from auto-resolve
      if (result && demoMode) {
        setLocalGameState(prev => ({
          ...prev,
          isAnimating: false,
          dealingAnimation: false,
          showResultPopup: true,
          gameResult: result
        }))
      } else {
        setTimeout(() => {
          setLocalGameState(prev => ({ ...prev, isAnimating: false, dealingAnimation: false }))
        }, 800)
      }
    } catch (error) {
      setLocalGameState(prev => ({ ...prev, isAnimating: false, dealingAnimation: false }))
    }
  }

  const handleStand = async () => {
    setLocalGameState(prev => ({ 
      ...prev, 
      message: 'Standing...',
      isAnimating: true
    }))

    try {
      const result = await stand()
      
      // If demo mode, stand() returns the result from auto-resolve
      if (result && demoMode) {
        setLocalGameState(prev => ({
          ...prev,
          isAnimating: false,
          dealingAnimation: false,
          showResultPopup: true,
          gameResult: result
        }))
      } else {
        // Real mode - wait for manual resolve
        setTimeout(() => {
          setLocalGameState(prev => ({
            ...prev,
            isAnimating: false,
            dealingAnimation: false
          }))
        }, 1200)
      }
    } catch (error) {
      setLocalGameState(prev => ({ ...prev, isAnimating: false }))
    }
  }

  const handleResolveGame = async () => {
    try {
      const result = await resolveGame()
      
      if (result) {
        setLocalGameState(prev => ({
          ...prev,
          showResultPopup: true,
          gameResult: result
        }))
      }
    } catch (error) {
      setLocalGameState(prev => ({
        ...prev,
        message: 'Failed to resolve game'
      }))
    }
  }

  const newGame = () => {
    // Contract state will reset automatically
    setLocalGameState(prev => ({
      ...prev,
      isAnimating: false,
      dealingAnimation: false,
      message: isConnected ? 'Choose your bet to start a new game' : 'Connect wallet to play'
    }))
    setBetAmount('1')
  }

  // Update local messages based on game state
  useEffect(() => {
    if (!isConnected && !demoMode) {
      setLocalGameState(prev => ({ ...prev, message: 'Connect wallet to play' }))
      return
    }

    // Clear animation state when game state changes
    if (contractGameState.status === 'playing' && contractGameState.playerCards.length > 0) {
      setLocalGameState(prev => ({ ...prev, isAnimating: false }))
    }

    if (contractGameState.status === 'playing' && !localGameState.isAnimating) {
      if (playerScore > 21) {
        setLocalGameState(prev => ({ ...prev, message: '💥 You busted! Resolve to finish.' }))
      } else if (playerScore === 21) {
        setLocalGameState(prev => ({ ...prev, message: 'Blackjack! Stand to see if dealer can match.' }))
      } else {
        setLocalGameState(prev => ({ ...prev, message: contractGameState.message || 'Hit or Stand?' }))
      }
    } else if (contractGameState.status === 'gameOver') {
      setLocalGameState(prev => ({ ...prev, message: 'Game finished! Click Resolve to see results.' }))
    } else if (contractGameState.status === 'idle' && !contractGameState.isLoading) {
      setLocalGameState(prev => ({ ...prev, message: 'Choose your bet to start playing' }))
    }
  }, [isConnected, contractGameState, playerScore, demoMode])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1e293b, #065f46)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Deck de cartes - visible seulement pendant le jeu */}
      <CardDeck 
        cardsRemaining={gameState.cardsRemaining} 
        isDealing={gameState.dealingAnimation}
        isVisible={contractGameState.isInGame}
        showCardCount={false}
      />

      {/* Wallet Connection and Balance */}
      {!demoMode && (
        <div style={{ marginBottom: '1rem' }}>
          <SmartWalletConnect />
        </div>
      )}
      
      {/* CHIP Balance Display */}
      {demoMode ? (
        <CHIPBalanceDemo mockContract={mockContract} />
      ) : (
        isConnected && <CHIPBalance />
      )}
      
      {/* Session Management */}
      {isConnected && !demoMode && (
        <div style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '0.5rem',
          padding: '0.5rem',
          marginBottom: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#a78bfa', fontSize: '0.8rem' }}>
            {sessionActive ? '✅ Session active' : '❌ No session'}
          </span>
          {!sessionActive ? (
            <button
              onClick={createGameSession}
              style={{
                background: '#8b5cf6',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Create Session
            </button>
          ) : (
            <button
              onClick={revokeSession}
              style={{
                background: '#6b7280',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Revoke Session
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '0.5rem',
        borderBottom: '1px solid rgba(52, 211, 153, 0.3)',
        paddingBottom: '0.5rem',
        flexShrink: 0
      }}>
        <h2 style={{ 
          fontSize: '1.2rem', 
          fontWeight: 'bold', 
          color: '#34d399',
          margin: '0 0 0.25rem 0'
        }}>
          ♠️ Blackjack ♥️
        </h2>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}>
          <span>Balance: <strong style={{ color: '#34d399' }}>{gameState.balance} CHIP</strong></span>
          <span>Bet: <strong style={{ color: '#fbbf24' }}>{gameState.bet} CHIP</strong></span>
        </div>
      </div>

      {/* Zone de jeu */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        padding: '0.5rem',
        paddingRight: contractGameState.isInGame ? '140px' : '0.5rem', // Space for deck
        overflow: 'auto'
      }}>
        
        {/* Zone Dealer */}
        {contractGameState.status !== 'idle' && contractGameState.isInGame && (
          <div style={{ marginBottom: '1rem' }}>
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
                {contractGameState.status === 'playing' ? '?' : dealerScore}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              minHeight: '100px',
              alignItems: 'center'
            }}>
              {contractGameState.dealerCards.map((card, index) => (
                <GameCard
                  key={`dealer-${index}-${contractGameState.status}`}
                  card={typeof card === 'object' ? card.index : card}
                  isHidden={contractGameState.status === 'playing' && index === 1}
                  animationDelay={index * 400}
                  startAnimation={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Zone Joueur */}
        {contractGameState.status !== 'idle' && contractGameState.isInGame && (
          <div style={{ marginBottom: '1rem' }}>
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
                color: playerScore > 21 ? '#ef4444' : '#34d399',
                background: playerScore > 21 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                {playerScore}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              minHeight: '100px',
              alignItems: 'center'
            }}>
              {contractGameState.playerCards.map((card, index) => (
                <GameCard
                  key={`player-${index}`}
                  card={typeof card === 'object' ? card.index : card}
                  isHidden={false}
                  animationDelay={200 + (index * 400) + 800} // Après les cartes du dealer
                  startAnimation={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          marginBottom: '1rem',
          flexShrink: 0
        }}>
          {contractGameState.status === 'idle' && isConnected && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '1.5rem',
              width: '100%',
              maxWidth: '450px'
            }}>
              {/* Interface de mise */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem',
                borderRadius: '1rem',
                width: '100%',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <label style={{ 
                    color: '#a7f3d0', 
                    fontSize: '1.2rem', 
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    💰 Choose Your Bet
                  </label>
                </div>
                
                {/* Montants rapides */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.75rem', 
                  marginBottom: '1.5rem'
                }}>
                  {['1', '5', '10', '25'].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      style={{
                        background: betAmount === amount 
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        color: betAmount === amount ? 'white' : '#cbd5e1',
                        border: betAmount === amount ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {amount} CHIP
                    </button>
                  ))}
                </div>
                
                {/* Input personnalisé */}
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.01"
                  max={gameState.balance}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    outline: 'none',
                    marginBottom: '1rem'
                  }}
                  placeholder="Enter custom amount"
                />
                
                {/* Infos min/max */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  color: '#94a3b8'
                }}>
                  <span>Min: 0.01 CHIP</span>
                  <span>Max: {gameState.balance} CHIP</span>
                </div>
              </div>
              
              {/* Bouton Start Game */}
              <button
                onClick={handleStartGame}
                disabled={!isConnected || !betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > parseFloat(gameState.balance) || contractGameState.isLoading}
                style={{
                  background: (!isConnected || !betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > parseFloat(gameState.balance) || contractGameState.isLoading) 
                    ? '#6b7280' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '1.25rem 3rem',
                  borderRadius: '1rem',
                  border: 'none',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  cursor: (!isConnected || !betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > parseFloat(gameState.balance) || contractGameState.isLoading) 
                    ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {contractGameState.isLoading ? '🔄 Processing...' : `🎮 Deal Cards (${betAmount} CHIP)`}
              </button>
            </div>
          )}
          
          {contractGameState.status === 'playing' && (
            <>
              <button
                onClick={handleHit}
                disabled={contractGameState.isLoading || localGameState.isAnimating || playerScore >= 21}
                style={{
                  background: (contractGameState.isLoading || localGameState.isAnimating || playerScore >= 21) ? '#6b7280' : '#3b82f6',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: (contractGameState.isLoading || localGameState.isAnimating || playerScore >= 21) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '120px'
                }}
              >
                {contractGameState.isLoading || localGameState.isAnimating ? '🔄 Drawing...' : '👊 Hit'}
              </button>
              
              <button
                onClick={handleStand}
                disabled={contractGameState.isLoading || localGameState.isAnimating}
                style={{
                  background: (contractGameState.isLoading || localGameState.isAnimating) ? '#6b7280' : '#f59e0b',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: (contractGameState.isLoading || localGameState.isAnimating) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '120px'
                }}
              >
                ✋ Stand
              </button>
            </>
          )}
          
          {contractGameState.status === 'gameOver' && !demoMode && (
            <button
              onClick={handleResolveGame}
              disabled={contractGameState.isLoading}
              style={{
                background: contractGameState.isLoading ? '#6b7280' : '#8b5cf6',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: contractGameState.isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '140px'
              }}
            >
              {contractGameState.isLoading ? '🔄 Resolving...' : '💰 Resolve Game'}
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
          border: '1px solid rgba(255, 255, 255, 0.2)',
          flexShrink: 0,
          backdropFilter: 'blur(10px)'
        }}>
          {gameState.message}
        </div>
      </div>
      
      
      {/* Game Result Popup */}
      {localGameState.showResultPopup && localGameState.gameResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #065f46)',
            padding: '2rem',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '400px',
            color: 'white',
            textAlign: 'center',
            border: '2px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Result Icon */}
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {localGameState.gameResult.result === 'win' ? '🎉' : 
               localGameState.gameResult.result === 'push' ? '🤝' : '😞'}
            </div>
            
            {/* Result Message */}
            <h2 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '1rem',
              color: localGameState.gameResult.result === 'win' ? '#34d399' : 
                     localGameState.gameResult.result === 'push' ? '#fbbf24' : '#ef4444'
            }}>
              {localGameState.gameResult.message}
            </h2>
            
            {/* Winnings Info */}
            {localGameState.gameResult.winnings > 0 && (
              <div style={{
                background: 'rgba(52, 211, 153, 0.1)',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(52, 211, 153, 0.3)'
              }}>
                <p style={{ margin: 0, fontSize: '1.2rem' }}>
                  You won: <strong style={{ color: '#34d399' }}>
                    {localGameState.gameResult.winnings} CHIP
                  </strong>
                </p>
                {localGameState.gameResult.result === 'win' && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>
                    (Bet: {contractGameState.bet} CHIP × 2)
                  </p>
                )}
              </div>
            )}
            
            {/* Score Summary */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Your Score</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {playerScore}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Dealer Score</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {dealerScore}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setLocalGameState(prev => ({
                    ...prev,
                    showResultPopup: false,
                    gameResult: null
                  }))
                  newGame()
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🎯 Play Again
              </button>
              
              <button
                onClick={() => {
                  setLocalGameState(prev => ({
                    ...prev,
                    showResultPopup: false,
                    gameResult: null
                  }))
                }}
                style={{
                  flex: 1,
                  background: '#6b7280',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlackjackGame