import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { baseSepolia } from 'wagmi/chains'
import { DICE_CONFIG, CONTRACT_ADDRESSES } from '../config/contracts'
import { useEnsureCHIPApproval } from './useCHIPToken'
import { getNetworkKeyByChainId } from '../config/networks'

export const useDiceContractSimple = () => {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
  const { ensureApproval, isApproving } = useEnsureCHIPApproval()
  const chainId = useChainId()
  const networkKey = getNetworkKeyByChainId(chainId)
  const contractAddress = networkKey ? CONTRACT_ADDRESSES[networkKey]?.dice : null

  const [pendingResult, setPendingResult] = useState(null)
  const [lastGameResult, setLastGameResult] = useState(null)

  // Read active bet
  const { data: hasActiveBet, refetch: refetchHasActiveBet } = useReadContract({
    address: contractAddress,
    abi: DICE_CONFIG.abi,
    functionName: 'hasActiveBet',
    args: [address],
    enabled: !!address && isConnected && !!contractAddress
  })

  const { data: activeBet, refetch: refetchActiveBet } = useReadContract({
    address: contractAddress,
    abi: DICE_CONFIG.abi,
    functionName: 'getActiveBet',
    args: [address],
    enabled: !!address && isConnected && hasActiveBet && !!contractAddress
  })

  // Place bet function
  const placeBet = async (betType, targetNumber, betAmount) => {
    if (!address || !isConnected) return

    if (chainId !== baseSepolia.id) {
      console.error('Wrong network')
      return
    }

    if (!contractAddress) {
      console.error('No contract address')
      return
    }

    try {
      // Ensure CHIP approval
      const approved = await ensureApproval(betAmount)
      if (!approved) {
        console.error('Failed to approve CHIP tokens')
        return
      }

      const betInWei = parseUnits(betAmount.toString(), 18)

      // Place bet
      writeContract({
        address: contractAddress,
        abi: DICE_CONFIG.abi,
        functionName: 'placeBet',
        args: [betType, targetNumber, betInWei]
      })

    } catch (error) {
      console.error('Place bet failed:', error)
    }
  }

  // Claim winnings function
  const claimWinnings = async () => {
    if (!address || !isConnected || !contractAddress) return

    try {
      writeContract({
        address: contractAddress,
        abi: DICE_CONFIG.abi,
        functionName: 'claimWinnings'
      })
    } catch (error) {
      console.error('Claim winnings failed:', error)
    }
  }

  // Capture result when bet is resolved
  useEffect(() => {
    if (activeBet && activeBet[4]) { // isResolved
      const betAmount = formatUnits(activeBet[0] || 0n, 18)
      const betType = activeBet[1]
      const targetNumber = activeBet[2]
      const rolledNumber = activeBet[5]
      const payout = formatUnits(activeBet[6] || 0n, 18)
      
      const won = payout > 0
      
      setPendingResult({
        betType,
        targetNumber,
        rolledNumber,
        won,
        payout: parseFloat(payout),
        betAmount: parseFloat(betAmount)
      })
    }
  }, [activeBet])

  // Transfer result when bet is cleared
  useEffect(() => {
    if (!hasActiveBet && pendingResult) {
      setLastGameResult(pendingResult)
      setPendingResult(null)
    }
  }, [hasActiveBet, pendingResult])

  // Refresh data after transaction
  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        refetchHasActiveBet()
        refetchActiveBet()
      }, 1000)
    }
  }, [isConfirmed])

  return {
    // Actions
    placeBet,
    claimWinnings,
    
    // State
    hasActiveBet: !!hasActiveBet,
    activeBet: activeBet ? {
      betAmount: formatUnits(activeBet[0] || 0n, 18),
      betType: activeBet[1],
      targetNumber: activeBet[2],
      isResolved: activeBet[4],
      rolledNumber: activeBet[5],
      payout: formatUnits(activeBet[6] || 0n, 18)
    } : null,
    
    // Transaction state
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
    isApproving,
    
    // Connection state
    isConnected,
    address,
    
    // Results
    lastGameResult,
    clearLastGameResult: () => setLastGameResult(null)
  }
}