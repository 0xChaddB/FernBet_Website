import React, { useState, useEffect } from 'react'
import { useBlackjackContract } from '../hooks/useBlackjackContract'
import { useCHIPBalance } from '../hooks/useCHIPToken'
import { useMockBlackjackContract } from '../hooks/useMockBlackjack'

// Modern card component
const Card = ({ value, isHidden = false, isNew = false }) => {
  const [showCard, setShowCard] = React.useState(!isNew)
  
  React.useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setShowCard(true), 50)
      return () => clearTimeout(timer)
    }
  }, [isNew])
  
  if (!value && !isHidden) return null

  const getCardDisplay = (cardIndex) => {
    const suits = ['♠', '♥', '♦', '♣']
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const suit = suits[Math.floor(cardIndex / 13)]
    const rank = ranks[cardIndex % 13]
    const isRed = suit === '♥' || suit === '♦'
    return { rank, suit, isRed }
  }

  const card = value !== undefined ? getCardDisplay(value) : null

  if (isHidden) {
    return (
      <div style={{
        width: '100px',
        height: '140px',
        background: 'linear-gradient(45deg, #2a4365 0%, #3182ce 50%, #2a4365 100%)',
        borderRadius: '10px',
        border: '2px solid #4a5568',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        color: '#e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: '10px',
          border: '2px solid #4a5568',
          borderRadius: '6px',
          opacity: 0.3
        }} />
        <span style={{ fontSize: '3rem' }}>?</span>
      </div>
    )
  }

  return (
    <div style={{
      width: '100px',
      height: '140px',
      background: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      color: card?.isRed ? '#dc2626' : '#1f2937',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'relative',
      fontWeight: 'bold',
      transform: showCard ? 'translateX(0) scale(1)' : 'translateX(100px) scale(0.8)',
      transition: 'all 0.5s ease-out',
      opacity: showCard ? 1 : 0
    }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '1.5rem' }}>
        {card?.rank}
      </div>
      <div style={{ fontSize: '3rem' }}>
        {card?.suit}
      </div>
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '1.5rem', transform: 'rotate(180deg)' }}>
        {card?.rank}
      </div>
    </div>
  )
}

// Chip selector component
const ChipSelector = ({ onAdd, betAmount }) => {
  const chips = [
    { value: 1, color: '#ef4444' },
    { value: 5, color: '#3b82f6' },
    { value: 10, color: '#10b981' },
    { value: 25, color: '#8b5cf6' },
    { value: 100, color: '#f59e0b' }
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }}>
      {chips.map(chip => (
        <button
          key={chip.value}
          onClick={() => onAdd(chip.value)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: chip.color,
            border: '3px solid rgba(255,255,255,0.4)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          +{chip.value}
        </button>
      ))}
    </div>
  )
}

