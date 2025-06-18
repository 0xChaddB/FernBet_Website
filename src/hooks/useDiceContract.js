import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { DICE_CONFIG } from '../config/contracts'

export const useDiceContract = () => {
  const { address, isConnected } = useAccount()
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

  // Read active bet
  const { data: activeBet, refetch: refetchActiveBet } = useReadContract({
    ...DICE_CONFIG,
    functionName: 'getActiveBet',
    args: [address],
    enabled: !!address,
  })

  const { data: hasActiveBet, refetch: refetchHasActiveBet } = useReadContract({
    ...DICE_CONFIG,
    functionName: 'hasActiveBet',
    args: [address],
    enabled: !!address,
  })

  // Write functions
  const { writeContract: placeBetWrite, data: placeBetHash, isPending: isPlaceBetPending } = useWriteContract()
  const { writeContract: claimWinningsWrite, data: claimHash, isPending: isClaimPending } = useWriteContract()

  // Wait for transaction confirmations
  const { isLoading: isPlaceBetConfirming, isSuccess: isPlaceBetSuccess } = useWaitForTransactionReceipt({
    hash: placeBetHash,
  })

  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  // Update game state based on contract data
  useEffect(() => {
    if (activeBet && hasActiveBet) {
      const [betAmount, betType, targetNumber, requestId, isResolved, rolledNumber, payout] = activeBet
      
      setGameState(prev => ({
        ...prev,
        hasActiveBet: hasActiveBet,
        betAmount: betAmount.toString(),
        betType: betType,
        targetNumber: targetNumber,
        isResolved: isResolved,
        rolledNumber: rolledNumber,
        payout: payout.toString(),
        isLoading: isPlaceBetPending || isPlaceBetConfirming || isClaimPending || isClaimConfirming,
        message: !hasActiveBet ? 'Choose your bet to start playing' :
                !isResolved ? 'Waiting for dice roll...' :
                payout > 0 ? `You won ${payout} CHIP! Click to claim.` :
                'Better luck next time! Click to play again.'
      }))
    } else if (hasActiveBet === false) {
      setGameState(prev => ({
        ...prev,
        hasActiveBet: false,
        betAmount: '0',
        betType: 0,
        targetNumber: 1,
        isResolved: false,
        rolledNumber: 0,
        payout: '0',
        isLoading: isPlaceBetPending || isPlaceBetConfirming,
        message: 'Choose your bet to start playing'
      }))
    }
  }, [activeBet, hasActiveBet, isPlaceBetPending, isPlaceBetConfirming, isClaimPending, isClaimConfirming])

  // Refetch data when transactions complete
  useEffect(() => {
    if (isPlaceBetSuccess) {
      refetchActiveBet()
      refetchHasActiveBet()
    }
  }, [isPlaceBetSuccess])

  useEffect(() => {
    if (isClaimSuccess) {
      refetchActiveBet()
      refetchHasActiveBet()
    }
  }, [isClaimSuccess])

  const placeBet = async (betType, targetNumber, betAmount) => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true, message: 'Placing bet...' }))
      
      placeBetWrite({
        ...DICE_CONFIG,
        functionName: 'placeBet',
        args: [betType, targetNumber, betAmount],
      })
    } catch (error) {
      console.error('Error placing bet:', error)
      setGameState(prev => ({ ...prev, isLoading: false, message: 'Failed to place bet' }))
    }
  }

  const claimWinnings = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true, message: 'Claiming winnings...' }))
      
      claimWinningsWrite({
        ...DICE_CONFIG,
        functionName: 'claimWinnings',
      })
    } catch (error) {
      console.error('Error claiming winnings:', error)
      setGameState(prev => ({ ...prev, isLoading: false, message: 'Failed to claim winnings' }))
    }
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

  const calculatePayout = (betType, targetNumber, betAmount) => {
    const amount = parseFloat(betAmount)
    
    if (betType === 2) { // Exact
      return amount * 6
    } else if (betType === 0) { // Over
      if (targetNumber === 1) return amount * 1.2
      if (targetNumber === 2) return amount * 1.5
      if (targetNumber === 3) return amount * 2
      if (targetNumber === 4) return amount * 3
      if (targetNumber === 5) return amount * 6
    } else if (betType === 1) { // Under
      if (targetNumber === 6) return amount * 1.2
      if (targetNumber === 5) return amount * 1.5
      if (targetNumber === 4) return amount * 2
      if (targetNumber === 3) return amount * 3
      if (targetNumber === 2) return amount * 6
    }
    return 0
  }

  return {
    gameState,
    placeBet,
    claimWinnings,
    isConnected,
    getBetTypeName,
    getProbability,
    calculatePayout
  }
}