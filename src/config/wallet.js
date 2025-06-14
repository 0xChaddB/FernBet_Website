import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'

// Configuration Coinbase Smart Wallet
export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'FernBet Casino',
      appLogoUrl: 'https://your-domain.com/logo.png',
      preference: 'smartWalletOnly',
      version: '4'
    })
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http()
  }
})

// Configuration temporaire du contrat
export const BLACKJACK_CONFIG = {
  address: '0x1234567890123456789012345678901234567890',
  abi: [
    'function startGame() external payable',
    'function hit() external',
    'function stand() external',
    'function resolveGame() external'
  ]
}