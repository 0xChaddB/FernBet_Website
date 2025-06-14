import React, { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wallet'
import HomePage from './pages/HomePage'
import GamesPage from './pages/GamesPage'
import GamePage from './pages/GamePage'

const queryClient = new QueryClient()

// Composant principal avec wagmi
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'games', 'blackjack'
  
  // Navigation entre pages
  switch (currentPage) {
    case 'games':
      return (
        <GamesPage 
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateToBlackjack={() => setCurrentPage('blackjack')}
        />
      )
    case 'blackjack':
      return <GamePage onNavigateHome={() => setCurrentPage('home')} />
    default:
      return <HomePage onNavigateToGame={() => setCurrentPage('games')} />
  }
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