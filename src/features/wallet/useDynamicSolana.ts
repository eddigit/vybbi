import { useState } from 'react';

interface SolanaLibraries {
  web3: typeof import('@solana/web3.js');
  walletAdapter: typeof import('@solana/wallet-adapter-base');
  walletAdapterReact: typeof import('@solana/wallet-adapter-react');
  walletAdapterPhantom: typeof import('@solana/wallet-adapter-phantom');
  walletAdapterReactUI: typeof import('@solana/wallet-adapter-react-ui');
}

/**
 * Hook pour charger dynamiquement les librairies Solana uniquement quand nécessaire.
 * Réduit le bundle initial de ~2-3 MB en ne chargeant Solana que sur les pages qui l'utilisent.
 */
export const useDynamicSolana = () => {
  const [solanaLib, setSolanaLib] = useState<SolanaLibraries | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSolana = async (): Promise<SolanaLibraries | null> => {
    // Si déjà chargé, retourner directement
    if (solanaLib) return solanaLib;
    
    // Si déjà en train de charger, attendre
    if (loading) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Charger tous les packages Solana en parallèle
      const [web3, walletAdapter, walletAdapterReact, walletAdapterPhantom, walletAdapterReactUI] = await Promise.all([
        import('@solana/web3.js'),
        import('@solana/wallet-adapter-base'),
        import('@solana/wallet-adapter-react'),
        import('@solana/wallet-adapter-phantom'),
        import('@solana/wallet-adapter-react-ui')
      ]);
      
      const lib: SolanaLibraries = { 
        web3, 
        walletAdapter, 
        walletAdapterReact,
        walletAdapterPhantom,
        walletAdapterReactUI
      };
      
      setSolanaLib(lib);
      return lib;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load Solana libraries');
      setError(error);
      console.error('Error loading Solana libraries:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    solanaLib, 
    loadSolana, 
    loading,
    error,
    isLoaded: !!solanaLib 
  };
};
