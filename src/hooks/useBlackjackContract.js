import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { BLACKJACK_CONFIG, GAME_FLAGS, isFlagSet, formatCard } from '../config/blackjack'

export const useBlackjackContract = () => {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
  
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
    address: BLACKJACK_CONFIG.address,
    abi: BLACKJACK_CONFIG.abi,
    functionName: 'isInGame',
    args: [address],
    enabled: !!address && isConnected
  })

  const { data: playerCards, refetch: refetchPlayerCards } = useReadContract({
    address: BLACKJACK_CONFIG.address,
    abi: BLACKJACK_CONFIG.abi,
    functionName: 'getPlayerCards',
    args: [address],
    enabled: !!address && isConnected && isInGame
  })

  const { data: dealerCards, refetch: refetchDealerCards } = useReadContract({
    address: BLACKJACK_CONFIG.address,
    abi: BLACKJACK_CONFIG.abi,
    functionName: 'getDealerCards',
    args: [address],
    enabled: !!address && isConnected && isInGame
  })

  const { data: gameData, refetch: refetchGameData } = useReadContract({
    address: BLACKJACK_CONFIG.address,
    abi: BLACKJACK_CONFIG.abi,
    functionName: 'getGameData',
    args: [address],
    enabled: !!address && isConnected && isInGame
  })

  // === SMART WALLET SESSION MANAGEMENT ===
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionExpiry, setSessionExpiry] = useState(null)

  const createGameSession = async () => {
    try {
      // Coinbase Smart Wallet Session Key création
      const session = await window.ethereum?.request({
        method: 'wallet_createSession',
        params: [{
          duration: 3600, // 1 heure
          permissions: [
            {
              target: BLACKJACK_CONFIG.address,
              functions: ['hit', 'stand', 'resolveGame'], // Pas startGame (garde le contrôle des mises)
              maxGasLimit: '200000'
            }
          ]
        }]
      })
      
      if (session) {
        setSessionActive(true)
        setSessionExpiry(Date.now() + 3600000) // 1 heure
        localStorage.setItem('fernbet_session', JSON.stringify({
          active: true,
          expiry: Date.now() + 3600000
        }))
        return true
      }
    } catch (error) {
      console.error('Session creation failed:', error)
    }
    return false
  }

  const revokeSession = async () => {
    try {
      await window.ethereum?.request({
        method: 'wallet_revokeSession',
        params: []
      })
      setSessionActive(false)
      setSessionExpiry(null)
      localStorage.removeItem('fernbet_session')
    } catch (error) {
      console.error('Session revocation failed:', error)
    }
  }

  // === GAME ACTIONS AVEC SMART WALLET OPTIMISÉ ===
  const startGame = async (betAmount) => {
    if (!address || !isConnected) return

    try {
      setGameState(prev => ({ ...prev, isLoading: true, message: 'Starting game...' }))

      // Cette action nécessite toujours une signature (implique une mise)
      writeContract({
        address: BLACKJACK_CONFIG.address,
        abi: BLACKJACK_CONFIG.abi,
        functionName: 'startGame',
        value: parseEther(betAmount.toString())
      })

      // Proposer la création d'une session après le premier jeu
      if (!sessionActive) {
        setTimeout(async () => {
          const sessionCreated = await createGameSession()
          if (sessionCreated) {
            setGameState(prev => ({ 
              ...prev, 
              message: 'Session created! Next actions won\'t require signatures.' 
            }))
          }
        }, 2000)
      }

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

      if (sessionActive) {
        // Transaction automatique sans signature
        await window.ethereum?.request({
          method: 'wallet_executeSession',
          params: [{
            to: BLACKJACK_CONFIG.address,
            data: encodeFunctionData({
              abi: BLACKJACK_CONFIG.abi,
              functionName: 'hit'
            })
          }]
        })
      } else {
        // Transaction normale avec signature
        writeContract({
          address: BLACKJACK_CONFIG.address,
          abi: BLACKJACK_CONFIG.abi,
          functionName: 'hit'
        })
      }

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

      if (sessionActive) {
        await window.ethereum?.request({
          method: 'wallet_executeSession',
          params: [{
            to: BLACKJACK_CONFIG.address,
            data: encodeFunctionData({
              abi: BLACKJACK_CONFIG.abi,
              functionName: 'stand'
            })
          }]
        })
      } else {
        writeContract({
          address: BLACKJACK_CONFIG.address,
          abi: BLACKJACK_CONFIG.abi,
          functionName: 'stand'
        })
      }

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

      if (sessionActive) {
        await window.ethereum?.request({
          method: 'wallet_executeSession',
          params: [{
            to: BLACKJACK_CONFIG.address,
            data: encodeFunctionData({
              abi: BLACKJACK_CONFIG.abi,
              functionName: 'resolveGame'
            })
          }]
        })
      } else {
        writeContract({
          address: BLACKJACK_CONFIG.address,
          abi: BLACKJACK_CONFIG.abi,
          functionName: 'resolveGame'
        })
      }

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
      const flags = gameData?.[1] || 0
      
      if (isFlagSet(flags, GAME_FLAGS.DEALER_DONE)) {
        status = 'gameOver'
        message = 'Game finished! Resolve to see results.'
      } else if (isFlagSet(flags, GAME_FLAGS.PLAYER_STOOD)) {
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
      bet: gameData?.[0] ? formatEther(gameData[0]) : '0',
      status,
      message,
      isLoading: isWritePending || isConfirming
    })

  }, [isConnected, isInGame, playerCards, dealerCards, gameData, isWritePending, isConfirming])

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
    
    // Gestion des sessions
    sessionActive,
    sessionExpiry,
    createGameSession,
    revokeSession,
    
    // État des transactions
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
    
    // État de connexion
    isConnected,
    address
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