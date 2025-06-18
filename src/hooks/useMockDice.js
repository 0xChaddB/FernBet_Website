import { useState, useEffect } from 'react'

export const useMockDiceContract = () => {
  const [gameState, setGameState] = useState({
    hasActiveBet: false,
    betAmount: '0',
    betType: 0, // 0 = Over, 1 = Under, 2 = Exact
    targetNumber: 1,
    isResolved: false,
    rolledNumber: 0,
    payout: '0',
    isLoading: false,
    message: 'Choose your bet to start playing'
  })

  const placeBet = async (betType, targetNumber, betAmount) => {
    setGameState(prev => ({ ...prev, isLoading: true, message: 'Rolling dice...' }))
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate random number 0-99.99 for stake-style dice
    const roll = Math.random() * 100
    const rolledNumber = parseFloat(roll.toFixed(2))
    
    // For stake-style dice, we use the rollOver system
    // betType 0 = Over, targetNumber is the threshold
    const won = rolledNumber > targetNumber
    const payout = won ? calculatePayout(betType, targetNumber, betAmount) : 0
    
    setGameState({
      hasActiveBet: true,
      betAmount: betAmount.toString(),
      betType: betType,
      targetNumber: targetNumber,
      isResolved: true,
      rolledNumber: rolledNumber,
      payout: payout.toString(),
      isLoading: false,
      message: won ? `🎉 You won ${payout} CHIP! Click to claim.` : `💔 You rolled ${rolledNumber}. Better luck next time!`
    })
    
    return { won, rolledNumber, payout }
  }

  const claimWinnings = async () => {
    setGameState(prev => ({ ...prev, isLoading: true, message: 'Claiming winnings...' }))
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Reset to no active bet
    setGameState({
      hasActiveBet: false,
      betAmount: '0',
      betType: 0,
      targetNumber: 1,
      isResolved: false,
      rolledNumber: 0,
      payout: '0',
      isLoading: false,
      message: 'Choose your bet to start playing'
    })
  }

  const checkWin = (betType, targetNumber, rolledNumber) => {
    if (betType === 0) { // Over
      return rolledNumber > targetNumber
    } else if (betType === 1) { // Under
      return rolledNumber < targetNumber
    } else if (betType === 2) { // Exact
      return rolledNumber === targetNumber
    }
    return false
  }

  const calculatePayout = (betType, targetNumber, betAmount) => {
    const amount = parseFloat(betAmount)
    
    // For stake-style dice: calculate payout based on win chance
    // targetNumber is the rollOver threshold (0-99.99)
    if (betType === 0) { // Over
      const winChance = (100 - targetNumber) / 100
      const multiplier = 0.99 / winChance // 99% RTP
      return amount * multiplier
    }
    
    return 0
  }

  const getBetTypeName = (betType) => {
    if (betType === 0) return 'Over'
    if (betType === 1) return 'Under'
    if (betType === 2) return 'Exact'
    return 'Unknown'
  }

  const getProbability = (betType, targetNumber) => {
    if (betType === 2) { // Exact
      return { numerator: 1, denominator: 6 }
    } else if (betType === 0) { // Over
      return { numerator: 6 - targetNumber, denominator: 6 }
    } else if (betType === 1) { // Under
      return { numerator: targetNumber - 1, denominator: 6 }
    }
    return { numerator: 0, denominator: 6 }
  }

  return {
    gameState,
    placeBet,
    claimWinnings,
    isConnected: true,
    getBetTypeName,
    getProbability,
    calculatePayout
  }
}