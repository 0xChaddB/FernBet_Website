import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { baseSepolia } from 'wagmi/chains'
import { CONTRACT_ADDRESSES } from '../config/contracts'
import { useEnsureCHIPApproval } from './useCHIPToken'
import { getNetworkKeyByChainId } from '../config/networks'

// Slots ABI for simplified contract
const SLOTS_SIMPLE_ABI = [
  {
    "type": "function",
    "name": "spin",
    "inputs": [
      {"name": "_betAmount", "type": "uint88"},
      {"name": "_lines", "type": "uint8"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimWinnings",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "hasActiveSpin",
    "inputs": [{"name": "player", "type": "address"}],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getActiveSpin",
    "inputs": [{"name": "player", "type": "address"}],
    "outputs": [
      {"name": "betAmount", "type": "uint88"},
      {"name": "lines", "type": "uint8"},
      {"name": "isResolved", "type": "bool"},
      {"name": "reels", "type": "uint8[3][3]"},
      {"name": "payout", "type": "uint88"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSymbolName",
    "inputs": [{"name": "symbol", "type": "uint8"}],
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "pure"
  }
]

export const useSlotsContractSimple = () => {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
  const { ensureApproval, isApproving } = useEnsureCHIPApproval()
  const chainId = useChainId()
  const networkKey = getNetworkKeyByChainId(chainId)
  const contractAddress = networkKey ? CONTRACT_ADDRESSES[networkKey]?.slots : null

  const [pendingResult, setPendingResult] = useState(null)
  const [lastGameResult, setLastGameResult] = useState(null)

  // Read active spin
  const { data: hasActiveSpin, refetch: refetchHasActiveSpin } = useReadContract({
    address: contractAddress,
    abi: SLOTS_SIMPLE_ABI,
    functionName: 'hasActiveSpin',
    args: [address],
    enabled: !!address && isConnected && !!contractAddress
  })

  const { data: activeSpin, refetch: refetchActiveSpin } = useReadContract({
    address: contractAddress,
    abi: SLOTS_SIMPLE_ABI,
    functionName: 'getActiveSpin',
    args: [address],
    enabled: !!address && isConnected && hasActiveSpin && !!contractAddress
  })

  // Spin function
  const spin = async (betAmount, lines) => {
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
      // Calculate total bet
      const totalBet = betAmount * lines
      
      // Ensure CHIP approval for total bet
      const approved = await ensureApproval(totalBet)
      if (!approved) {
        console.error('Failed to approve CHIP tokens')
        return
      }

      const betInWei = parseUnits(betAmount.toString(), 18)

      // Spin
      writeContract({
        address: contractAddress,
        abi: SLOTS_SIMPLE_ABI,
        functionName: 'spin',
        args: [betInWei, lines]
      })

    } catch (error) {
      console.error('Spin failed:', error)
    }
  }

  // Claim winnings function
  const claimWinnings = async () => {
    if (!address || !isConnected || !contractAddress) return

    try {
      writeContract({
        address: contractAddress,
        abi: SLOTS_SIMPLE_ABI,
        functionName: 'claimWinnings'
      })
    } catch (error) {
      console.error('Claim winnings failed:', error)
    }
  }

  // Symbol emoji mapping
  const getSymbolEmoji = (symbol) => {
    const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '🍀', '7️⃣']
    return symbols[symbol] || '?'
  }

  // Capture result when spin is resolved
  useEffect(() => {
    if (activeSpin && activeSpin[2]) { // isResolved
      const betAmount = formatUnits(activeSpin[0] || 0n, 18)
      const lines = activeSpin[1]
      const reels = activeSpin[3] // 3x3 array
      const payout = formatUnits(activeSpin[4] || 0n, 18)
      
      const won = payout > 0
      
      setPendingResult({
        betAmount: parseFloat(betAmount),
        lines,
        reels,
        won,
        payout: parseFloat(payout),
        totalBet: parseFloat(betAmount) * lines
      })
    }
  }, [activeSpin])

  // Transfer result when spin is cleared
  useEffect(() => {
    if (!hasActiveSpin && pendingResult) {
      setLastGameResult(pendingResult)
      setPendingResult(null)
    }
  }, [hasActiveSpin, pendingResult])

  // Refresh data after transaction
  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        refetchHasActiveSpin()
        refetchActiveSpin()
      }, 1000)
    }
  }, [isConfirmed])

  return {
    // Actions
    spin,
    claimWinnings,
    
    // State
    hasActiveSpin: !!hasActiveSpin,
    activeSpin: activeSpin ? {
      betAmount: formatUnits(activeSpin[0] || 0n, 18),
      lines: activeSpin[1],
      isResolved: activeSpin[2],
      reels: activeSpin[3],
      payout: formatUnits(activeSpin[4] || 0n, 18)
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
    clearLastGameResult: () => setLastGameResult(null),
    
    // Helpers
    getSymbolEmoji
  }
}