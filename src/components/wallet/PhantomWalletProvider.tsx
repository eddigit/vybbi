import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletState } from '@/types/wallet';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface PhantomWalletProviderProps {
  children: ReactNode;
}

export const PhantomWalletProvider: React.FC<PhantomWalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    connecting: false,
    publicKey: null,
    balance: null,
    error: null,
  });

  const getProvider = () => {
    if ('phantom' in window) {
      const provider = (window as any).phantom?.solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    return null;
  };

  const connect = async () => {
    const provider = getProvider();
    if (!provider) {
      setWalletState(prev => ({
        ...prev,
        error: 'Phantom wallet not found. Please install Phantom browser extension.'
      }));
      return;
    }

    setWalletState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      const response = await provider.connect();
      const publicKey = response.publicKey.toString();
      
      // Get balance
      const connection = new (await import('@solana/web3.js')).Connection(
        'https://api.mainnet-beta.solana.com'
      );
      const balance = await connection.getBalance(response.publicKey);
      const solBalance = balance / 1000000000; // Convert lamports to SOL

      setWalletState({
        connected: true,
        connecting: false,
        publicKey,
        balance: solBalance,
        error: null,
      });

      // Store in localStorage for persistence
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletPublicKey', publicKey);
    } catch (error) {
      console.error('Connection error:', error);
      setWalletState(prev => ({
        ...prev,
        connecting: false,
        error: 'Failed to connect wallet. Please try again.'
      }));
    }
  };

  const disconnect = () => {
    setWalletState({
      connected: false,
      connecting: false,
      publicKey: null,
      balance: null,
      error: null,
    });
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletPublicKey');
  };

  // Auto-reconnect on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    const storedPublicKey = localStorage.getItem('walletPublicKey');
    
    if (wasConnected && storedPublicKey) {
      const provider = getProvider();
      if (provider?.isConnected) {
        setWalletState(prev => ({
          ...prev,
          connected: true,
          publicKey: storedPublicKey,
        }));
      }
    }
  }, []);

  const contextValue: WalletContextType = {
    ...walletState,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within PhantomWalletProvider');
  }
  return context;
};