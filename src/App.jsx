import React, { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wallet'
import HomePageResponsive from './pages/HomePageResponsive'
import GamePage from './pages/GamePage'

const queryClient = new QueryClient()

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home')
  const [currentGame, setCurrentGame] = useState(null)
  
  const navigateToGame = (gameId = 'blackjack') => {
    setCurrentGame(gameId)
    setCurrentPage('game')
  }
  
  const navigateToGames = () => {
    setCurrentPage('home') // Retour à la page d'accueil qui contient les jeux
    setCurrentGame(null)
  }
  
  const navigateHome = () => {
    setCurrentPage('home')
    setCurrentGame(null)
  }

  // Routing logic simplifié
  if (currentPage === 'game') {
    return <GamePage currentGame={currentGame} onNavigateHome={navigateHome} onNavigateToGames={navigateToGames} />
  }
  
  return <HomePageResponsive onNavigateToGame={navigateToGame} />
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