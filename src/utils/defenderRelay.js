// OpenZeppelin Defender Relay integration for gasless transactions
import { DefenderRelaySigner, DefenderRelayProvider } from '@openzeppelin/defender-relay-client/lib/ethers';
import { ethers } from 'ethers';

// Defender Relay credentials (to be stored securely)
const DEFENDER_CONFIG = {
  apiKey: process.env.REACT_APP_DEFENDER_API_KEY || '',
  apiSecret: process.env.REACT_APP_DEFENDER_API_SECRET || '',
};

// Initialize Defender Relay
export const initializeDefenderRelay = () => {
  if (!DEFENDER_CONFIG.apiKey || !DEFENDER_CONFIG.apiSecret) {
    console.warn('Defender API credentials not configured');
    return null;
  }

  const credentials = {
    apiKey: DEFENDER_CONFIG.apiKey,
    apiSecret: DEFENDER_CONFIG.apiSecret,
  };

  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider);

  return { provider, signer };
};

// Send meta-transaction through Defender Relay
export const sendMetaTransaction = async (contractAddress, abi, functionName, args = []) => {
  const relay = initializeDefenderRelay();
  if (!relay) {
    throw new Error('Defender Relay not configured');
  }

  const { signer } = relay;

  try {
    // Create contract instance with relay signer
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Send transaction through relay
    const tx = await contract[functionName](...args);
    const receipt = await tx.wait();

    return {
      hash: receipt.transactionHash,
      success: receipt.status === 1,
      receipt
    };
  } catch (error) {
    console.error('Meta-transaction failed:', error);
    throw error;
  }
};

// Check if address is whitelisted for gasless transactions
export const isAddressWhitelisted = async (userAddress) => {
  // In production, this would check against a whitelist
  // For now, return true for all addresses
  return true;
};

// Estimate gas cost in USD
export const estimateGasCostUSD = async (gasLimit, gasPrice) => {
  // Assuming ETH price of $3000 (in production, fetch from oracle)
  const ethPriceUSD = 3000;
  const gasCostETH = (gasLimit * gasPrice) / 1e18;
  return gasCostETH * ethPriceUSD;
};