import React, { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wallet'
import HomePage from './pages/HomePage'
import GamesListPage from './pages/GamesListPage'
import BlackjackPage from './pages/games/BlackjackPage'
// import SlotsPage from './pages/games/SlotsPage'     // Futur
// import RoulettePage from './pages/games/RoulettePage' // Futur

const queryClient = new QueryClient()

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home')
  const [currentGame, setCurrentGame] = useState(null)
  
  const navigateToGame = (gameId) => {
    setCurrentGame(gameId)
    setCurrentPage('game')
  }
  
  const navigateToGames = () => {
    setCurrentPage('games')
    setCurrentGame(null)
  }
  
  const navigateHome = () => {
    setCurrentPage('home')
    setCurrentGame(null)
  }

  // Routing logic
  if (currentPage === 'game' && currentGame) {
    switch (currentGame) {
      case 'blackjack':
        return <BlackjackPage onNavigateHome={navigateHome} onNavigateToGames={navigateToGames} />
      case 'slots':
        // return <SlotsPage onNavigateHome={navigateHome} onNavigateToGames={navigateToGames} />
        return <div>Slots Coming Soon!</div>
      case 'roulette':
        // return <RoulettePage onNavigateHome={navigateHome} onNavigateToGames={navigateToGames} />
        return <div>Roulette Coming Soon!</div>
      default:
        return <GamesListPage onNavigateHome={navigateHome} onNavigateToGame={navigateToGame} />
    }
  }
  
  if (currentPage === 'games') {
    return <GamesListPage onNavigateHome={navigateHome} onNavigateToGame={navigateToGame} />
  }
  
  return <HomePage onNavigateToGames={navigateToGames} />
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App