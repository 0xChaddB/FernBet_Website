import React, { useState, useEffect } from 'react'
import { useDiceContract } from '../hooks/useDiceContract'
import { useMockDiceContract } from '../hooks/useMockDice'
import { useCHIPBalance } from '../hooks/useCHIPToken'
import { useMockBlackjackContract } from '../hooks/useMockBlackjack'

// 3D Dice component
const Dice = ({ number, isRolling = false }) => {
  const faces = [
    // Face 1 - One dot in center
    <div key="1" style={{ 
      position: 'absolute', 
      inset: 0, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      transform: 'translateZ(50px)',
      backgroundColor: '#ffffff',
      border: '2px solid #e5e7eb'
    }}>
      <div style={{ 
        width: '16px', 
        height: '16px', 
        backgroundColor: '#1f2937', 
        borderRadius: '50%' 
      }} />
    </div>,
    
    // Face 2 - Two dots diagonal
    <div key="2" style={{ 
      position: 'absolute', 
      inset: 0, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      flexDirection: 'column',
      padding: '12px',
      transform: 'rotateY(90deg) translateZ(50px)',
      backgroundColor: '#ffffff',
      border: '2px solid #e5e7eb'
    }}>
      <div style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%', alignSelf: 'flex-start' }} />
      <div style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%', alignSelf: 'flex-end' }} />
    </div>,
    
    // Face 3 - Three dots diagonal
    <div key="3" style={{ 
      position: 'absolute', 
      inset: 0, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      flexDirection: 'column',
      transform: 'rotateY(180deg) translateZ(50px)',
      backgroundColor: '#ffffff',
      border: '2px solid #e5e7eb',
      padding: '12px'
    }}>
      <div style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%', alignSelf: 'flex-start' }} />
      <div style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%', alignSelf: 'center' }} />
      <div style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%', alignSelf: 'flex-end' }} />
    </div>,
    
    // Face 4 - Four dots in corners
    <div key="4" style={{ 
      position: 'absolute', 
      inset: 0, 
      display: 'grid', 
      gridTemplate: '1fr 1fr / 1fr 1fr',
      padding: '12px',
      gap: '12px',
      transform: 'rotateY(-90deg) translateZ(50px)',
      backgroundColor: '#ffffff',
      border: '2px solid #e5e7eb'
    }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%' }} />
      ))}
    </div>,
    
    // Face 5 - Five dots (4 corners + center)
    <div key="5" style={{ 
      position: 'absolute', 
      inset: 0, 
      display: 'grid', 
      gridTemplate: '1fr 1fr 1fr / 1fr 1fr 1fr',
      padding: '12px',
      alignItems: 'center',
      justifyItems: 'center',
      transform: 'rotateX(90deg) translateZ(50px)',
      backgroundColor: '#ffffff',
      border: '2px solid #e5e7eb'
    }}>
      <div style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%', gridRow: 1, gridColumn: 1 }} />
      <div style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%', gridRow: 1, gridColumn: 3 }} />
      <div style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%', gridRow: 2, gridColumn: 2 }} />
      <div style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%', gridRow: 3, gridColumn: 1 }} />
      <div style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%', gridRow: 3, gridColumn: 3 }} />
    </div>,
    
    // Face 6 - Six dots in two columns
    <div key="6" style={{ 
      position: 'absolute', 
      inset: 0, 
      display: 'grid', 
      gridTemplate: '1fr 1fr 1fr / 1fr 1fr',
      padding: '12px',
      gap: '8px',
      transform: 'rotateX(-90deg) translateZ(50px)',
      backgroundColor: '#ffffff',
      border: '2px solid #e5e7eb'
    }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ width: '16px', height: '16px', backgroundColor: '#1f2937', borderRadius: '50%' }} />
      ))}
    </div>
  ]

  const getRotation = () => {
    if (isRolling) {
      return 'rotateX(720deg) rotateY(720deg) rotateZ(360deg)'
    }
    
    // Show specific face based on number
    switch(number) {
      case 1: return 'rotateX(0deg) rotateY(0deg)'
      case 2: return 'rotateX(0deg) rotateY(-90deg)'
      case 3: return 'rotateX(0deg) rotateY(-180deg)'
      case 4: return 'rotateX(0deg) rotateY(90deg)'
      case 5: return 'rotateX(-90deg) rotateY(0deg)'
      case 6: return 'rotateX(90deg) rotateY(0deg)'
      default: return 'rotateX(0deg) rotateY(0deg)'
    }
  }

  return (
    <div style={{
      perspective: '1000px',
      width: '120px',
      height: '120px',
      margin: '20px auto'
    }}>
      <div style={{
        position: 'relative',
        width: '100px',
        height: '100px',
        transformStyle: 'preserve-3d',
        transform: getRotation(),
        transition: isRolling ? 'transform 2s ease-out' : 'transform 0.5s ease',
        margin: '10px'
      }}>
        {faces}
      </div>
    </div>
  )
}

