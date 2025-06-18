import React, { useState, useEffect } from 'react'
import { useMockBlackjackContract } from '../hooks/useMockBlackjack'

const RouletteGame = ({ demoMode = true }) => {
  const mockContract = useMockBlackjackContract()
  const chipBalance = mockContract.useMockCHIPBalance().balance

  const [betAmount, setBetAmount] = useState(10)
  const [selectedBets, setSelectedBets] = useState([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [ballRotation, setBallRotation] = useState(0)
  const [history, setHistory] = useState([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // European roulette wheel order
  const wheelNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ]

  const getNumberColor = (num) => {
    if (num === 0) return '#10b981'
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
    return redNumbers.includes(num) ? '#dc2626' : '#1f2937'
  }

  const handleBetSelect = (type, value) => {
    const betId = `${type}-${value}`
    const existingBetIndex = selectedBets.findIndex(bet => bet.id === betId)
    
    if (existingBetIndex >= 0) {
      setSelectedBets(prev => prev.filter((_, index) => index !== existingBetIndex))
    } else {
      const totalBets = selectedBets.reduce((sum, bet) => sum + bet.amount, 0)
      if (totalBets + betAmount <= parseFloat(chipBalance)) {
        let payout = 36
        if (type === 'dozen' || type === 'column') payout = 3
        else if (type === 'half' || type === 'color' || type === 'parity') payout = 2
        
        setSelectedBets(prev => [...prev, {
          id: betId,
          type,
          value,
          amount: betAmount,
          payout
        }])
      }
    }
  }

  const checkWin = (number, bet) => {
    if (bet.type === 'straight') return bet.value === number
    if (bet.type === 'color') {
      if (number === 0) return false
      const color = getNumberColor(number) === '#dc2626' ? 'red' : 'black'
      return bet.value === color
    }
    if (bet.type === 'parity') {
      if (number === 0) return false
      return bet.value === 'even' ? number % 2 === 0 : number % 2 === 1
    }
    if (bet.type === 'half') {
      if (number === 0) return false
      return bet.value === '1-18' ? number <= 18 : number >= 19
    }
    if (bet.type === 'dozen') {
      if (number === 0) return false
      if (bet.value === '1st') return number <= 12
      if (bet.value === '2nd') return number >= 13 && number <= 24
      if (bet.value === '3rd') return number >= 25
    }
    return false
  }

  const spin = async () => {
    if (selectedBets.length === 0 || isSpinning) return
    
    setIsSpinning(true)
    
    // Generate random winning index
    const winningIndex = Math.floor(Math.random() * 37)
    const winningNumber = wheelNumbers[winningIndex]
    
    // Calculate rotation
    const degreesPerSlot = 360 / 37
    const targetRotation = 360 * 5 + (winningIndex * degreesPerSlot)
    const ballTargetRotation = -360 * 8 - (winningIndex * degreesPerSlot)
    
    setWheelRotation(prev => prev + targetRotation)
    setBallRotation(prev => prev + ballTargetRotation)
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    // Calculate winnings
    let totalWinnings = 0
    const winningBets = []
    
    selectedBets.forEach(bet => {
      if (checkWin(winningNumber, bet)) {
        const winAmount = bet.amount * bet.payout
        totalWinnings += winAmount
        winningBets.push({ ...bet, won: true, winAmount })
      }
    })
    
    // Update history
    setHistory(prev => [winningNumber, ...prev.slice(0, 9)])
    
    setResult({
      number: winningNumber,
      color: getNumberColor(winningNumber),
      totalBet: selectedBets.reduce((sum, bet) => sum + bet.amount, 0),
      totalWinnings,
      winningBets
    })
    
    setShowResult(true)
    setIsSpinning(false)
  }

  const handleNextRound = () => {
    setShowResult(false)
    setResult(null)
    setSelectedBets([])
  }

  const totalBet = selectedBets.reduce((sum, bet) => sum + bet.amount, 0)

  // Create clean wheel segments
  const createWheelSegments = () => {
    const segments = []
    const segmentAngle = 360 / 37
    
    wheelNumbers.forEach((num, i) => {
      const startAngle = i * segmentAngle
      const endAngle = (i + 1) * segmentAngle
      const midAngle = startAngle + segmentAngle / 2
      
      // Create path for segment
      const x1 = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)
      const y1 = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)
      const x2 = 50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)
      const y2 = 50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)
      
      segments.push(
        <g key={i}>
          <path
            d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
            fill={getNumberColor(num)}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
          />
          <text
            x={50 + 42 * Math.cos((midAngle - 90) * Math.PI / 180)}
            y={50 + 42 * Math.sin((midAngle - 90) * Math.PI / 180)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={num.toString().length > 1 ? "4.5" : "5"}
            fontWeight="bold"
            transform={`rotate(${midAngle}, ${50 + 42 * Math.cos((midAngle - 90) * Math.PI / 180)}, ${50 + 42 * Math.sin((midAngle - 90) * Math.PI / 180)})`}
          >
            {num}
          </text>
        </g>
      )
    })
    
    return segments
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
        maxWidth: '1200px',
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
          
          .bet-chip {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fbbf24;
            color: #1f2937;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.625rem;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            pointer-events: none;
            border: 2px solid #f59e0b;
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
              <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2"/>
              <circle cx="12" cy="12" r="7" stroke="#f59e0b" strokeWidth="1.5"/>
              <circle cx="12" cy="8" r="1.5" fill="#f59e0b"/>
            </svg>
            Roulette
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
          flexDirection: isMobile ? 'column' : 'row',
          padding: '1.5rem',
          gap: '1.5rem',
          overflow: 'auto'
        }}>
          {/* Left Side - Wheel and Controls */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
            flex: isMobile ? 'none' : '0 0 380px'
          }}>
            {/* Wheel Container */}
            <div style={{
              position: 'relative',
              width: isMobile ? '280px' : '320px',
              height: isMobile ? '280px' : '320px'
            }}>
              {/* Outer Ring */}
              <div style={{
                position: 'absolute',
                inset: '-15px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4a574, #b8935a)',
                boxShadow: '0 5px 20px rgba(0,0,0,0.5), inset 0 -2px 5px rgba(0,0,0,0.3)'
              }} />
              
              {/* Wheel */}
              <svg
                viewBox="0 0 100 100"
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
                  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))'
                }}
              >
                {createWheelSegments()}
                <circle cx="50" cy="50" r="15" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
                <circle cx="50" cy="50" r="8" fill="#d97706"/>
              </svg>
              
              {/* Ball Track */}
              <div style={{
                position: 'absolute',
                inset: '10px',
                borderRadius: '50%',
                border: '15px solid transparent',
                pointerEvents: 'none'
              }}>
                {/* Ball */}
                <div style={{
                  position: 'absolute',
                  width: '16px',
                  height: '16px',
                  background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e5e5e5 50%, #999999 100%)',
                  borderRadius: '50%',
                  top: '-8px',
                  left: 'calc(50% - 8px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  transform: `rotate(${ballRotation}deg)`,
                  transformOrigin: '8px calc(50% - 8px + 140px)',
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.25, 1)' : 'none'
                }} />
              </div>
              
              {/* Pointer */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '20px solid #fbbf24',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
                zIndex: 20
              }} />
            </div>

            {/* Recent Numbers */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              padding: '1rem',
              width: '100%'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.75rem', textAlign: 'center' }}>
                Recent Numbers
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {history.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>No spins yet</div>
                ) : (
                  history.map((num, index) => (
                    <div
                      key={index}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: getNumberColor(num),
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        opacity: 1 - (index * 0.08),
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      {num}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chip Selector */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              padding: '1rem',
              width: '100%'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.75rem', textAlign: 'center' }}>
                Select Chip Value
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {[1, 5, 10, 25, 100].map(value => (
                  <button
                    key={value}
                    onClick={() => setBetAmount(value)}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: betAmount === value 
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      color: betAmount === value ? '#1f2937' : '#e2e8f0',
                      border: betAmount === value ? '2px solid #d97706' : '2px solid rgba(255, 255, 255, 0.2)',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: betAmount === value ? '0 4px 12px rgba(251,191,36,0.4)' : 'none'
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Betting Table */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minWidth: 0
          }}>
            {/* Betting Board */}
            <div style={{
              background: '#0f172a',
              borderRadius: '0.5rem',
              padding: '1rem',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              overflowX: 'auto'
            }}>
              <div style={{ minWidth: '400px' }}>
                {/* Zero */}
                <div style={{ marginBottom: '4px' }}>
                  <div
                    onClick={() => handleBetSelect('straight', 0)}
                    style={{
                      width: '100%',
                      height: '50px',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: 'white',
                      borderRadius: '4px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: selectedBets.some(b => b.id === 'straight-0') ? '2px solid #fbbf24' : '2px solid transparent'
                    }}
                  >
                    0
                    {selectedBets.find(b => b.id === 'straight-0') && (
                      <div className="bet-chip">
                        {selectedBets.find(b => b.id === 'straight-0').amount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Numbers Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(12, 1fr)', 
                  gap: '2px',
                  marginBottom: '4px'
                }}>
                  {Array.from({ length: 36 }, (_, i) => i + 1).map(num => {
                    const bet = selectedBets.find(b => b.id === `straight-${num}`)
                    return (
                      <div
                        key={num}
                        onClick={() => handleBetSelect('straight', num)}
                        style={{
                          height: '40px',
                          background: getNumberColor(num),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: 'white',
                          borderRadius: '2px',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: bet ? '2px solid #fbbf24' : '2px solid transparent'
                        }}
                      >
                        {num}
                        {bet && (
                          <div className="bet-chip">
                            {bet.amount}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Dozens */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '2px',
                  marginBottom: '4px'
                }}>
                  {['1st 12', '2nd 12', '3rd 12'].map((label, index) => {
                    const value = ['1st', '2nd', '3rd'][index]
                    const bet = selectedBets.find(b => b.id === `dozen-${value}`)
                    return (
                      <div
                        key={value}
                        onClick={() => handleBetSelect('dozen', value)}
                        style={{
                          height: '40px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: '#e2e8f0',
                          borderRadius: '2px',
                          border: bet ? '2px solid #fbbf24' : '2px solid rgba(255, 255, 255, 0.2)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {label}
                        {bet && <div className="bet-chip">{bet.amount}</div>}
                      </div>
                    )
                  })}
                </div>

                {/* Outside Bets */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(6, 1fr)', 
                  gap: '2px' 
                }}>
                  {[
                    { type: 'half', value: '1-18', label: '1-18' },
                    { type: 'parity', value: 'even', label: 'EVEN' },
                    { type: 'color', value: 'red', label: 'RED' },
                    { type: 'color', value: 'black', label: 'BLACK' },
                    { type: 'parity', value: 'odd', label: 'ODD' },
                    { type: 'half', value: '19-36', label: '19-36' }
                  ].map(option => {
                    const bet = selectedBets.find(b => b.id === `${option.type}-${option.value}`)
                    return (
                      <div
                        key={option.value}
                        onClick={() => handleBetSelect(option.type, option.value)}
                        style={{
                          height: '40px',
                          background: option.value === 'red' ? '#dc2626' : 
                                    option.value === 'black' ? '#1f2937' : 
                                    'rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          color: 'white',
                          borderRadius: '2px',
                          border: bet ? '2px solid #fbbf24' : '2px solid rgba(255, 255, 255, 0.2)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {option.label}
                        {bet && <div className="bet-chip">{bet.amount}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedBets([])}
                  disabled={selectedBets.length === 0}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: selectedBets.length === 0 ? '#374151' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: selectedBets.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: selectedBets.length === 0 ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  Clear Bets
                </button>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Bet</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24' }}>
                    {totalBet} CHIP
                  </div>
                </div>
              </div>
              
              <button
                onClick={spin}
                disabled={selectedBets.length === 0 || isSpinning || totalBet > parseFloat(chipBalance)}
                style={{
                  padding: '0.875rem 2.5rem',
                  background: (selectedBets.length === 0 || isSpinning || totalBet > parseFloat(chipBalance))
                    ? '#374151'
                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  cursor: (selectedBets.length === 0 || isSpinning || totalBet > parseFloat(chipBalance))
                    ? 'not-allowed' : 'pointer',
                  boxShadow: (selectedBets.length === 0 || isSpinning || totalBet > parseFloat(chipBalance))
                    ? 'none' : '0 4px 15px rgba(245, 158, 11, 0.3)',
                  opacity: (selectedBets.length === 0 || isSpinning || totalBet > parseFloat(chipBalance)) ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {isSpinning ? 'SPINNING...' : 'SPIN'}
              </button>
            </div>
          </div>
        </div>

        {/* Result Modal */}
        {showResult && result && (
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
                fontSize: '3rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: result.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '3px solid rgba(255,255,255,0.2)'
              }}>
                {result.number}
              </div>
              
              <h2 style={{
                fontSize: '1.75rem',
                marginBottom: '1rem',
                color: result.totalWinnings > 0 ? '#34d399' : '#ef4444'
              }}>
                {result.totalWinnings > 0 ? 'You Win!' : 'No Win'}
              </h2>
              
              {result.totalWinnings > 0 && (
                <div style={{
                  fontSize: '1.5rem',
                  color: '#34d399',
                  marginBottom: '1rem',
                  fontWeight: 'bold'
                }}>
                  +{result.totalWinnings} CHIP
                </div>
              )}
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Total Bet: {result.totalBet} CHIP
                </div>
                {result.winningBets.length > 0 && (
                  <div style={{ fontSize: '0.875rem', color: '#34d399' }}>
                    Winning bets: {result.winningBets.length}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleNextRound}
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
                Next Round
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RouletteGame