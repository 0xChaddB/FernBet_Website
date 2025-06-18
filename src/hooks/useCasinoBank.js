import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem'
import { CASINO_BANK_CONFIG, ETH_ADDRESS } from '../config/contracts'

export const useCasinoBank = () => {
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  
  // Check if user has claimed free chips
  const { data: hasClaimedFreeChips, refetch: refetchClaimStatus } = useReadContract({
    address: CASINO_BANK_CONFIG.address,
    abi: CASINO_BANK_CONFIG.abi,
    functionName: 'hasClaimedFreeChips',
    args: [address],
    enabled: !!address && isConnected
  })

  // Get CHIP value for ETH amount
  const useGetChipValueForETH = (ethAmount) => {
    const { data } = useReadContract({
      address: CASINO_BANK_CONFIG.address,
      abi: CASINO_BANK_CONFIG.abi,
      functionName: 'getChipValueForETH',
      args: [parseEther(ethAmount.toString())],
      enabled: !!ethAmount && ethAmount > 0
    })
    
    return data ? formatUnits(data, 18) : '0'
  }

  // Get ETH value for CHIP amount
  const useGetETHValueForChip = (chipAmount) => {
    const { data } = useReadContract({
      address: CASINO_BANK_CONFIG.address,
      abi: CASINO_BANK_CONFIG.abi,
      functionName: 'getETHValueForChip',
      args: [parseUnits(chipAmount.toString(), 18)],
      enabled: !!chipAmount && chipAmount > 0
    })
    
    return data ? formatEther(data) : '0'
  }

  // Deposit ETH for CHIP tokens
  const useDepositETH = () => {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const deposit = async (ethAmount) => {
      if (!address || !isConnected) return

      try {
        setIsLoading(true)
        writeContract({
          address: CASINO_BANK_CONFIG.address,
          abi: CASINO_BANK_CONFIG.abi,
          functionName: 'depositETH',
          value: parseEther(ethAmount.toString())
        })
      } catch (err) {
        console.error('Deposit failed:', err)
        setIsLoading(false)
      }
    }

    useEffect(() => {
      if (isSuccess || error) {
        setIsLoading(false)
      }
    }, [isSuccess, error])

    return {
      deposit,
      isPending,
      isConfirming,
      isSuccess,
      error
    }
  }

  // Cashout CHIP tokens for ETH
  const useCashoutCHIP = () => {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const cashout = async (chipAmount) => {
      if (!address || !isConnected) return

      try {
        setIsLoading(true)
        writeContract({
          address: CASINO_BANK_CONFIG.address,
          abi: CASINO_BANK_CONFIG.abi,
          functionName: 'cashoutCHIP',
          args: [parseUnits(chipAmount.toString(), 18), ETH_ADDRESS]
        })
      } catch (err) {
        console.error('Cashout failed:', err)
        setIsLoading(false)
      }
    }

    useEffect(() => {
      if (isSuccess || error) {
        setIsLoading(false)
      }
    }, [isSuccess, error])

    return {
      cashout,
      isPending,
      isConfirming,
      isSuccess,
      error
    }
  }

  // Claim free chips (one-time)
  const useClaimFreeChips = () => {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const claimFreeChips = async () => {
      if (!address || !isConnected || hasClaimedFreeChips) return

      try {
        setIsLoading(true)
        writeContract({
          address: CASINO_BANK_CONFIG.address,
          abi: CASINO_BANK_CONFIG.abi,
          functionName: 'claimFreeChips'
        })
      } catch (err) {
        console.error('Claim free chips failed:', err)
        setIsLoading(false)
      }
    }

    useEffect(() => {
      if (isSuccess) {
        refetchClaimStatus()
        setIsLoading(false)
      } else if (error) {
        setIsLoading(false)
      }
    }, [isSuccess, error])

    return {
      claimFreeChips,
      isPending,
      isConfirming,
      isSuccess,
      error,
      canClaim: !hasClaimedFreeChips
    }
  }

  return {
    hasClaimedFreeChips: !!hasClaimedFreeChips,
    useGetChipValueForETH,
    useGetETHValueForChip,
    useDepositETH,
    useCashoutCHIP,
    useClaimFreeChips,
    isLoading,
    isConnected,
    address
  }
}