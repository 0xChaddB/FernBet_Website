import React, { useState, useEffect } from 'react'
import { useDiceContract } from '../hooks/useDiceContract'
import { useMockDiceContract } from '../hooks/useMockDice'
import { useCHIPBalance } from '../hooks/useCHIPToken'
import { useMockBlackjackContract } from '../hooks/useMockBlackjack'

const DiceGameStake = ({ demoMode = false }) => {
  // Contracts
  const mockBlackjackContract = useMockBlackjackContract() // For balance
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
  const [rollOver, setRollOver] = useState(50.50) // Roll over this number
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState(null)
  const [showResult, setShowResult] = useState(false)

  // Calculate win chance and payout multiplier
  const winChance = (100 - rollOver).toFixed(2)
  const payoutMultiplier = (99 / (100 - rollOver)).toFixed(4) // 99% RTP
  const potentialWin = (betAmount * payoutMultiplier).toFixed(2)

  // Handle roll
  const handleRoll = async () => {
    if (betAmount > parseFloat(chipBalance) || betAmount <= 0 || isRolling) return
    
    setIsRolling(true)
    setShowResult(false)
    
    try {
      // Convert to contract format: rollOver of 50.50 = bet Over 50 (target number 50, betType 0)
      const targetNumber = Math.floor(rollOver)
      const betType = 0 // Over
      
      // For demo mode, simulate the roll
      if (demoMode) {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Generate random number 0-99.99
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
        // Real contract call
        await placeBet(betType, targetNumber, betAmount)
      }
    } catch (error) {
      console.error('Error rolling dice:', error)
    } finally {
      setIsRolling(false)
    }
  }

  // Handle result acknowledgment
  const handleNextRoll = () => {
    setShowResult(false)
    setLastRoll(null)
    if (!demoMode && gameState.hasActiveBet && gameState.isResolved) {
      claimWinnings()
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        overflow: 'auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '30px',
          maxWidth: '600px',
          width: '100%',
          backdropFilter: 'blur(10px)',
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'auto',
          margin: 'auto'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              background: 'linear-gradient(to right, #60a5fa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
              </svg>
              Dice
            </h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              Choose a number and roll over it to win
            </p>
          </div>

          {/* Result Display */}
          {(showResult || (lastRoll && !isRolling)) && (
            <div style={{
              background: lastRoll?.won ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `2px solid ${lastRoll?.won ? '#22c55e' : '#ef4444'}`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                {lastRoll?.won ? (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#22c55e" stroke="#22c55e" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21Z" stroke="#ef4444" strokeWidth="2"/>
                    <path d="M8 8L16 16M16 8L8 16" stroke="#ef4444" strokeWidth="2"/>
                  </svg>
                )}
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: lastRoll?.won ? '#22c55e' : '#ef4444',
                marginBottom: '10px'
              }}>
                {lastRoll?.roll}
              </div>
              <div style={{ color: '#94a3b8', marginBottom: '15px' }}>
                Target: Roll over {lastRoll?.target}
              </div>
              {lastRoll?.won ? (
                <div style={{ color: '#22c55e', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  You won {lastRoll?.payout} CHIP!
                </div>
              ) : (
                <div style={{ color: '#ef4444', fontSize: '1.2rem' }}>
                  Better luck next time!
                </div>
              )}
            </div>
          )}

          {/* Roll Over Slider */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <label style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                Roll Over
              </label>
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#60a5fa',
                minWidth: '80px',
                textAlign: 'center'
              }}>
                {rollOver.toFixed(2)}
              </div>
            </div>
            
            <div style={{ position: 'relative', marginBottom: '10px' }}>
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
              <style jsx>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
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
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
              color: '#94a3b8'
            }}>
              <span>0.01 (98.99% chance)</span>
              <span>99.99 (0.01% chance)</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '5px' }}>
                Win Chance
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e' }}>
                {winChance}%
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '5px' }}>
                Payout
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#60a5fa' }}>
                {payoutMultiplier}x
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '5px' }}>
                Potential Win
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24' }}>
                {potentialWin}
              </div>
            </div>
          </div>

          {/* Bet Amount */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '10px'
            }}>
              Bet Amount
            </label>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              {[0.1, 1, 5, 10].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isRolling}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: betAmount === amount 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: betAmount === amount ? 'white' : '#cbd5e1',
                    border: betAmount === amount ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    cursor: isRolling ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
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
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                opacity: isRolling ? 0.6 : 1
              }}
              placeholder="Enter bet amount"
            />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: '#94a3b8',
              marginTop: '8px'
            }}>
              <span>Balance: {parseFloat(chipBalance).toFixed(2)} CHIP</span>
              <span>Max bet: {chipBalance} CHIP</span>
            </div>
          </div>

          {/* Roll Button */}
          {!showResult ? (
            <button
              onClick={handleRoll}
              disabled={isRolling || betAmount > parseFloat(chipBalance) || betAmount <= 0}
              style={{
                width: '100%',
                padding: '16px',
                background: (isRolling || betAmount > parseFloat(chipBalance) || betAmount <= 0)
                  ? '#6b7280'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: (isRolling || betAmount > parseFloat(chipBalance) || betAmount <= 0) 
                  ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
              }}
            >
              {isRolling ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle', animation: 'spin 1s linear infinite' }}>
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
                  </svg>
                  Rolling...
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
                  </svg>
                  Roll Dice ({betAmount} CHIP)
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNextRoll}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 9L12 15M9 12L15 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Roll Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiceGameStake