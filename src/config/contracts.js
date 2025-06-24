// Contract addresses - DEPLOYED 2025-01-24
export const CONTRACT_ADDRESSES = {
  // Base Sepolia addresses
  'base-sepolia': {
    casinoChip: '0x38969f932c5830787B68676Edd6105534c3e60e0',
    casinoBank: '0x540A3e89E545C799976B0BC2e251f86CF74635c5',
    blackjack: '0x3FE6193Df773da1E196825E0eF07FF6e4f2D05Ac',
    dice: '0xd52431c66609F91bd8469c17dE58802155eD610c',
    roulette: '0xD5dB54C31d7e1b9E9b73093aeB4735907517D0cc',
    slots: '0xAa212E289314D7192C225307ed7086B6d22De4Cf',
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
        {"name": "isActive", "type": "bool"},
        {"name": "playerStood", "type": "bool"},
        {"name": "dealerDone", "type": "bool"}
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