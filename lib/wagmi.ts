import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, goerli } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'LastWish',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [mainnet, goerli],
  ssr: false, // If your dApp uses server side rendering (SSR)
});