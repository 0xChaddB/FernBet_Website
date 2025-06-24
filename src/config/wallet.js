import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'

// Configuration Coinbase Smart Wallet - Base Sepolia only
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'FernBet Casino',
      appLogoUrl: 'https://your-domain.com/logo.png',
      preference: 'smartWalletOnly',
      version: '4',
      // Enable paymaster for gasless transactions
      capabilities: {
        paymasterService: {
          // Base Sepolia should have automatic paymaster
          [baseSepolia.id]: {
            paymasterService: true
          }
        }
      }
    })
  ],
  transports: {
    [baseSepolia.id]: http()
  }
})

