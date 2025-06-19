import React, { useState } from 'react'
import { Web3Provider } from './providers/Web3ProviderSimple'
import HomePageResponsive from './pages/HomePageResponsive'
import GamePage from './pages/GamePage'
import DebugNetwork from './components/DebugNetwork'

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
    <Web3Provider>
      <AppContent />
      <DebugNetwork />
    </Web3Provider>
  )
}

export default App