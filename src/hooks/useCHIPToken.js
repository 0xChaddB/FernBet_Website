import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { CHIP_TOKEN_CONFIG, BLACKJACK_CONFIG, CONTRACT_ADDRESSES } from '../config/contracts'
import { getNetworkKeyByChainId } from '../config/networks'

export const useCHIPBalance = () => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const networkKey = getNetworkKeyByChainId(chainId)
  const contractAddress = networkKey ? CONTRACT_ADDRESSES[networkKey]?.casinoChip : null
  
  const { data: balance, isLoading, refetch } = useReadContract({
    address: contractAddress,
    abi: CHIP_TOKEN_CONFIG.abi,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && isConnected && !!contractAddress
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
  const chainId = useChainId()
  const networkKey = getNetworkKeyByChainId(chainId)
  const contractAddress = networkKey ? CONTRACT_ADDRESSES[networkKey]?.casinoChip : null
  
  const { data: allowance, refetch } = useReadContract({
    address: contractAddress,
    abi: CHIP_TOKEN_CONFIG.abi,
    functionName: 'allowance',
    args: [address, spenderAddress],
    enabled: !!address && !!spenderAddress && !!contractAddress
  })

  return {
    allowance: allowance || 0n,
    refetch
  }
}

export const useCHIPApprove = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const chainId = useChainId()
  const networkKey = getNetworkKeyByChainId(chainId)
  const contractAddress = networkKey ? CONTRACT_ADDRESSES[networkKey]?.casinoChip : null

  const approve = async (spenderAddress, amount) => {
    if (!contractAddress) {
      console.error('No CHIP token address for current network')
      return
    }
    
    try {
      const amountInWei = parseUnits(amount.toString(), 18)
      
      writeContract({
        address: contractAddress,
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
  const chainId = useChainId()
  const networkKey = getNetworkKeyByChainId(chainId)
  const blackjackAddress = networkKey ? CONTRACT_ADDRESSES[networkKey]?.blackjack : null
  const { allowance, refetch: refetchAllowance } = useCHIPAllowance(blackjackAddress)
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
    
    await approve(blackjackAddress, formatUnits(approvalAmount, 18))
    
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