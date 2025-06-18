import React, { useState, useEffect } from 'react'
import { useBlackjackContract } from '../hooks/useBlackjackContract'
import { useCHIPBalance } from '../hooks/useCHIPToken'

// Responsive card component
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
      <div className="playing-card hidden-card">
        <div className="card-back-pattern" />
        <span className="card-question">?</span>
      </div>
    )
  }

  return (
    <div className={`playing-card ${showCard ? 'show' : ''} ${card?.isRed ? 'red' : 'black'}`}>
      <div className="card-rank top-left">{card?.rank}</div>
      <div className="card-suit-center">{card?.suit}</div>
      <div className="card-rank bottom-right">{card?.rank}</div>
    </div>
  )
}

// Responsive chip selector
const ChipSelector = ({ onAdd, betAmount }) => {
  const chips = [
    { value: 1, color: '#ef4444' },
    { value: 5, color: '#3b82f6' },
    { value: 10, color: '#10b981' },
    { value: 25, color: '#8b5cf6' },
    { value: 100, color: '#f59e0b' }
  ]

  return (
    <div className="chip-selector">
      {chips.map(chip => (
        <button
          key={chip.value}
          onClick={() => onAdd(chip.value)}
          className="chip-button"
          style={{ '--chip-color': chip.color }}
        >
          {chip.value}
        </button>
      ))}
    </div>
  )
}

