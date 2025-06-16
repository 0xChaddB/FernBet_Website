// Configuration du contrat Blackjack
export const BLACKJACK_CONFIG = {
  // Adresse du contrat une fois déployé
  address: '0x...', // À remplacer par l'adresse réelle après déploiement
  
  // ABI simplifié avec les fonctions principales
  abi: [
    // === GAME FUNCTIONS ===
    {
      "type": "function",
      "name": "startGame",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "hit",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "stand",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "resolveGame",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },

    // === VIEW FUNCTIONS ===
    {
      "type": "function",
      "name": "isInGame",
      "inputs": [{"name": "player", "type": "address"}],
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPlayerCards",
      "inputs": [{"name": "player", "type": "address"}],
      "outputs": [{"name": "", "type": "uint8[]"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getDealerCards",
      "inputs": [{"name": "player", "type": "address"}],
      "outputs": [{"name": "", "type": "uint8[]"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getBet",
      "inputs": [{"name": "player", "type": "address"}],
      "outputs": [{"name": "", "type": "uint88"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getStatusFlags",
      "inputs": [{"name": "player", "type": "address"}],
      "outputs": [{"name": "", "type": "uint8"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getHandValue",
      "inputs": [{"name": "cards", "type": "uint8[]"}],
      "outputs": [{"name": "", "type": "uint8"}],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getGameData",
      "inputs": [{"name": "_player", "type": "address"}],
      "outputs": [
        {"name": "bet", "type": "uint88"},
        {"name": "statusFlags", "type": "uint8"},
        {"name": "remainingCards", "type": "uint8"}
      ],
      "stateMutability": "view"
    },

    // === CONSTANTS ===
    {
      "type": "function",
      "name": "MINIMUM_BET",
      "inputs": [],
      "outputs": [{"name": "", "type": "uint88"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MAXIMUM_BET",
      "inputs": [],
      "outputs": [{"name": "", "type": "uint88"}],
      "stateMutability": "view"
    }
  ]
}

// Flags du jeu (selon votre contrat)
export const GAME_FLAGS = {
  ACTIVE: 0,
  PLAYER_STOOD: 1,
  DEALER_DONE: 2
}

// Helper pour checker les flags
export const isFlagSet = (flags, bit) => {
  return (flags & (1 << bit)) !== 0
}

// Conversion carte index vers affichage
export const formatCard = (cardIndex) => {
  const suits = ['♠️', '♥️', '♦️', '♣️']
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  
  const suit = suits[Math.floor(cardIndex / 13)]
  const rank = ranks[cardIndex % 13]
  
  return { rank, suit, display: `${rank}${suit}`, index: cardIndex }
}