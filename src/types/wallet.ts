export interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  balance: number | null;
  error: string | null;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  contractAddress: string;
  pumpFunUrl: string;
  imageUrl: string;
  referenceWallet: string;
}

export const VYBBI_TOKEN: TokenInfo = {
  name: 'Vybbi',
  symbol: '$VYBC',
  contractAddress: '4nbNqewWMWwCAYhPjXTaSyrdqcX3M3dUQ9TZhphrwyRy',
  pumpFunUrl: 'https://pump.fun/coin/4nbNqewWMWwCAYhPjXTaSyrdqcX3M3dUQ9TZhphrwyRy',
  imageUrl: 'https://images.pump.fun/coin-image/4nbNqewWMWwCAYhPjXTaSyrdqcX3M3dUQ9TZhphrwyRy?variant=86x86&ipfs=bafybeig6vl2dowwc6ndzfxqcdwlumutlxpwsg5zyijacan7habuugpmtem&src=https%3A%2F%2Fipfs.io%2Fipfs%2Fbafybeig6vl2dowwc6ndzfxqcdwlumutlxpwsg5zyijacan7habuugpmtem',
  referenceWallet: 'HZdPNvHpBArQ4FZ5xkoQntFPAJL3TQg5Mud7Zcdfzso3'
};