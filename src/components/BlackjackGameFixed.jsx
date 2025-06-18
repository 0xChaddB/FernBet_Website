import React, { useState, useEffect } from 'react'
import { useBlackjackContract } from '../hooks/useBlackjackContract'
import { useCHIPBalance } from '../hooks/useCHIPToken'
import { useMockBlackjackContract } from '../hooks/useMockBlackjack'
import CHIPBalance from './CHIPBalance'
import CHIPBalanceDemo from './CHIPBalanceDemo'
import SmartWalletConnect from './SmartWalletConnect'

// Card component with animation
const GameCard = ({ card, isHidden = false, animationDelay = 0, startAnimation = false }) => {
  const [position, setPosition] = useState('deck')
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
      >
        {/* Hidden face */}
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

        {/* Visible face */}
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

// Card deck component
const CardDeck = ({ isDealing = false, isVisible = true }) => {
  if (!isVisible) return null
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      right: '10%',
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
          fontWeight: '600'
        }}>
          Deck
        </div>
        
        <div style={{ 
          position: 'relative',
          transform: isDealing ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease'
        }}>
          {[...Array(6)].map((_, i) => (
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
  
  const [betAmount, setBetAmount] = useState('1')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResultPopup, setShowResultPopup] = useState(false)
  const [gameResult, setGameResult] = useState(null)

  const calculateHandValue = (cards) => {
    let total = 0
    let aces = 0
    
    for (const cardIndex of cards) {
      const index = typeof cardIndex === 'object' ? cardIndex.index : cardIndex
      const cardRank = index % 13
      
      if (cardRank === 0) {
        aces++
        total += 11
      } else if (cardRank >= 10) {
        total += 10
      } else {
        total += cardRank + 1
      }
    }
    
    while (total > 21 && aces > 0) {
      total -= 10
      aces--
    }
    
    return total
  }

  const playerScore = contractGameState.playerCards.length > 0 ? 
    calculateHandValue(contractGameState.playerCards) : 0
  const dealerScore = contractGameState.dealerCards.length > 0 ? 
    calculateHandValue(contractGameState.dealerCards) : 0

  const handleStartGame = async () => {
    const bet = parseFloat(betAmount)
    const balance = parseFloat(chipBalance)
    
    if (bet <= 0 || bet > balance) return

    setIsAnimating(true)
    
    try {
      await startGame(bet)
      setTimeout(() => setIsAnimating(false), 1500)
    } catch (error) {
      setIsAnimating(false)
    }
  }

  const handleHit = async () => {
    if (playerScore >= 21 || isAnimating) return
    
    setIsAnimating(true)
    
    try {
      const result = await hit()
      
      if (result && demoMode) {
        setShowResultPopup(true)
        setGameResult(result)
      }
      
      setTimeout(() => setIsAnimating(false), 800)
    } catch (error) {
      setIsAnimating(false)
    }
  }

  const handleStand = async () => {
    setIsAnimating(true)
    
    try {
      const result = await stand()
      
      if (result && demoMode) {
        setShowResultPopup(true)
        setGameResult(result)
      }
      
      setTimeout(() => setIsAnimating(false), 1200)
    } catch (error) {
      setIsAnimating(false)
    }
  }

  const handleResolveGame = async () => {
    try {
      const result = await resolveGame()
      
      if (result) {
        setShowResultPopup(true)
        setGameResult(result)
      }
    } catch (error) {
      console.error('Failed to resolve game')
    }
  }

  const newGame = () => {
    setShowResultPopup(false)
    setGameResult(null)
    setBetAmount('1')
  }

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
      {/* Card deck */}
      <CardDeck 
        isDealing={isAnimating}
        isVisible={contractGameState.isInGame}
      />

      {/* Wallet Connection and Balance */}
      {!demoMode && (
        <div style={{ marginBottom: '0.5rem' }}>
          <SmartWalletConnect />
        </div>
      )}
      
      {/* CHIP Balance Display */}
      {demoMode ? (
        <CHIPBalanceDemo mockContract={mockContract} />
      ) : (
        isConnected && <CHIPBalance />
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
          <span>Balance: <strong style={{ color: '#34d399' }}>{chipBalance} CHIP</strong></span>
          <span>Bet: <strong style={{ color: '#fbbf24' }}>{contractGameState.bet} CHIP</strong></span>
        </div>
      </div>

      {/* Game area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        padding: '0.5rem',
        paddingRight: contractGameState.isInGame ? '200px' : '0.5rem',
        overflow: 'auto'
      }}>
        
        {/* Dealer area */}
        {contractGameState.isInGame && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ 
                color: '#f87171', 
                fontWeight: '600',
                fontSize: '1rem'
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
                {contractGameState.status === 'playing' && contractGameState.dealerCards.length > 1 ? '?' : dealerScore}
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
                  key={`dealer-${index}`}
                  card={typeof card === 'object' ? card.index : card}
                  isHidden={contractGameState.status === 'playing' && index === 1}
                  animationDelay={index * 400}
                  startAnimation={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Player area */}
        {contractGameState.isInGame && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ 
                color: '#34d399', 
                fontWeight: '600',
                fontSize: '1rem'
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
                  animationDelay={200 + (index * 400) + 800}
                  startAnimation={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          marginBottom: '0.5rem',
          flexShrink: 0
        }}>
          {contractGameState.status === 'idle' && isConnected && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '1rem',
              width: '100%',
              maxWidth: '400px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem',
                borderRadius: '1rem',
                width: '100%',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  <label style={{ 
                    color: '#a7f3d0', 
                    fontSize: '1rem', 
                    fontWeight: '600'
                  }}>
                    💰 Choose Your Bet
                  </label>
                </div>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem', 
                  marginBottom: '1rem'
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
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {amount} CHIP
                    </button>
                  ))}
                </div>
                
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.01"
                  max={chipBalance}
                  step="1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '1rem',
                    textAlign: 'center',
                    outline: 'none',
                    marginBottom: '0.5rem'
                  }}
                />
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#94a3b8'
                }}>
                  <span>Min: 0.01 CHIP</span>
                  <span>Max: {chipBalance} CHIP</span>
                </div>
              </div>
              
              <button
                onClick={handleStartGame}
                disabled={!betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > parseFloat(chipBalance) || contractGameState.isLoading}
                style={{
                  background: (!betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > parseFloat(chipBalance) || contractGameState.isLoading) 
                    ? '#6b7280' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '1rem 2.5rem',
                  borderRadius: '1rem',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: (!betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > parseFloat(chipBalance) || contractGameState.isLoading) 
                    ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
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
                disabled={contractGameState.isLoading || isAnimating || playerScore >= 21}
                style={{
                  background: (contractGameState.isLoading || isAnimating || playerScore >= 21) ? '#6b7280' : '#3b82f6',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: (contractGameState.isLoading || isAnimating || playerScore >= 21) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '120px'
                }}
              >
                {contractGameState.isLoading || isAnimating ? '🔄 Drawing...' : '👊 Hit'}
              </button>
              
              <button
                onClick={handleStand}
                disabled={contractGameState.isLoading || isAnimating}
                style={{
                  background: (contractGameState.isLoading || isAnimating) ? '#6b7280' : '#f59e0b',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: (contractGameState.isLoading || isAnimating) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '120px'
                }}
              >
                ✋ Stand
              </button>
            </>
          )}
          
          {contractGameState.status === 'gameOver' && (
            <button
              onClick={demoMode ? newGame : handleResolveGame}
              disabled={contractGameState.isLoading}
              style={{
                background: contractGameState.isLoading ? '#6b7280' : '#8b5cf6',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: contractGameState.isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '140px'
              }}
            >
              {contractGameState.isLoading ? '🔄 Resolving...' : (demoMode ? '🎯 New Game' : '💰 Resolve Game')}
            </button>
          )}
        </div>

        {/* Message */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '0.75rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          fontSize: '1rem',
          color: '#e2e8f0',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          flexShrink: 0,
          backdropFilter: 'blur(10px)'
        }}>
          {contractGameState.message}
        </div>
      </div>

      {/* Game Result Popup */}
      {showResultPopup && gameResult && (
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {gameResult.result === 'win' ? '🎉' : 
               gameResult.result === 'push' ? '🤝' : '😞'}
            </div>
            
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1rem',
              color: gameResult.result === 'win' ? '#34d399' : 
                     gameResult.result === 'push' ? '#fbbf24' : '#ef4444'
            }}>
              {gameResult.message}
            </h2>
            
            {gameResult.winnings > 0 && (
              <div style={{
                background: 'rgba(52, 211, 153, 0.1)',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                border: '1px solid rgba(52, 211, 153, 0.3)'
              }}>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  You won: <strong style={{ color: '#34d399' }}>
                    {gameResult.winnings} CHIP
                  </strong>
                </p>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Your Score</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {playerScore}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Dealer Score</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {dealerScore}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowResultPopup(false)
                setGameResult(null)
                newGame()
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🎯 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlackjackGame