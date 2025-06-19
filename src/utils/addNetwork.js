import { baseSepolia } from 'wagmi/chains';

export const addBaseSepoliaNetwork = async () => {
  if (!window.ethereum) return false;
  
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${baseSepolia.id.toString(16)}`,
        chainName: baseSepolia.name,
        nativeCurrency: {
          name: baseSepolia.nativeCurrency.name,
          symbol: baseSepolia.nativeCurrency.symbol,
          decimals: baseSepolia.nativeCurrency.decimals,
        },
        rpcUrls: [baseSepolia.rpcUrls.default.http[0]],
        blockExplorerUrls: [baseSepolia.blockExplorers.default.url],
      }],
    });
    return true;
  } catch (error) {
    console.error('Failed to add Base Sepolia network:', error);
    return false;
  }
};

export const switchToBaseSepoliaNetwork = async () => {
  if (!window.ethereum) return false;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${baseSepolia.id.toString(16)}` }],
    });
    return true;
  } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      return await addBaseSepoliaNetwork();
    }
    console.error('Failed to switch network:', error);
    return false;
  }
};