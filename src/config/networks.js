// Network configurations
export const NETWORKS = {
  // Ethereum Sepolia (current deployment)
  sepolia: {
    chainId: 11155111,
    chainIdHex: '0xaa36a7',
    name: 'Sepolia',
    currency: 'ETH',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/EvG2BIcz9AA3RZGFnx21xf8RprPwFpBf',
    blockExplorer: 'https://sepolia.etherscan.io',
    contracts: {
      casinoChip: '0x52cBc9331983B8BC9b012EEbf50e43aD4c358f46',
      casinoBank: '0x490B24a5f87EC80Ca009E029b3267c51659Cf11B',
      blackjack: '0x4b8fE239BFA3d6cFb3393D72F9a6d16b0B2DCD90',
      dice: '0xD3E221DfbF78fa72d9Afcad8887F6a7806b21aBC',
      roulette: '0x399F2e0b5297f77e86608aEe4c03656EA5425b6a',
      slots: '0xbE43673140Eb66239ee49b33FFb5Bb5f3DfaEb5C',
    },
    chainlink: {
      vrfCoordinator: '0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B',
      keyHash: '0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae',
      priceFeedETHUSD: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
      vrfSubscriptionId: '103036806356572904141444650306175330773219057672506466552021010715624678697306'
    },
    gasless: false,
    message: 'Gas fees required for transactions'
  },
  
  // Base Sepolia (gasless with Coinbase)
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
      vrfSubscriptionId: '1' // To be created
    },
    gasless: true,
    message: '✨ Gas-free transactions with Coinbase Smart Wallet!'
  }
};

// Default network
export const DEFAULT_NETWORK = 'sepolia'; // Change to 'base-sepolia' after deployment

// Get current network from chain ID
export const getNetworkByChainId = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
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