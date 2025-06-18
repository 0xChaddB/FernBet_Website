import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { PAYMASTER_CONFIG, shouldSponsorTransaction } from '../config/paymaster';

export const usePaymaster = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isSponsoring, setIsSponsoring] = useState(false);

  // Check if Coinbase Smart Wallet is being used
  const isCoinbaseWallet = walletClient?.transport?.name === 'Coinbase Wallet';

  // Send sponsored transaction using Coinbase Paymaster
  const sendSponsoredTransaction = useCallback(async ({
    contractAddress,
    abi,
    functionName,
    args = [],
    value = 0n
  }) => {
    if (!address || !walletClient) {
      throw new Error('Wallet not connected');
    }

    // Check if transaction should be sponsored
    if (!shouldSponsorTransaction(contractAddress, functionName)) {
      throw new Error('Transaction not eligible for sponsorship');
    }

    try {
      setIsSponsoring(true);

      // Encode the function call
      const data = encodeFunctionData({
        abi,
        functionName,
        args
      });

      if (isCoinbaseWallet) {
        // Use Coinbase Smart Wallet's built-in paymaster
        const txHash = await walletClient.sendTransaction({
          to: contractAddress,
          data,
          value,
          // Coinbase Smart Wallet will automatically use paymaster if configured
          // No additional parameters needed
        });

        return txHash;
      } else {
        // Fallback to regular transaction for other wallets
        console.warn('Paymaster only supported with Coinbase Smart Wallet');
        const txHash = await walletClient.sendTransaction({
          to: contractAddress,
          data,
          value
        });

        return txHash;
      }
    } finally {
      setIsSponsoring(false);
    }
  }, [address, walletClient, isCoinbaseWallet]);

  // Enable paymaster for Coinbase Smart Wallet session
  const enablePaymaster = useCallback(async () => {
    if (!isCoinbaseWallet) {
      console.warn('Paymaster only supported with Coinbase Smart Wallet');
      return false;
    }

    try {
      // Request paymaster capability from Coinbase Smart Wallet
      const result = await window.ethereum?.request({
        method: 'wallet_requestPermissions',
        params: [{
          eth_accounts: {},
          // Request paymaster capability
          'wallet_paymaster': {
            // Specify which contracts/methods should be sponsored
            sponsorshipPolicy: {
              contracts: PAYMASTER_CONFIG.sponsorshipRules.allowedContracts,
              maxGasPrice: PAYMASTER_CONFIG.sponsorshipRules.maxGasPrice,
              maxGasLimit: PAYMASTER_CONFIG.sponsorshipRules.maxGasLimit
            }
          }
        }]
      });

      return !!result;
    } catch (error) {
      console.error('Failed to enable paymaster:', error);
      return false;
    }
  }, [isCoinbaseWallet]);

  return {
    sendSponsoredTransaction,
    enablePaymaster,
    isSponsoring,
    isCoinbaseWallet,
    isPaymasterAvailable: isCoinbaseWallet
  };
};