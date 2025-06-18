import { useState, useEffect } from 'react'
import { formatCard } from '../config/contracts'

// Mock hook for testing UI without deployed contracts
export const useMockBlackjackContract = () => {
  const [mockBalance, setMockBalance] = useState('100') // Start with 100 CHIP for demo
  const [gameState, setGameState] = useState({
    isInGame: false,
    playerCards: [],
    dealerCards: [],
    playerScore: 0,
    dealerScore: 0,
    bet: '0',
    status: 'idle',
    message: 'Choose your bet to start playing',
    isLoading: false
  })
  
  const [sessionActive, setSessionActive] = useState(false)

  const calculateHandValue = (cards) => {
    let total = 0
    let aces = 0
    
    for (const card of cards) {
      const cardIndex = typeof card === 'object' ? card.index : card
      const cardRank = cardIndex % 13
      
      if (cardRank === 0) {
        aces++
        total += 11
      } else if (cardRank >= 10) {
        total += 10
      } else {
        total += cardRank + 1
      }
    }
    
    while (total > 21 && aces > 0) {
      total -= 10
      aces--
    }
    
    return total
  }

  const startGame = async (betAmount) => {
    setGameState(prev => ({ ...prev, isLoading: true, message: 'Starting game...' }))
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Deduct bet from balance
    const newBalance = (parseFloat(mockBalance) - parseFloat(betAmount)).toFixed(2)
    setMockBalance(newBalance)
    
    // Deal initial cards
    const dealerCard1 = Math.floor(Math.random() * 52)
    const dealerCard2 = Math.floor(Math.random() * 52)
    const playerCard1 = Math.floor(Math.random() * 52)
    const playerCard2 = Math.floor(Math.random() * 52)
    
    const dealerCards = [formatCard(dealerCard1), formatCard(dealerCard2)]
    const playerCards = [formatCard(playerCard1), formatCard(playerCard2)]
    
    setGameState({
      isInGame: true,
      playerCards,
      dealerCards,
      playerScore: calculateHandValue(playerCards),
      dealerScore: calculateHandValue(dealerCards),
      bet: betAmount,
      status: 'playing',
      message: 'Hit or Stand?',
      isLoading: false
    })
  }

  const hit = async () => {
    if (gameState.status !== 'playing') return
    
    setGameState(prev => ({ ...prev, isLoading: true, message: 'Drawing card...' }))
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newCard = formatCard(Math.floor(Math.random() * 52))
    const newPlayerCards = [...gameState.playerCards, newCard]
    const newScore = calculateHandValue(newPlayerCards)
    
    setGameState(prev => ({
      ...prev,
      playerCards: newPlayerCards,
      playerScore: newScore,
      isLoading: false,
      message: newScore > 21 ? '💥 Bust! You lose.' : 'Hit or Stand?',
      status: newScore > 21 ? 'gameOver' : 'playing'
    }))
    
    // Mark as game over if bust but don't auto-resolve
    if (newScore > 21) {
      setGameState(prev => ({
        ...prev,
        status: 'gameOver'
      }))
    }
  }

  const stand = async () => {
    setGameState(prev => ({ ...prev, isLoading: true, message: 'Dealer playing...' }))
    
    // First update to show dealer's hidden card
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let dealerCards = [...gameState.dealerCards]
    let dealerScore = calculateHandValue(dealerCards)
    
    // Draw cards one by one with animation
    while (dealerScore < 17) {
      await new Promise(resolve => setTimeout(resolve, 800))
      const newCard = formatCard(Math.floor(Math.random() * 52))
      dealerCards = [...dealerCards, newCard]
      dealerScore = calculateHandValue(dealerCards)
      
      setGameState(prev => ({
        ...prev,
        dealerCards: dealerCards,
        dealerScore: dealerScore,
        message: `Dealer has ${dealerScore}...`
      }))
    }
    
    // Final update
    setGameState(prev => ({
      ...prev,
      dealerCards,
      dealerScore,
      status: 'gameOver',
      isLoading: false,
      message: 'Dealer finished drawing.'
    }))
    
    // Don't auto-resolve, let user click resolve button
  }

  const resolveGame = async () => {
    if (gameState.status !== 'gameOver') return
    
    setGameState(prev => ({ ...prev, isLoading: true, message: 'Resolving game...' }))
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const playerScore = gameState.playerScore
    const dealerScore = gameState.dealerScore
    const bet = parseFloat(gameState.bet)
    
    let winnings = 0
    let message = ''
    let result = 'loss'
    
    if (playerScore > 21) {
      message = '💥 You busted! Dealer wins.'
      result = 'loss'
    } else if (dealerScore > 21) {
      message = '🎉 Dealer busted! You win!'
      winnings = bet * 2
      result = 'win'
    } else if (playerScore > dealerScore) {
      message = '🎉 You win!'
      winnings = bet * 2
      result = 'win'
    } else if (dealerScore > playerScore) {
      message = '😞 Dealer wins!'
      result = 'loss'
    } else {
      message = '🤝 Push! Bet returned.'
      winnings = bet
      result = 'push'
    }
    
    // Update balance with winnings
    if (winnings > 0) {
      setMockBalance(prev => (parseFloat(prev) + winnings).toFixed(2))
    }
    
    // Reset game state to idle after resolving
    setGameState({
      isInGame: false,
      playerCards: [],
      dealerCards: [],
      playerScore: 0,
      dealerScore: 0,
      bet: '0',
      status: 'idle',
      message: 'Choose your bet to start playing',
      isLoading: false,
      lastResult: { result, winnings, message }
    })
    
    // Return result for popup
    return { result, winnings, message }
  }

  const createGameSession = async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    setSessionActive(true)
    return true
  }

  const revokeSession = async () => {
    setSessionActive(false)
  }

  // Mock CHIP balance hook
  const useMockCHIPBalance = () => ({
    balance: mockBalance,
    isLoading: false,
    refetch: () => {}
  })

  // Mock CasinoBank hooks
  const useMockCasinoBank = () => ({
    hasClaimedFreeChips: parseFloat(mockBalance) > 0,
    useDepositETH: () => ({
      deposit: async (amount) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        // 1 ETH = 20 CHIP (assuming ETH = $2000, 1 CHIP = $100)
        const chipAmount = parseFloat(amount) * 20
        setMockBalance(prev => (parseFloat(prev) + chipAmount).toFixed(2))
      },
      isPending: false,
      isConfirming: false,
      isSuccess: false
    }),
    useCashoutCHIP: () => ({
      cashout: async (amount) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setMockBalance(prev => (parseFloat(prev) - parseFloat(amount)).toFixed(2))
      },
      isPending: false,
      isConfirming: false,
      isSuccess: false
    }),
    useClaimFreeChips: () => ({
      claimFreeChips: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setMockBalance('5')
      },
      isPending: false,
      canClaim: parseFloat(mockBalance) === 0
    }),
    useGetChipValueForETH: (ethAmount) => {
      return (parseFloat(ethAmount || 0) * 20).toFixed(2)
    },
    useGetETHValueForChip: (chipAmount) => {
      return (parseFloat(chipAmount || 0) / 20).toFixed(4)
    }
  })

  return {
    gameState,
    startGame,
    hit,
    stand,
    resolveGame,
    isConnected: true,
    sessionActive,
    createGameSession,
    revokeSession,
    address: '0xMockAddress',
    useMockCHIPBalance,
    useMockCasinoBank
  }
}