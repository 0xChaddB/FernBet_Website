import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'FernBet Casino',
  projectId: 'fbc5cd64e67c3797cdc09e1dd32e18e9', // Temporary ID - replace with your own from https://cloud.walletconnect.com
  chains: [baseSepolia],
  ssr: false,
});