// Bet type selector
const BetTypeSelector = ({ selectedBetType, onSelect, targetNumber, onTargetChange }) => {
  const betTypes = [
    { type: 0, name: 'Over', description: `Roll over ${targetNumber}` },
    { type: 1, name: 'Under', description: `Roll under ${targetNumber}` },
    { type: 2, name: 'Exact', description: `Roll exactly ${targetNumber}` }
  ]

  return (
    <div style={{ marginBottom: '15px' }}>
      <h3 style={{ color: '#e2e8f0', marginBottom: '10px', textAlign: 'center', fontSize: '1rem' }}>Bet Type</h3>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {betTypes.map(bet => (
          <button
            key={bet.type}
            onClick={() => onSelect(bet.type)}
            style={{
              background: selectedBetType === bet.type 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'rgba(255, 255, 255, 0.1)',
              color: selectedBetType === bet.type ? 'white' : '#cbd5e1',
              border: selectedBetType === bet.type ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              minWidth: '100px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1rem', marginBottom: '4px' }}>{bet.name}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{bet.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Target number selector
const NumberSelector = ({ selectedNumber, onSelect, betType }) => {
  const getValidNumbers = () => {
    if (betType === 0) return [1, 2, 3, 4, 5] // Over: 1-5
    if (betType === 1) return [2, 3, 4, 5, 6] // Under: 2-6
    return [1, 2, 3, 4, 5, 6] // Exact: 1-6
  }

  return (
    <div style={{ marginBottom: '15px' }}>
      <h3 style={{ color: '#e2e8f0', marginBottom: '10px', textAlign: 'center', fontSize: '1rem' }}>Target Number</h3>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {getValidNumbers().map(num => (
          <button
            key={num}
            onClick={() => onSelect(num)}
            style={{
              background: selectedNumber === num 
                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                : 'rgba(255, 255, 255, 0.1)',
              color: selectedNumber === num ? 'white' : '#cbd5e1',
              border: selectedNumber === num ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
              padding: '15px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}

const DiceGame = ({ demoMode = false }) => {
  // Contracts
  const mockBlackjackContract = useMockBlackjackContract() // For balance
  const realContract = useDiceContract()
  const mockContract = useMockDiceContract()
  const { balance: realChipBalance } = useCHIPBalance()

  const {
    gameState,
    placeBet,
    claimWinnings,
    isConnected,
    getBetTypeName,
    getProbability,
    calculatePayout
  } = demoMode ? mockContract : realContract

  const chipBalance = demoMode ? mockBlackjackContract.useMockCHIPBalance().balance : realChipBalance

  // Local state
  const [betAmount, setBetAmount] = useState(5)
  const [selectedBetType, setSelectedBetType] = useState(0) // Over
  const [targetNumber, setTargetNumber] = useState(3)
  const [isRolling, setIsRolling] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Handle bet placement
  const handlePlaceBet = async () => {
    if (betAmount > parseFloat(chipBalance) || betAmount <= 0) return
    
    setIsRolling(true)
    setShowResult(false)
    
    try {
      const result = await placeBet(selectedBetType, targetNumber, betAmount)
      
      // Stop rolling animation after 2 seconds
      setTimeout(() => {
        setIsRolling(false)
        setShowResult(true)
      }, 2000)
    } catch (error) {
      setIsRolling(false)
      console.error('Error placing bet:', error)
    }
  }

  const handleClaim = async () => {
    setShowResult(false)
    await claimWinnings()
  }

  // Calculate probability and payout for current selection
  const probability = getProbability(selectedBetType, targetNumber)
  const expectedPayout = calculatePayout(selectedBetType, targetNumber, betAmount)

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e2e8f0',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)',
        opacity: 0.8
      }} />
      
      {/* Content */}
      <div style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
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
            🎲 Dice Game
          </h1>
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Balance</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#34d399' }}>
                {parseFloat(chipBalance).toFixed(2)} CHIP
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
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          minHeight: 'calc(100vh - 120px)' // Account for header height
        }}>
          {/* Dice display */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Dice 
              number={gameState.rolledNumber || 1} 
              isRolling={isRolling} 
            />
            {gameState.hasActiveBet && gameState.isResolved && (
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: gameState.payout > 0 ? '#34d399' : '#ef4444',
                marginTop: '10px'
              }}>
                Rolled: {gameState.rolledNumber}
              </div>
            )}
          </div>

          {!gameState.hasActiveBet && (
            <>
              {/* Bet configuration */}
              <BetTypeSelector 
                selectedBetType={selectedBetType}
                onSelect={setSelectedBetType}
                targetNumber={targetNumber}
                onTargetChange={setTargetNumber}
              />
              
              <NumberSelector 
                selectedNumber={targetNumber}
                onSelect={setTargetNumber}
                betType={selectedBetType}
              />
              
              {/* Bet amount */}
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#e2e8f0', marginBottom: '10px', textAlign: 'center', fontSize: '1rem' }}>Bet Amount</h3>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
                  {[1, 5, 10, 25].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      style={{
                        background: betAmount === amount 
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        color: betAmount === amount ? 'white' : '#cbd5e1',
                        border: betAmount === amount ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '8px 16px',
                        borderRadius: '6px',
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
                
                <input
                  type="text"
                  value={betAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '')
                    if (value && parseFloat(value) > 0) {
                      setBetAmount(parseFloat(value))
                    }
                  }}
                  style={{
                    width: '120px',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '1rem',
                    textAlign: 'center',
                    outline: 'none',
                    display: 'block',
                    margin: '0 auto'
                  }}
                  placeholder="Custom amount"
                />
              </div>

              {/* Probability and payout info */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Probability</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {probability.numerator}/{probability.denominator} ({(probability.numerator / probability.denominator * 100).toFixed(1)}%)
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Potential Win</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#34d399' }}>
                      {expectedPayout.toFixed(2)} CHIP
                    </div>
                  </div>
                </div>
              </div>

              {/* Place bet button */}
              <button
                onClick={handlePlaceBet}
                disabled={gameState.isLoading || betAmount > parseFloat(chipBalance) || betAmount <= 0}
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
                  opacity: gameState.isLoading ? 0.7 : 1
                }}
              >
                {gameState.isLoading ? 'Rolling...' : `Roll Dice (${betAmount} CHIP)`}
              </button>
            </>
          )}

          {/* Game result */}
          {gameState.hasActiveBet && gameState.isResolved && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: gameState.payout > 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `2px solid ${gameState.payout > 0 ? '#34d399' : '#ef4444'}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                  {gameState.payout > 0 ? '🎉' : '💔'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                  {gameState.payout > 0 ? 'You Won!' : 'Better Luck Next Time!'}
                </div>
                <div style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '15px' }}>
                  You bet {getBetTypeName(gameState.betType)} {gameState.targetNumber} and rolled {gameState.rolledNumber}
                </div>
                {gameState.payout > 0 && (
                  <div style={{ fontSize: '1.2rem', color: '#34d399', fontWeight: 'bold' }}>
                    Won: {parseFloat(gameState.payout).toFixed(2)} CHIP
                  </div>
                )}
              </div>
              
              <button
                onClick={handleClaim}
                disabled={gameState.isLoading}
                style={{
                  width: '200px',
                  padding: '15px 30px',
                  background: gameState.isLoading ? '#6b7280' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: gameState.isLoading ? 'not-allowed' : 'pointer',
                  margin: '0 auto',
                  display: 'block',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                {gameState.isLoading ? 'Processing...' : 'Play Again'}
              </button>
            </div>
          )}

          {/* Message */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '1rem',
            color: '#e2e8f0',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginTop: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            {gameState.message}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiceGame