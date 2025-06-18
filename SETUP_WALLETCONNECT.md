# WalletConnect Project ID Setup

To enable wallet connections with MetaMask and other wallets, you need to get your own WalletConnect Project ID:

1. Go to https://cloud.walletconnect.com
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Replace the temporary ID in `src/config/wagmi.js`:

```javascript
export const config = getDefaultConfig({
  appName: 'FernBet Casino',
  projectId: 'YOUR_PROJECT_ID_HERE', // Replace with your ID
  chains: [baseSepolia],
  ssr: false,
});
```

The temporary ID will work for testing but should be replaced for production.