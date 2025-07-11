import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { baseSepolia } from 'wagmi/chains'
import { BLACKJACK_CONFIG, formatCard, CONTRACT_ADDRESSES } from '../config/contracts'
import { useEnsureCHIPApproval } from './useCHIPToken'
import { getNetworkKeyByChainId } from '../config/networks'

export const useBlackjackContract = () => {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
  const { ensureApproval, isApproving } = useEnsureCHIPApproval()
  const chainId = useChainId()
  const networkKey = getNetworkKeyByChainId(chainId)
  const contractAddress = networkKey ? CONTRACT_ADDRESSES[networkKey]?.blackjack : null
  
  const [gameState, setGameState] = useState({
    isInGame: false,
    playerCards: [],
    dealerCards: [],
    playerScore: 0,
    dealerScore: 0,
    bet: '0',
    status: 'idle', // idle, playing, playerStood, gameOver
    message: 'Start a new game',
    isLoading: false
  })

  // === READ CONTRACT DATA ===
  const { data: isInGame, refetch: refetchIsInGame } = useReadContract({
    address: contractAddress,
    abi: BLACKJACK_CONFIG.abi,
    functionName: 'isInGame',
    args: [address],
    enabled: !!address && isConnected && !!contractAddress
  })

  const { data: playerCards, refetch: refetchPlayerCards } = useReadContract({
    address: contractAddress,
    abi: BLACKJACK_CONFIG.abi,
    functionName: 'getPlayerCards',
    args: [address],
    enabled: !!address && isConnected && isInGame && !!contractAddress
  })

  const { data: dealerCards, refetch: refetchDealerCards } = useReadContract({
    address: contractAddress,
    abi: BLACKJACK_CONFIG.abi,
    functionName: 'getDealerCards',
    args: [address],
    enabled: !!address && isConnected && isInGame && !!contractAddress
  })

  const { data: gameData, refetch: refetchGameData } = useReadContract({
    address: contractAddress,
    abi: BLACKJACK_CONFIG.abi,
    functionName: 'getGameData',
    args: [address],
    enabled: !!address && isConnected && isInGame && !!contractAddress
  })


  // === GAME ACTIONS AVEC SMART WALLET OPTIMISÉ ===
  const startGame = async (betAmount) => {
    if (!address || !isConnected) return

    // Check if on correct network
    if (chainId !== baseSepolia.id) {
      setGameState(prev => ({ 
        ...prev, 
        message: 'Please switch to Base Sepolia network',
        isLoading: false 
      }))
      console.error('Wrong network. Current:', chainId, 'Expected:', baseSepolia.id)
      return
    }

    // Check if contract address is available
    if (!contractAddress) {
      setGameState(prev => ({ 
        ...prev, 
        message: 'Contract not available on this network',
        isLoading: false 
      }))
      console.error('No contract address for current network')
      return
    }

    try {
      setGameState(prev => ({ ...prev, isLoading: true, message: 'Approving CHIP tokens...' }))

      // Ensure CHIP tokens are approved first
      const approved = await ensureApproval(betAmount)
      if (!approved) {
        setGameState(prev => ({ 
          ...prev, 
          isLoading: false, 
          message: 'Failed to approve CHIP tokens' 
        }))
        return
      }

      setGameState(prev => ({ ...prev, message: 'Starting game...' }))

      // Convert bet amount to CHIP tokens (18 decimals)
      const betInWei = parseUnits(betAmount.toString(), 18)
      
      console.log('Starting game with:', {
        contractAddress,
        betAmount,
        betInWei: betInWei.toString(),
        betInWeiHex: '0x' + betInWei.toString(16)
      })

      // Start game with CHIP tokens (no ETH value needed)
      writeContract({
        address: contractAddress,
        abi: BLACKJACK_CONFIG.abi,
        functionName: 'startGame',
        args: [betInWei]
      })


    } catch (error) {
      console.error('Start game failed:', error)
      setGameState(prev => ({ 
        ...prev, 
        isLoading: false, 
        message: 'Failed to start game' 
      }))
    }
  }

  const hit = async () => {
    if (!address || !isConnected) return

    try {
      setGameState(prev => ({ ...prev, isLoading: true, message: 'Drawing card...' }))

      writeContract({
        address: contractAddress,
        abi: BLACKJACK_CONFIG.abi,
        functionName: 'hit'
      })

    } catch (error) {
      console.error('Hit failed:', error)
      setGameState(prev => ({ 
        ...prev, 
        isLoading: false, 
        message: 'Failed to draw card' 
      }))
    }
  }

  const stand = async () => {
    if (!address || !isConnected) return

    try {
      setGameState(prev => ({ ...prev, isLoading: true, message: 'Standing...' }))

      writeContract({
        address: contractAddress,
        abi: BLACKJACK_CONFIG.abi,
        functionName: 'stand'
      })

    } catch (error) {
      console.error('Stand failed:', error)
      setGameState(prev => ({ 
        ...prev, 
        isLoading: false, 
        message: 'Failed to stand' 
      }))
    }
  }

  const resolveGame = async () => {
    if (!address || !isConnected) return

    try {
      setGameState(prev => ({ ...prev, isLoading: true, message: 'Resolving game...' }))

      writeContract({
        address: contractAddress,
        abi: BLACKJACK_CONFIG.abi,
        functionName: 'resolveGame'
      })

    } catch (error) {
      console.error('Resolve game failed:', error)
      setGameState(prev => ({ 
        ...prev, 
        isLoading: false, 
        message: 'Failed to resolve game' 
      }))
    }
  }

  // === REFRESH DATA AFTER TRANSACTIONS ===
  const refreshGameData = async () => {
    await Promise.all([
      refetchIsInGame(),
      refetchPlayerCards(),
      refetchDealerCards(),
      refetchGameData()
    ])
  }

  // === UPDATE GAME STATE WHEN DATA CHANGES ===
  useEffect(() => {
    if (!isConnected) {
      setGameState({
        isInGame: false,
        playerCards: [],
        dealerCards: [],
        playerScore: 0,
        dealerScore: 0,
        bet: '0',
        status: 'idle',
        message: 'Connect wallet to play',
        isLoading: false
      })
      return
    }

    const formattedPlayerCards = playerCards?.map(formatCard) || []
    const formattedDealerCards = dealerCards?.map(formatCard) || []
    
    // Calculer les scores en utilisant la logique du contrat
    const playerScore = playerCards?.length > 0 ? calculateHandValue(playerCards) : 0
    const dealerScore = dealerCards?.length > 0 ? calculateHandValue(dealerCards) : 0

    let status = 'idle'
    let message = 'Start a new game'

    if (isInGame) {
      const isActive = gameData?.[1] || false
      const playerStood = gameData?.[2] || false
      const dealerDone = gameData?.[3] || false
      
      if (dealerDone) {
        status = 'gameOver'
        // Déterminer le résultat
        if (playerScore > 21) {
          message = `Bust! You lose with ${playerScore}. Click resolve to finish.`
        } else if (dealerScore > 21) {
          message = `Dealer busts with ${dealerScore}! You win! Click resolve to claim.`
        } else if (playerScore > dealerScore) {
          message = `You win! ${playerScore} vs ${dealerScore}. Click resolve to claim.`
        } else if (playerScore === dealerScore) {
          message = `Push! Both have ${playerScore}. Click resolve to get refund.`
        } else {
          message = `Dealer wins ${dealerScore} vs ${playerScore}. Click resolve to finish.`
        }
      } else if (playerStood) {
        status = 'playerStood'
        message = 'Dealer playing...'
      } else {
        status = 'playing'
        message = playerScore > 21 ? 'Bust! You lose.' : 'Hit or Stand?'
      }
    }

    setGameState({
      isInGame: !!isInGame,
      playerCards: formattedPlayerCards,
      dealerCards: formattedDealerCards,
      playerScore,
      dealerScore,
      bet: gameData?.[0] ? formatUnits(gameData[0], 18) : '0',
      status,
      message,
      isLoading: isWritePending || isConfirming || isApproving
    })

  }, [isConnected, isInGame, playerCards, dealerCards, gameData, isWritePending, isConfirming, isApproving])

  // Capture du résultat après résolution
  const [lastGameResult, setLastGameResult] = useState(null)
  const [pendingResult, setPendingResult] = useState(null)
  
  // Capturer le résultat AVANT la résolution quand dealerDone = true
  useEffect(() => {
    if (isInGame && gameData) {
      const dealerDone = gameData[3] // dealerDone boolean
      if (dealerDone && !pendingResult) {
        // Capturer le résultat maintenant avant que les cartes soient effacées
        const playerFinalScore = calculateHandValue(playerCards || [])
        const dealerFinalScore = calculateHandValue(dealerCards || [])
        const betAmount = gameData[0] ? formatUnits(gameData[0], 18) : '0'
        
        let result = 'lose'
        let winnings = 0
        
        if (playerFinalScore > 21) {
          result = 'lose'
        } else if (dealerFinalScore > 21 || playerFinalScore > dealerFinalScore) {
          result = 'win'
          winnings = parseFloat(betAmount) * 2
        } else if (playerFinalScore === dealerFinalScore) {
          result = 'push'
          winnings = parseFloat(betAmount)
        }
        
        setPendingResult({
          result,
          winnings,
          playerScore: playerFinalScore,
          dealerScore: dealerFinalScore,
          bet: betAmount
        })
      }
    }
    
    // Quand la partie est terminée (plus in game), transférer le résultat
    if (!isInGame && pendingResult) {
      setLastGameResult(pendingResult)
      setPendingResult(null)
    }
  }, [isInGame, gameData, playerCards, dealerCards, pendingResult])
  
  // Refresh après confirmation de transaction
  useEffect(() => {
    if (isConfirmed) {
      setTimeout(refreshGameData, 1000) // Petit délai pour laisser la blockchain se synchroniser
    }
  }, [isConfirmed])

  // Vérifier session au chargement
  useEffect(() => {
    const savedSession = localStorage.getItem('fernbet_session')
    if (savedSession) {
      const session = JSON.parse(savedSession)
      if (session.active && session.expiry > Date.now()) {
        setSessionActive(true)
        setSessionExpiry(session.expiry)
      } else {
        localStorage.removeItem('fernbet_session')
      }
    }
  }, [])

  return {
    // État du jeu
    gameState,
    
    // Actions du jeu
    startGame,
    hit,
    stand,
    resolveGame,
    refreshGameData,
    
    // État des transactions
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
    
    // État de connexion
    isConnected,
    address,
    
    // Résultat de la dernière partie
    lastGameResult,
    clearLastGameResult: () => setLastGameResult(null)
  }
}

// Helper pour calculer la valeur d'une main (réplique la logique du contrat)
const calculateHandValue = (cards) => {
  let total = 0
  let aces = 0
  
  for (const cardIndex of cards) {
    const cardRank = cardIndex % 13
    
    if (cardRank === 0) { // As
      aces++
      total += 11
    } else if (cardRank >= 10) { // Valet, Dame, Roi
      total += 10
    } else {
      total += cardRank + 1
    }
  }
  
  // Ajuster les As
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  
  return total
}