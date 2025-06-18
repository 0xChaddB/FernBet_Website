import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

// Direct configuration without RainbowKit to avoid Project ID issues
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(), // MetaMask and other injected wallets
    coinbaseWallet({
      appName: 'FernBet Casino',
      preference: 'all', // Support both smart wallet and extension
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});