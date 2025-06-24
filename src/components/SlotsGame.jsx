import React, { useState, useEffect, useRef } from 'react'
import { useMockBlackjackContract } from '../hooks/useMockBlackjack'
import ContractLink from './ContractLink'

const SlotsGame = ({ demoMode = true }) => {
  const mockContract = useMockBlackjackContract()
  const chipBalance = mockContract.useMockCHIPBalance().balance

  const [betAmount, setBetAmount] = useState(10)
  const [isSpinning, setIsSpinning] = useState(false)
  const [reels, setReels] = useState([
    [0, 1, 2], // Reel 1
    [3, 4, 5], // Reel 2
    [6, 7, 0]  // Reel 3
  ])
  const [showResult, setShowResult] = useState(false)
  const [lastWin, setLastWin] = useState(null)
  const [reelPositions, setReelPositions] = useState([0, 0, 0])

  // Slot symbols
  const symbols = [
    { id: 0, icon: '🍒', name: 'Cherry', color: '#dc2626' },
    { id: 1, icon: '🍋', name: 'Lemon', color: '#fbbf24' },
    { id: 2, icon: '🍊', name: 'Orange', color: '#f97316' },
    { id: 3, icon: '🍇', name: 'Grape', color: '#8b5cf6' },
    { id: 4, icon: '🔔', name: 'Bell', color: '#3b82f6' },
    { id: 5, icon: '⭐', name: 'Star', color: '#fbbf24' },
    { id: 6, icon: '7️⃣', name: 'Seven', color: '#10b981' },
    { id: 7, icon: '💎', name: 'Diamond', color: '#60a5fa' }
  ]

  // Paylines
  const paylines = [
    { name: 'Center', positions: [[1, 0], [1, 1], [1, 2]], multiplier: 1 },
    { name: 'Top', positions: [[0, 0], [0, 1], [0, 2]], multiplier: 1 },
    { name: 'Bottom', positions: [[2, 0], [2, 1], [2, 2]], multiplier: 1 },
    { name: 'Diagonal 1', positions: [[0, 0], [1, 1], [2, 2]], multiplier: 1.5 },
    { name: 'Diagonal 2', positions: [[2, 0], [1, 1], [0, 2]], multiplier: 1.5 }
  ]

  // Payout table
  const payoutTable = {
    '7️⃣,7️⃣,7️⃣': 100,    // Three sevens
    '💎,💎,💎': 50, // Three diamonds
    '⭐,⭐,⭐': 25,  // Three stars
    '🔔,🔔,🔔': 20, // Three bells
    '🍇,🍇,🍇': 15, // Three grapes
    '🍊,🍊,🍊': 10, // Three oranges
    '🍋,🍋,🍋': 8,  // Three lemons
    '🍒,🍒,🍒': 5,  // Three cherries
    'any,any,any': 2 // Any three matching
  }

  const getRandomSymbol = () => Math.floor(Math.random() * symbols.length)

  const checkWin = (finalReels) => {
    const wins = []
    
    paylines.forEach((payline, index) => {
      const lineSymbols = payline.positions.map(([row, col]) => finalReels[col][row])
      
      // Check if all symbols match
      if (lineSymbols[0] === lineSymbols[1] && lineSymbols[1] === lineSymbols[2]) {
        const symbol = symbols[lineSymbols[0]]
        const symbolKey = `${symbol.icon},${symbol.icon},${symbol.icon}`
        
        let basePayout = payoutTable[symbolKey] || payoutTable['any,any,any']
        let finalPayout = basePayout * payline.multiplier * betAmount
        
        wins.push({
          payline: payline.name,
          symbols: [symbol, symbol, symbol],
          payout: finalPayout,
          lineIndex: index
        })
      }
    })
    
    return wins
  }

  const spin = async () => {
    if (isSpinning || betAmount > parseFloat(chipBalance)) return
    
    setIsSpinning(true)
    setShowResult(false)
    
    // Create longer reels for smooth spinning
    const extendedReels = reels.map(reel => {
      const extended = []
      for (let i = 0; i < 10; i++) {
        extended.push(...symbols.map((_, idx) => idx))
      }
      return extended
    })
    
    setReels(extendedReels)
    
    // Animate reels
    const spinDuration = 3000
    let startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / spinDuration, 1)
      
      // Easing function for smooth deceleration
      const easing = 1 - Math.pow(1 - progress, 3)
      
      setReelPositions([
        easing * 2000 + (elapsed * 0.5),
        easing * 2500 + (elapsed * 0.6),
        easing * 3000 + (elapsed * 0.7)
      ])
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Final result
        const finalReels = [
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
        ]
        
        setReels(finalReels)
        setReelPositions([0, 0, 0])
        
        // Check for wins
        const wins = checkWin(finalReels)
        const totalPayout = wins.reduce((sum, win) => sum + win.payout, 0)
        
        if (wins.length > 0) {
          setLastWin({
            wins,
            totalPayout,
            betAmount
          })
          setShowResult(true)
        }
        
        setIsSpinning(false)
      }
    }
    
    requestAnimationFrame(animate)
  }

  const handleNextSpin = () => {
    setShowResult(false)
    setLastWin(null)
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
      <div style={{
        background: '#1e293b',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: '#e2e8f0',
        position: 'relative'
      }}>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.5); }
            50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.8); }
            100% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.5); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .winning-line {
            animation: glow 1s ease-in-out infinite;
          }
          
          .reel-symbol {
            transition: transform 0.1s linear;
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="#8b5cf6" strokeWidth="2"/>
              <path d="M8 7V17M12 7V17M16 7V17" stroke="#8b5cf6" strokeWidth="1.5"/>
              <circle cx="8" cy="10" r="1" fill="#8b5cf6"/>
              <circle cx="12" cy="12" r="1" fill="#8b5cf6"/>
              <circle cx="16" cy="14" r="1" fill="#8b5cf6"/>
            </svg>
            Slots
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
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          gap: '2rem'
        }}>
          {/* Slot Machine */}
          <div style={{
            background: '#0f172a',
            borderRadius: '1rem',
            padding: '2rem',
            border: '3px solid #fbbf24',
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.3)',
            position: 'relative'
          }}>
            {/* Reels Container */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '1rem',
              borderRadius: '0.5rem',
              position: 'relative'
            }}>
              {reels.map((reel, reelIndex) => (
                <div
                  key={reelIndex}
                  style={{
                    width: '100px',
                    height: '300px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '2px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div
                    className="reel-symbol"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transform: `translateY(${-reelPositions[reelIndex]}px)`,
                      transition: isSpinning ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    }}
                  >
                    {reel.map((symbolId, index) => (
                      <div
                        key={index}
                        style={{
                          width: '100px',
                          height: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                          userSelect: 'none'
                        }}
                      >
                        {symbols[symbolId]?.icon || ''}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Payline Indicators */}
              {lastWin && lastWin.wins.map((win, index) => {
                const lineIndex = paylines.findIndex(p => p.name === win.payline)
                return (
                  <div
                    key={index}
                    className="winning-line"
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: '#fbbf24',
                      top: lineIndex === 0 ? '50%' : lineIndex === 1 ? '25%' : lineIndex === 2 ? '75%' : '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10
                    }}
                  />
                )
              })}
            </div>

            {/* Spin Button */}
            <button
              onClick={spin}
              disabled={isSpinning || betAmount > parseFloat(chipBalance)}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '1rem',
                background: (isSpinning || betAmount > parseFloat(chipBalance))
                  ? '#6b7280'
                  : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                cursor: (isSpinning || betAmount > parseFloat(chipBalance))
                  ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isSpinning ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Spinning...
                </>
              ) : (
                <>SPIN ({betAmount} CHIP)</>
              )}
            </button>
          </div>

          {/* Betting Controls */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {/* Bet Amount */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              padding: '1rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Bet:</span>
              {[1, 5, 10, 25, 50, 100].map(value => (
                <button
                  key={value}
                  onClick={() => setBetAmount(value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: betAmount === value ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)',
                    color: betAmount === value ? 'white' : '#e2e8f0',
                    border: betAmount === value ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.375rem',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  {value}
                </button>
              ))}
            </div>

            {/* Paytable */}
            <button
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
              </svg>
              Paytable
            </button>
          </div>
        </div>

        {/* Result Overlay */}
        {showResult && lastWin && (
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
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#34d399" stroke="#34d399" strokeWidth="2"/>
                </svg>
              </div>
              
              <h2 style={{
                fontSize: '1.75rem',
                marginBottom: '1rem',
                color: '#34d399'
              }}>
                You Win!
              </h2>
              
              <div style={{
                fontSize: '1.5rem',
                color: '#34d399',
                marginBottom: '1.5rem',
                fontWeight: 'bold'
              }}>
                +{lastWin.totalPayout} CHIP
              </div>
              
              {lastWin.wins.map((win, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '2rem'
                  }}>
                    {win.symbols.map((symbol, i) => (
                      <span key={i}>{symbol.icon}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    {win.payline} - {win.payout} CHIP
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleNextSpin}
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
                Spin Again
              </button>
            </div>
          </div>
        )}
        
        {/* Contract Link */}
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          zIndex: 10
        }}>
          <ContractLink contractName="slots" />
        </div>
      </div>
    </div>
  )
}

export default SlotsGame