// Contract addresses - DEPLOYED 2025-01-18
export const CONTRACT_ADDRESSES = {
  // Base Sepolia addresses
  'base-sepolia': {
    casinoChip: '0x52cBc9331983B8BC9b012EEbf50e43aD4c358f46',
    casinoBank: '0x43414bFBE80CFfC83329217c55dE433e473a717f', // Using the first CasinoBank that CasinoChip recognizes
    blackjack: '0x4b8fE239BFA3d6cFb3393D72F9a6d16b0B2DCD90',
    dice: '0xD3E221DfbF78fa72d9Afcad8887F6a7806b21aBC',
    roulette: '0x399F2e0b5297f77e86608aEe4c03656EA5425b6a',
    slots: '0xbE43673140Eb66239ee49b33FFb5Bb5f3DfaEb5C',
  }
}

// CHIP Token Configuration
export const CHIP_TOKEN_CONFIG = {
  abi: [
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [{"name": "account", "type": "address"}],
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        {"name": "spender", "type": "address"},
        {"name": "amount", "type": "uint256"}
      ],
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "allowance",
      "inputs": [
        {"name": "owner", "type": "address"},
        {"name": "spender", "type": "address"}
      ],
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transfer",
      "inputs": [
        {"name": "to", "type": "address"},
        {"name": "amount", "type": "uint256"}
      ],
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "decimals",
      "inputs": [],
      "outputs": [{"name": "", "type": "uint8"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "symbol",
      "inputs": [],
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "name",
      "inputs": [],
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view"
    }
  ]
}

// Casino Bank Configuration
export const CASINO_BANK_CONFIG = {
  abi: [
    {
      "type": "function",
      "name": "depositETH",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "cashoutCHIP",
      "inputs": [
        {"name": "chipAmount", "type": "uint256"},
        {"name": "toToken", "type": "address"}
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "claimFreeChips",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "hasClaimedFreeChips",
      "inputs": [{"name": "", "type": "address"}],
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getChipValueForETH",
      "inputs": [{"name": "ethAmount", "type": "uint256"}],
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getETHValueForChip",
      "inputs": [{"name": "chipAmount", "type": "uint256"}],
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view"
    }
  ]
}

// Blackjack Configuration
export const BLACKJACK_CONFIG = {
  abi: [
    // === GAME FUNCTIONS ===
    {
      "type": "function",
      "name": "startGame",
      "inputs": [{"name": "betAmount", "type": "uint88"}],
      "outputs": [],
      "stateMutability": "nonpayable"
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

// Game Flags
export const GAME_FLAGS = {
  ACTIVE: 0,
  PLAYER_STOOD: 1,
  DEALER_DONE: 2
}

// Helper functions
export const isFlagSet = (flags, bit) => {
  return (flags & (1 << bit)) !== 0
}

export const formatCard = (cardIndex) => {
  const suits = ['♠️', '♥️', '♦️', '♣️']
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  
  const suit = suits[Math.floor(cardIndex / 13)]
  const rank = ranks[cardIndex % 13]
  
  return { rank, suit, display: `${rank}${suit}`, index: cardIndex }
}

// Dice Game Configuration
export const DICE_CONFIG = {
  abi: [
    {
      "type": "function",
      "name": "placeBet",
      "inputs": [
        {"name": "_betType", "type": "uint8"},
        {"name": "_targetNumber", "type": "uint8"},
        {"name": "_betAmount", "type": "uint88"}
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "claimWinnings",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getActiveBet",
      "inputs": [{"name": "player", "type": "address"}],
      "outputs": [
        {"name": "betAmount", "type": "uint88"},
        {"name": "betType", "type": "uint8"},
        {"name": "targetNumber", "type": "uint8"},
        {"name": "requestId", "type": "uint256"},
        {"name": "isResolved", "type": "bool"},
        {"name": "rolledNumber", "type": "uint8"},
        {"name": "payout", "type": "uint88"}
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hasActiveBet",
      "inputs": [{"name": "player", "type": "address"}],
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "checkWin",
      "inputs": [
        {"name": "betType", "type": "uint8"},
        {"name": "targetNumber", "type": "uint8"},
        {"name": "rolledNumber", "type": "uint8"}
      ],
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "calculatePayout",
      "inputs": [
        {"name": "betType", "type": "uint8"},
        {"name": "targetNumber", "type": "uint8"},
        {"name": "betAmount", "type": "uint88"}
      ],
      "outputs": [{"name": "", "type": "uint88"}],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getProbability",
      "inputs": [
        {"name": "betType", "type": "uint8"},
        {"name": "targetNumber", "type": "uint8"}
      ],
      "outputs": [
        {"name": "numerator", "type": "uint8"},
        {"name": "denominator", "type": "uint8"}
      ],
      "stateMutability": "pure"
    },
    {
      "type": "event",
      "name": "BetPlaced",
      "inputs": [
        {"name": "player", "type": "address", "indexed": true},
        {"name": "betType", "type": "uint8", "indexed": false},
        {"name": "targetNumber", "type": "uint8", "indexed": false},
        {"name": "betAmount", "type": "uint88", "indexed": false}
      ]
    },
    {
      "type": "event",
      "name": "DiceRolled",
      "inputs": [
        {"name": "player", "type": "address", "indexed": true},
        {"name": "rolledNumber", "type": "uint8", "indexed": false},
        {"name": "payout", "type": "uint88", "indexed": false},
        {"name": "won", "type": "bool", "indexed": false}
      ]
    }
  ]
}

// ETH address for cashout
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'