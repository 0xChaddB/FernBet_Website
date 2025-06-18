import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { CHIP_TOKEN_CONFIG, BLACKJACK_CONFIG } from '../config/contracts'

export const useCHIPBalance = () => {
  const { address, isConnected } = useAccount()
  
  const { data: balance, isLoading, refetch } = useReadContract({
    address: CHIP_TOKEN_CONFIG.address,
    abi: CHIP_TOKEN_CONFIG.abi,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && isConnected
  })

  return {
    balance: balance ? formatUnits(balance, 18) : '0',
    balanceRaw: balance || 0n,
    isLoading,
    refetch
  }
}

export const useCHIPAllowance = (spenderAddress) => {
  const { address } = useAccount()
  
  const { data: allowance, refetch } = useReadContract({
    address: CHIP_TOKEN_CONFIG.address,
    abi: CHIP_TOKEN_CONFIG.abi,
    functionName: 'allowance',
    args: [address, spenderAddress],
    enabled: !!address && !!spenderAddress
  })

  return {
    allowance: allowance || 0n,
    refetch
  }
}

export const useCHIPApprove = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const approve = async (spenderAddress, amount) => {
    try {
      const amountInWei = parseUnits(amount.toString(), 18)
      
      writeContract({
        address: CHIP_TOKEN_CONFIG.address,
        abi: CHIP_TOKEN_CONFIG.abi,
        functionName: 'approve',
        args: [spenderAddress, amountInWei]
      })
    } catch (err) {
      console.error('Approve failed:', err)
    }
  }

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error
  }
}

// Hook to check and approve CHIP tokens before playing
export const useEnsureCHIPApproval = () => {
  const { address } = useAccount()
  const { allowance, refetch: refetchAllowance } = useCHIPAllowance(BLACKJACK_CONFIG.address)
  const { approve, isPending, isConfirming, isSuccess } = useCHIPApprove()
  const { balance } = useCHIPBalance()

  const ensureApproval = async (betAmount) => {
    if (!address) return false

    const betInWei = parseUnits(betAmount.toString(), 18)
    
    // Check if current allowance is sufficient
    if (allowance >= betInWei) {
      return true
    }

    // Approve the exact amount needed (or more for convenience)
    const balanceInWei = parseUnits(balance.toString(), 18)
    const approvalAmount = balanceInWei > 0n ? balanceInWei : betInWei
    
    await approve(BLACKJACK_CONFIG.address, formatUnits(approvalAmount, 18))
    
    // Wait for approval to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        refetchAllowance()
        if (isSuccess) {
          clearInterval(checkInterval)
          resolve(true)
        }
      }, 1000)
      
      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        resolve(false)
      }, 30000)
    })
  }

  return {
    ensureApproval,
    isApproving: isPending || isConfirming,
    allowance
  }
}