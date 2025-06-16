// Configuration centralisée des jeux
export const GAMES_CONFIG = [
  {
    id: 'blackjack',
    name: 'Blackjack',
    icon: '♠️',
    description: 'Beat the dealer with strategy and skill in this timeless card game',
    players: '2.4k',
    available: true,
    minBet: '0.01 ETH',
    maxBet: '10 ETH',
    rtp: '99.5%',
    contractAddress: '0x...', // Adresse du contrat
    features: ['Provably Fair', 'Instant Payouts', 'Multiple Tables']
  },
  {
    id: 'slots',
    name: 'Slots',
    icon: '🎰',
    description: 'Spin the reels and discover your fortune with our engaging slot machines',
    players: '5.8k',
    available: false, // Pas encore développé
    minBet: '0.001 ETH',
    maxBet: '5 ETH',
    rtp: '96.8%',
    contractAddress: null,
    features: ['Wild Symbols', 'Free Spins', 'Progressive Jackpot']
  },
  {
    id: 'roulette',
    name: 'Roulette',
    icon: '🎯',
    description: 'Where luck meets the wheel of fortune',
    players: '3.1k',
    available: false,
    minBet: '0.005 ETH',
    maxBet: '20 ETH',
    rtp: '97.3%',
    contractAddress: null,
    features: ['European Rules', 'Live Wheel', 'Multiple Bets']
  },
  {
    id: 'poker',
    name: 'Poker',
    icon: '🃏',
    description: 'Strategic play in our premium poker rnpmooms',
    players: '890',
    available: false,
    minBet: '0.02 ETH',
    maxBet: '50 ETH',
    rtp: '98.2%',
    contractAddress: null,
    features: ['Texas Hold\'em', 'Tournament Mode', 'Player vs Player']
  }
]

// Helper functions
export const getAvailableGames = () => GAMES_CONFIG.filter(game => game.available)
export const getGameById = (id) => GAMES_CONFIG.find(game => game.id === id)
export const getGameContract = (id) => getGameById(id)?.contractAddress