const BlackjackModern = ({ demoMode = false }) => {
  // Contracts
  const mockContract = useMockBlackjackContract()
  const realContract = useBlackjackContract()
  const { balance: realChipBalance } = useCHIPBalance()
  
  const {
    gameState: contractGameState,
    startGame,
    hit,
    stand,
    resolveGame,
    isConnected
  } = demoMode ? mockContract : realContract
  
  const chipBalance = demoMode ? mockContract.useMockCHIPBalance().balance : realChipBalance
  
  // Local state
  const [betAmount, setBetAmount] = useState(5)
  const [showResult, setShowResult] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [customBet, setCustomBet] = useState('')
  const [playerHasMoved, setPlayerHasMoved] = useState(false)
  const [prevDealerCardsLength, setPrevDealerCardsLength] = useState(0)
  
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
  
  // Calculate visible dealer score (only first card when hidden)
  const visibleDealerScore = contractGameState.dealerCards.length > 0 && contractGameState.status === 'playing' && !playerHasMoved ? 
    calculateHandValue([contractGameState.dealerCards[0]]) : dealerScore

  const handleDeal = async () => {
    if (betAmount > parseFloat(chipBalance) || betAmount <= 0) return
    setShowResult(false)
    setPlayerHasMoved(false)
    await startGame(betAmount)
  }

  const handleHit = async () => {
    if (playerScore >= 21) return
    setPlayerHasMoved(true)
    await hit()
  }

  const handleStand = async () => {
    setPlayerHasMoved(true)
    await stand()
  }

  const handleResolve = async () => {
    const result = await resolveGame()
    if (result) {
      // Store the scores before they get reset
      setLastResult({
        ...result,
        playerScore: playerScore,
        dealerScore: dealerScore
      })
      setShowResult(true)
    }
  }

  // Auto-show result for bust
  useEffect(() => {
    if (playerScore > 21 && contractGameState.status === 'gameOver') {
      setTimeout(() => handleResolve(), 1000)
    }
  }, [playerScore, contractGameState.status])

  // Auto-show result after dealer finishes
  useEffect(() => {
    if (contractGameState.status === 'gameOver' && !showResult) {
      setTimeout(() => handleResolve(), 1500)
    }
  }, [contractGameState.status])

  // Track dealer cards changes
  useEffect(() => {
    if (contractGameState.dealerCards.length !== prevDealerCardsLength) {
      setPrevDealerCardsLength(contractGameState.dealerCards.length)
    }
  }, [contractGameState.dealerCards.length])

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e2e8f0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Table background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)',
        opacity: 0.8
      }} />
      
      {/* Content */}
      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(to right, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Blackjack
          </h1>
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Balance</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#34d399' }}>
                {parseFloat(chipBalance).toFixed(2)} CHIP
              </div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Current Bet</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24' }}>
                {contractGameState.bet || betAmount} CHIP
              </div>
            </div>
          </div>
        </div>

        {/* Game area */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          padding: '20px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          overflow: 'auto',
          minHeight: 0
        }}>
          {/* Dealer section */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '200px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1rem', 
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Dealer
              </h3>
              {contractGameState.isInGame && (
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#f87171',
                  marginTop: '10px'
                }}>
                  {visibleDealerScore}
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              minHeight: '140px'
            }}>
              {contractGameState.dealerCards.map((card, index) => (
                <Card
                  key={index}
                  value={typeof card === 'object' ? card.index : card}
                  isHidden={contractGameState.status === 'playing' && index === 1 && !playerHasMoved}
                  isNew={index >= prevDealerCardsLength && index >= 2}
                />
              ))}
            </div>
          </div>

          {/* Center divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)',
            margin: '20px 0'
          }} />

          {/* Player section */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '200px'
          }}>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              minHeight: '140px',
              marginBottom: '20px'
            }}>
              {contractGameState.playerCards.map((card, index) => (
                <Card
                  key={index}
                  value={typeof card === 'object' ? card.index : card}
                />
              ))}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              {contractGameState.isInGame && (
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: playerScore > 21 ? '#ef4444' : '#34d399',
                  marginBottom: '10px'
                }}>
                  {playerScore}
                </div>
              )}
              <h3 style={{ 
                margin: 0, 
                fontSize: '1rem', 
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Player
              </h3>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          flexShrink: 0
        }}>
          {contractGameState.status === 'idle' && (
            <div>
              {/* Betting controls on one line */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                marginBottom: '20px',
                flexWrap: 'wrap'
              }}>
                <ChipSelector 
                  onAdd={(value) => {
                    setBetAmount(prev => prev + value)
                    setCustomBet('')
                  }}
                  betAmount={betAmount}
                />
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(251, 191, 36, 0.5)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  minWidth: '120px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '3px' }}>
                    Current Bet
                  </div>
                  <div style={{ color: '#fbbf24', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {betAmount} CHIP
                  </div>
                </div>
                
                <input
                  type="text"
                  placeholder="Custom"
                  value={customBet}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '')
                    setCustomBet(value)
                    if (value && parseFloat(value) > 0) {
                      setBetAmount(parseFloat(value))
                    }
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '0.9rem',
                    width: '80px',
                    outline: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
                
                <button
                  onClick={() => {
                    setBetAmount(0)
                    setCustomBet('')
                  }}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Clear
                </button>
              </div>
              
              <button
                onClick={handleDeal}
                disabled={contractGameState.isLoading || betAmount > parseFloat(chipBalance) || betAmount <= 0}
                style={{
                  width: '200px',
                  padding: '15px 30px',
                  background: betAmount > parseFloat(chipBalance) || betAmount <= 0
                    ? '#6b7280'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: betAmount > parseFloat(chipBalance) || betAmount <= 0 ? 'not-allowed' : 'pointer',
                  margin: '0 auto',
                  display: 'block',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease',
                  opacity: contractGameState.isLoading ? 0.7 : 1
                }}
              >
                {contractGameState.isLoading ? 'Dealing...' : betAmount <= 0 ? 'Select Bet Amount' : `Deal ${betAmount} CHIP`}
              </button>
            </div>
          )}

          {contractGameState.status === 'playing' && (
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button
                onClick={handleHit}
                disabled={contractGameState.isLoading || playerScore >= 21}
                style={{
                  padding: '15px 40px',
                  background: playerScore >= 21 ? '#6b7280' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: playerScore >= 21 ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                Hit
              </button>
              
              <button
                onClick={handleStand}
                disabled={contractGameState.isLoading}
                style={{
                  padding: '15px 40px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                Stand
              </button>
            </div>
          )}

          {contractGameState.status === 'gameOver' && !showResult && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.2rem', 
                color: '#94a3b8', 
                marginBottom: '10px' 
              }}>
                Game finished! Calculating results...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result overlay */}
      {showResult && lastResult && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            padding: '30px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              {lastResult.result === 'win' ? (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#34d399" stroke="#34d399" strokeWidth="2"/>
                </svg>
              ) : lastResult.result === 'push' ? (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12C12 12 9 9 6 9C3 9 1 11 1 14C1 17 3 19 6 19C9 19 12 16 12 16M12 12C12 12 15 9 18 9C21 9 23 11 23 14C23 17 21 19 18 19C15 19 12 16 12 16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21Z" stroke="#ef4444" strokeWidth="2"/>
                  <path d="M8 8L16 16M16 8L8 16" stroke="#ef4444" strokeWidth="2"/>
                </svg>
              )}
            </div>
            
            <h2 style={{ 
              fontSize: '2rem', 
              marginBottom: '20px',
              color: lastResult.result === 'win' ? '#34d399' : 
                     lastResult.result === 'push' ? '#fbbf24' : '#ef4444'
            }}>
              {lastResult.result === 'win' ? 'You Win!' : 
               lastResult.result === 'push' ? 'Push!' : 'Dealer Wins'}
            </h2>
            
            {lastResult.winnings > 0 && (
              <div style={{
                fontSize: '1.5rem',
                color: '#34d399',
                marginBottom: '20px'
              }}>
                +{lastResult.winnings} CHIP
              </div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: '30px',
              padding: '20px 0',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div>
                <div style={{ color: '#94a3b8', marginBottom: '5px' }}>Your Hand</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{lastResult.playerScore || playerScore}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', marginBottom: '5px' }}>Dealer Hand</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{lastResult.dealerScore || dealerScore}</div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowResult(false)
                setLastResult(null)
              }}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlackjackModern