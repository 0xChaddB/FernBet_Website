// Paymaster configuration for gasless transactions
export const PAYMASTER_CONFIG = {
  // Coinbase Paymaster endpoint for Sepolia
  coinbasePaymaster: {
    rpcUrl: 'https://api.developer.coinbase.com/rpc/v1/sepolia/paymaster',
    policyId: '', // Will be set after creating a policy
  },
  
  // OpenZeppelin Defender Relay (alternative)
  defenderRelay: {
    apiKey: '',
    apiSecret: '',
    relayerAddress: '',
  },
  
  // Sponsored transaction rules
  sponsorshipRules: {
    // Maximum gas price to sponsor (in gwei)
    maxGasPrice: 50,
    // Maximum gas limit per transaction
    maxGasLimit: 500000,
    // Allowed contracts
    allowedContracts: [
      '0x490B24a5f87EC80Ca009E029b3267c51659Cf11B', // CasinoBank
      '0x52cBc9331983B8BC9b012EEbf50e43aD4c358f46', // CasinoChip
      '0x4b8fE239BFA3d6cFb3393D72F9a6d16b0B2DCD90', // Blackjack
      '0xD3E221DfbF78fa72d9Afcad8887F6a7806b21aBC', // Dice
      '0x399F2e0b5297f77e86608aEe4c03656EA5425b6a', // Roulette
      '0xbE43673140Eb66239ee49b33FFb5Bb5f3DfaEb5C', // Slots
    ],
    // Allowed functions per contract
    allowedFunctions: {
      CasinoBank: ['claimFreeChips', 'depositETH', 'cashoutCHIP'],
      CasinoChip: ['approve', 'transfer'],
      Blackjack: ['startGame', 'hit', 'stand', 'resolveGame'],
      Dice: ['placeBet', 'claimWinnings'],
      Roulette: ['placeBet', 'spin'],
      Slots: ['spin'],
    }
  }
};

// Helper to check if a transaction should be sponsored
export const shouldSponsorTransaction = (contractAddress, functionName) => {
  const { allowedContracts, allowedFunctions } = PAYMASTER_CONFIG.sponsorshipRules;
  
  if (!allowedContracts.includes(contractAddress)) {
    return false;
  }
  
  // Find which contract type this is
  const contractType = Object.keys(allowedFunctions).find(type => 
    contractAddress === CONTRACT_ADDRESSES.sepolia[type.toLowerCase()]
  );
  
  if (!contractType) return false;
  
  return allowedFunctions[contractType].includes(functionName);
};

// Import contract addresses
import { CONTRACT_ADDRESSES } from './contracts';