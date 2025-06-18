// Network configurations
export const NETWORKS = {
  // Base Sepolia (gasless with Coinbase) - ONLY SUPPORTED NETWORK
  'base-sepolia': {
    chainId: 84532,
    chainIdHex: '0x14a34',
    name: 'Base Sepolia',
    currency: 'ETH',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    contracts: {
      // Will be updated after deployment
      casinoChip: '0x0000000000000000000000000000000000000000',
      casinoBank: '0x0000000000000000000000000000000000000000',
      blackjack: '0x0000000000000000000000000000000000000000',
      dice: '0x0000000000000000000000000000000000000000',
      roulette: '0x0000000000000000000000000000000000000000',
      slots: '0x0000000000000000000000000000000000000000',
    },
    chainlink: {
      vrfCoordinator: '0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634',
      keyHash: '0x83d1b6e3388bed3d76426974512bb0d270e9542a765cd667242ea26c0cc0b730',
      priceFeedETHUSD: '0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1',
      vrfSubscriptionId: '33044594880601817352894325160789429723471484151736253683391306672267394653937'
    },
    gasless: true,
    message: '✨ Gas-free transactions with Coinbase Smart Wallet!'
  }
};

// Default network
export const DEFAULT_NETWORK = 'base-sepolia';

// Get current network from chain ID
export const getNetworkByChainId = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
};

// Get network key from chain ID
export const getNetworkKeyByChainId = (chainId) => {
  const entry = Object.entries(NETWORKS).find(([_, network]) => network.chainId === chainId);
  return entry ? entry[0] : null;
};

// Network switch helper
export const switchNetwork = async (networkKey) => {
  const network = NETWORKS[networkKey];
  if (!network) return false;

  try {
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainIdHex }],
    });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: network.chainIdHex,
            chainName: network.name,
            nativeCurrency: {
              name: network.currency,
              symbol: network.currency,
              decimals: 18,
            },
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.blockExplorer],
          }],
        });
        return true;
      } catch (addError) {
        console.error('Error adding network:', addError);
      }
    }
    console.error('Error switching network:', switchError);
  }
  return false;
};