const BlackjackResponsive = ({ demoMode = false }) => {
  const realContract = useBlackjackContract()
  const mockContract = useMockBlackjackContract()
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

  const [betAmount, setBetAmount] = useState(10)
  const [customBet, setCustomBet] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [playerHasMoved, setPlayerHasMoved] = useState(false)
  const [prevDealerCardsLength, setPrevDealerCardsLength] = useState(0)

  // Helper function for hand calculation
  const calculateHandValue = (cards) => {
    if (!cards || cards.length === 0) return 0
    
    let value = 0
    let aces = 0
    
    for (const card of cards) {
      const cardValue = typeof card === 'object' ? card.index : card
      if (cardValue === undefined || cardValue === null) continue
      
      const rank = cardValue % 13
      if (rank === 0) {
        aces++
        value += 11
      } else if (rank >= 10) {
        value += 10
      } else {
        value += rank + 1
      }
    }
    
    while (value > 21 && aces > 0) {
      value -= 10
      aces--
    }
    
    return value
  }

  const playerScore = contractGameState.playerCards.length > 0 ? 
    calculateHandValue(contractGameState.playerCards) : 0
  const dealerScore = contractGameState.dealerCards.length > 0 ? 
    calculateHandValue(contractGameState.dealerCards) : 0
  
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
      setLastResult({
        ...result,
        playerScore: playerScore,
        dealerScore: dealerScore
      })
      setShowResult(true)
    }
  }

  useEffect(() => {
    if (playerScore > 21 && contractGameState.status === 'gameOver') {
      setTimeout(() => handleResolve(), 1000)
    }
  }, [playerScore, contractGameState.status])

  useEffect(() => {
    if (contractGameState.status === 'gameOver' && !showResult) {
      setTimeout(() => handleResolve(), 1500)
    }
  }, [contractGameState.status])

  // Force connection - no demo mode allowed
  if (!isConnected && !demoMode) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: '#1e293b',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>
            Wallet Connection Required
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            Please connect your wallet to play Blackjack
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div className="blackjack-container">
        <style jsx>{`
          .blackjack-container {
            background: #1e293b;
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            width: 100%;
            max-width: 1000px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            color: #e2e8f0;
            position: relative;
          }
          
          .table-background {
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at center, #2d3b4f 0%, #1e293b 100%);
            opacity: 0.6;
            z-index: 0;
          }
          
          .game-content {
            position: relative;
            z-index: 1;
            flex: 1;
            display: flex;
            flex-direction: column;
            width: 100%;
          }
          
          .game-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(10px);
          }
          
          .game-title {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .balance-display {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-size: 1rem;
          }
          
          .game-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          .hand-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 120px;
            margin-bottom: 1rem;
          }
          
          .hand-label {
            text-align: center;
            margin-bottom: 0.75rem;
          }
          
          .hand-title {
            margin: 0;
            font-size: 0.875rem;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          
          .hand-score {
            font-size: 1.75rem;
            font-weight: bold;
            margin-top: 0.5rem;
          }
          
          .cards-container {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
            min-height: 100px;
          }
          
          .playing-card {
            width: 70px;
            height: 98px;
            background: #ffffff;
            border-radius: 0.5rem;
            border: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100px) scale(0.8);
            transition: all 0.5s ease-out;
            opacity: 0;
          }
          
          .playing-card.show {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          
          .playing-card.red {
            color: #dc2626;
          }
          
          .playing-card.black {
            color: #1f2937;
          }
          
          .hidden-card {
            background: linear-gradient(45deg, #2a4365 0%, #3182ce 50%, #2a4365 100%);
            border: 2px solid #4a5568;
            color: #e2e8f0;
            transform: none;
            opacity: 1;
          }
          
          .card-back-pattern {
            position: absolute;
            inset: 8px;
            border: 2px solid #4a5568;
            border-radius: 0.25rem;
            opacity: 0.3;
          }
          
          .card-question {
            font-size: 2rem;
          }
          
          .card-rank {
            position: absolute;
            font-size: 1rem;
          }
          
          .card-rank.top-left {
            top: 0.5rem;
            left: 0.5rem;
          }
          
          .card-rank.bottom-right {
            bottom: 0.5rem;
            right: 0.5rem;
            transform: rotate(180deg);
          }
          
          .card-suit-center {
            font-size: 2rem;
          }
          
          .game-controls {
            padding: 1.25rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(10px);
          }
          
          .betting-controls {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            align-items: center;
          }
          
          .chip-and-bet-row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            width: 100%;
          }
          
          .chip-selector {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .chip-button {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: var(--chip-color);
            color: white;
            border: 3px solid white;
            font-weight: bold;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          
          .chip-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          }
          
          .current-bet-display {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(251, 191, 36, 0.5);
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            text-align: center;
          }
          
          .bet-label {
            color: #94a3b8;
            font-size: 0.75rem;
            margin-bottom: 0.25rem;
          }
          
          .bet-amount {
            color: #fbbf24;
            font-size: 1.125rem;
            font-weight: bold;
          }
          
          .custom-bet-input {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            color: white;
            font-size: 0.875rem;
            width: 80px;
            outline: none;
            -webkit-appearance: none;
            -moz-appearance: textfield;
          }
          
          .action-buttons {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .action-button {
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            color: white;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            min-width: 100px;
            justify-content: center;
          }
          
          .action-button:disabled {
            background: #6b7280;
            cursor: not-allowed;
            opacity: 0.6;
          }
          
          .action-button.deal {
            background: linear-gradient(135deg, #10b981, #059669);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }
          
          .action-button.hit {
            background: #3b82f6;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          }
          
          .action-button.stand {
            background: #f59e0b;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
          }
          
          .action-button.clear {
            background: #6b7280;
          }
          
          .result-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }
          
          .result-modal {
            background: #1e293b;
            padding: 2rem;
            border-radius: 1.25rem;
            text-align: center;
            max-width: 400px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          }
          
          .result-icon {
            margin-bottom: 1rem;
            display: flex;
            justify-content: center;
          }
          
          .result-title {
            font-size: 1.75rem;
            margin-bottom: 1rem;
          }
          
          .result-scores {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          
          .score-box {
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem;
            border-radius: 0.5rem;
          }
          
          .continue-button {
            width: 100%;
            padding: 0.875rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          /* Animations */
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .result-modal {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>

        <div className="table-background" />
        
        <div className="game-content">
          {/* Header */}
          <div className="game-header">
            <h1 className="game-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 5 8.5 5 14C5 16.5 6.5 18 8.5 18C10 18 11 17 11 15.5C11 17 10 18.5 10 20C10 21 10.5 22 12 22C13.5 22 14 21 14 20C14 18.5 13 17 13 15.5C13 17 14 18 15.5 18C17.5 18 19 16.5 19 14C19 8.5 12 2 12 2Z" fill="#34d399"/>
              </svg>
              Blackjack
            </h1>
            
            <div className="balance-display">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#fbbf24" strokeWidth="2"/>
                <path d="M12 7V17M9 10H15M9 14H15" stroke="#fbbf24" strokeWidth="2"/>
              </svg>
              <span>{parseFloat(chipBalance).toFixed(2)} CHIP</span>
            </div>
          </div>

          {/* Game area */}
          <div className="game-area">
            {/* Dealer section */}
            <div className="hand-section">
              <div className="hand-label">
                <h3 className="hand-title">Dealer</h3>
                {contractGameState.isInGame && (
                  <div className="hand-score" style={{ color: '#f87171' }}>
                    {visibleDealerScore}
                  </div>
                )}
              </div>
              
              <div className="cards-container">
                {contractGameState.dealerCards.map((card, index) => (
                  <Card
                    key={index}
                    value={typeof card === 'object' ? card.index : card}
                    isHidden={index > 0 && contractGameState.status === 'playing' && !playerHasMoved}
                    isNew={index === prevDealerCardsLength - 1}
                  />
                ))}
              </div>
            </div>

            {/* Player section */}
            <div className="hand-section">
              <div className="cards-container">
                {contractGameState.playerCards.map((card, index) => (
                  <Card
                    key={index}
                    value={typeof card === 'object' ? card.index : card}
                  />
                ))}
              </div>
              
              <div className="hand-label" style={{ marginTop: '0.75rem' }}>
                {contractGameState.isInGame && (
                  <div className="hand-score" style={{ 
                    color: playerScore > 21 ? '#ef4444' : '#34d399'
                  }}>
                    {playerScore}
                  </div>
                )}
                <h3 className="hand-title">Player</h3>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="game-controls">
            {contractGameState.status === 'idle' && (
              <div className="betting-controls">
                <div className="chip-and-bet-row">
                  <ChipSelector 
                    onAdd={(value) => {
                      setBetAmount(prev => prev + value)
                      setCustomBet('')
                    }}
                    betAmount={betAmount}
                  />
                  
                  <div className="current-bet-display">
                    <div className="bet-label">Current Bet</div>
                    <div className="bet-amount">{betAmount} CHIP</div>
                  </div>
                  
                  <input
                    type="text"
                    className="custom-bet-input"
                    placeholder="Custom"
                    value={customBet}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                      setCustomBet(value)
                      if (value && parseFloat(value) > 0) {
                        setBetAmount(parseFloat(value))
                      }
                    }}
                  />
                </div>
                
                <div className="action-buttons">
                  <button
                    onClick={() => {
                      setBetAmount(0)
                      setCustomBet('')
                    }}
                    className="action-button clear"
                  >
                    Clear
                  </button>
                  
                  <button
                    onClick={handleDeal}
                    disabled={betAmount <= 0 || betAmount > parseFloat(chipBalance) || contractGameState.isLoading}
                    className="action-button deal"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Deal ({betAmount} CHIP)
                  </button>
                </div>
              </div>
            )}

            {contractGameState.status === 'playing' && (
              <div className="action-buttons">
                <button
                  onClick={handleHit}
                  disabled={contractGameState.isLoading || playerScore >= 21}
                  className="action-button hit"
                >
                  Hit
                </button>
                
                <button
                  onClick={handleStand}
                  disabled={contractGameState.isLoading}
                  className="action-button stand"
                >
                  Stand
                </button>
              </div>
            )}

            {contractGameState.status === 'gameOver' && !showResult && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#94a3b8' 
                }}>
                  Game finished! Calculating results...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result overlay */}
        {showResult && lastResult && (
          <div className="result-overlay">
            <div className="result-modal">
              <div className="result-icon">
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
              
              <h2 className="result-title" style={{
                color: lastResult.result === 'win' ? '#34d399' : 
                       lastResult.result === 'push' ? '#fbbf24' : '#ef4444'
              }}>
                {lastResult.result === 'win' ? 'You Win!' : 
                 lastResult.result === 'push' ? 'Push!' : 'Dealer Wins'}
              </h2>
              
              {lastResult.winnings > 0 && (
                <div style={{
                  fontSize: '1.25rem',
                  color: '#34d399',
                  marginBottom: '1rem',
                  fontWeight: 'bold'
                }}>
                  +{lastResult.winnings} CHIP
                </div>
              )}
              
              <div className="result-scores">
                <div className="score-box">
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Your Hand
                  </div>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold',
                    color: lastResult.playerScore > 21 ? '#ef4444' : '#e2e8f0'
                  }}>
                    {lastResult.playerScore}
                  </div>
                </div>
                
                <div className="score-box">
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Dealer Hand
                  </div>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold',
                    color: lastResult.dealerScore > 21 ? '#ef4444' : '#e2e8f0'
                  }}>
                    {lastResult.dealerScore}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowResult(false)}
                className="continue-button"
              >
                Continue Playing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlackjackResponsive