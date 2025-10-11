'use client';

import dynamic from 'next/dynamic';
import { MultiChainWalletProvider } from '../../MultiChainWalletProvider';

// Dynamically import to avoid SSR issues with wallet libraries
const LastWishMobile = dynamic(() => import('../../components/LastWishMobile'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  )
});

export default function LastWishPage() {
  return (
    <MultiChainWalletProvider>
      <LastWishMobile />
    </MultiChainWalletProvider>
  );
}