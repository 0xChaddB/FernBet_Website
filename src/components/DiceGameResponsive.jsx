import React, { useState, useEffect } from 'react'
import { useDiceContract } from '../hooks/useDiceContract'
import { useMockDiceContract } from '../hooks/useMockDice'
import { useCHIPBalance } from '../hooks/useCHIPToken'
import { useMockBlackjackContract } from '../hooks/useMockBlackjack'

const DiceGameResponsive = ({ demoMode = false }) => {
  // Contracts
  const mockBlackjackContract = useMockBlackjackContract()
  const realContract = useDiceContract()
  const mockContract = useMockDiceContract()
  const { balance: realChipBalance } = useCHIPBalance()

  const {
    gameState,
    placeBet,
    claimWinnings,
    isConnected
  } = demoMode ? mockContract : realContract

  const chipBalance = demoMode ? mockBlackjackContract.useMockCHIPBalance().balance : realChipBalance

  // Local state
  const [betAmount, setBetAmount] = useState(1)
  const [rollOver, setRollOver] = useState(50.50)
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState(null)
  const [showResult, setShowResult] = useState(false)

  // Calculate win chance and payout multiplier
  const winChance = (100 - rollOver).toFixed(2)
  const payoutMultiplier = (99 / (100 - rollOver)).toFixed(4)
  const potentialWin = (betAmount * payoutMultiplier).toFixed(2)

  // Handle roll
  const handleRoll = async () => {
    if (betAmount > parseFloat(chipBalance) || betAmount <= 0 || isRolling) return
    
    setIsRolling(true)
    setShowResult(false)
    
    try {
      const targetNumber = Math.floor(rollOver)
      const betType = 0 // Over
      
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const roll = Math.random() * 100
        const won = roll > rollOver
        const payout = won ? betAmount * payoutMultiplier : 0
        
        setLastRoll({
          roll: roll.toFixed(2),
          won,
          payout: payout.toFixed(2),
          target: rollOver
        })
        setShowResult(true)
      } else {
        await placeBet(betType, targetNumber, betAmount)
      }
    } catch (error) {
      console.error('Error rolling dice:', error)
    } finally {
      setIsRolling(false)
    }
  }

  const handleNextRoll = () => {
    setShowResult(false)
    setLastRoll(null)
    if (!demoMode && gameState.hasActiveBet && gameState.isResolved) {
      claimWinnings()
    }
  }

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
            Please connect your wallet to play Dice
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e2e8f0'
    }}>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Mobile styles */
        @media (max-width: 768px) {
          .game-container {
            padding: 1rem !important;
            margin: 0 !important;
          }
          
          .game-box {
            padding: 1.5rem !important;
            max-width: 100% !important;
          }
          
          .stats-grid {
            gap: 0.5rem !important;
          }
          
          .stat-box {
            padding: 0.75rem !important;
          }
          
          .chip-buttons {
            gap: 0.5rem !important;
          }
          
          .chip-button {
            padding: 0.5rem !important;
            font-size: 0.8rem !important;
          }
          
          .result-display {
            padding: 1rem !important;
          }
          
          .roll-button {
            padding: 0.875rem !important;
            font-size: 1rem !important;
          }
        }
        
        /* Tablet styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .game-box {
            padding: 2rem !important;
          }
        }
        
        /* Input range styles */
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: ${isRolling ? 'not-allowed' : 'pointer'};
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: ${isRolling ? 'not-allowed' : 'pointer'};
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>

      {/* Game Box Container */}
      <div style={{
        background: '#1e293b',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Game Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#60a5fa" strokeWidth="2"/>
              <circle cx="8" cy="8" r="1.5" fill="#60a5fa"/>
              <circle cx="12" cy="12" r="1.5" fill="#60a5fa"/>
              <circle cx="16" cy="16" r="1.5" fill="#60a5fa"/>
            </svg>
            Dice
          </h1>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#fbbf24" strokeWidth="2"/>
              <path d="M12 7V17M9 10H15M9 14H15" stroke="#fbbf24" strokeWidth="2"/>
            </svg>
            <span>{parseFloat(chipBalance).toFixed(2)} CHIP</span>
          </div>
        </div>
        
        {/* Game Content */}
        <div className="game-container" style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'center'
        }}>
        <div className="game-box" style={{
          width: '100%',
          maxWidth: '600px'
        }}>


          {/* Roll Over Slider */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <label style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', fontWeight: '600' }}>
                Roll Over
              </label>
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid #3b82f6',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                fontWeight: 'bold',
                color: '#60a5fa',
                minWidth: '80px',
                textAlign: 'center'
              }}>
                {rollOver.toFixed(2)}
              </div>
            </div>
            
            <div style={{ position: 'relative', marginBottom: '0.625rem' }}>
              <input
                type="range"
                min="0.01"
                max="99.99"
                step="0.01"
                value={rollOver}
                onChange={(e) => setRollOver(parseFloat(e.target.value))}
                disabled={isRolling}
                style={{
                  width: '100%',
                  height: '8px',
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${rollOver}%, #22c55e ${rollOver}%, #22c55e 100%)`,
                  borderRadius: '4px',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  cursor: isRolling ? 'not-allowed' : 'pointer'
                }}
              />
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              color: '#94a3b8'
            }}>
              <span>0.01 (98.99% chance)</span>
              <span>99.99 (0.01% chance)</span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div className="stat-box" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', marginBottom: '0.25rem' }}>
                Win Chance
              </div>
              <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 'bold', color: '#22c55e' }}>
                {winChance}%
              </div>
            </div>
            
            <div className="stat-box" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', marginBottom: '0.25rem' }}>
                Payout
              </div>
              <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 'bold', color: '#60a5fa' }}>
                {payoutMultiplier}x
              </div>
            </div>
            
            <div className="stat-box" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', marginBottom: '0.25rem' }}>
                Win Amount
              </div>
              <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 'bold', color: '#fbbf24' }}>
                {potentialWin}
              </div>
            </div>
          </div>

          {/* Bet Amount */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
              fontWeight: '600',
              marginBottom: '0.625rem'
            }}>
              Bet Amount
            </label>
            
            <div className="chip-buttons" style={{ display: 'flex', gap: '0.625rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {[0.1, 1, 5, 10].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isRolling}
                  className="chip-button"
                  style={{
                    flex: '1 1 0',
                    minWidth: '60px',
                    padding: '0.625rem',
                    background: betAmount === amount 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: betAmount === amount ? 'white' : '#cbd5e1',
                    border: betAmount === amount ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.375rem',
                    cursor: isRolling ? 'not-allowed' : 'pointer',
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    opacity: isRolling ? 0.6 : 1
                  }}
                >
                  {amount}
                </button>
              ))}
            </div>
            
            <input
              type="text"
              value={betAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '')
                if (value && parseFloat(value) > 0) {
                  setBetAmount(parseFloat(value))
                }
              }}
              disabled={isRolling}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                outline: 'none',
                opacity: isRolling ? 0.6 : 1
              }}
              placeholder="Enter bet amount"
            />
            
            <div style={{
              textAlign: 'center',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              color: '#94a3b8',
              marginTop: '0.5rem'
            }}>
              Max bet: {parseFloat(chipBalance).toFixed(2)} CHIP
            </div>
          </div>

          {/* Roll Button */}
          {
            <button
              onClick={handleRoll}
              disabled={isRolling || betAmount > parseFloat(chipBalance) || betAmount <= 0}
              className="roll-button"
              style={{
                width: '100%',
                padding: '1rem',
                background: (isRolling || betAmount > parseFloat(chipBalance) || betAmount <= 0)
                  ? '#6b7280'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                fontWeight: 'bold',
                cursor: (isRolling || betAmount > parseFloat(chipBalance) || betAmount <= 0) 
                  ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isRolling ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
                  </svg>
                  Rolling...
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
                  </svg>
                  Roll Dice ({betAmount} CHIP)
                </>
              )}
            </button>
          }
        </div>
      </div>
      
      {/* Result overlay */}
      {showResult && lastRoll && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1e293b',
            padding: '2rem',
            borderRadius: '1.25rem',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ 
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              {lastRoll?.won ? (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#22c55e" stroke="#22c55e" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21Z" stroke="#ef4444" strokeWidth="2"/>
                  <path d="M8 8L16 16M16 8L8 16" stroke="#ef4444" strokeWidth="2"/>
                </svg>
              )}
            </div>
            
            <h2 style={{
              fontSize: '1.75rem',
              marginBottom: '1rem',
              color: lastRoll?.won ? '#22c55e' : '#ef4444'
            }}>
              {lastRoll?.won ? 'You Win!' : 'You Lose!'}
            </h2>
            
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: lastRoll?.won ? '#22c55e' : '#ef4444',
              marginBottom: '1rem'
            }}>
              {lastRoll?.roll}
            </div>
            
            <div style={{ 
              color: '#94a3b8', 
              marginBottom: '1.5rem',
              fontSize: '1rem'
            }}>
              Target: Roll over {lastRoll?.target}
            </div>
            
            {lastRoll?.won && (
              <div style={{ 
                fontSize: '1.5rem',
                color: '#34d399',
                marginBottom: '1.5rem',
                fontWeight: 'bold' 
              }}>
                +{lastRoll?.payout} CHIP
              </div>
            )}
            
            <button
              onClick={handleNextRoll}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Roll Again
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

export default DiceGameResponsive