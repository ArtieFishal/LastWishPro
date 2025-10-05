'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function Assets() {
  const { state, setTokens, setNfts } = useStore();
  const [loading, setLoading] = useState(false);

  const loadAssets = async () => {
    const walletAddress = state.owner.primaryWallet || (state.wallets.length > 0 ? state.wallets[0].address : null);
    
    if (!walletAddress) {
      alert('Please set a primary wallet address in your profile or connect a wallet first.');
      return;
    }

    setLoading(true);
    try {
      // Try to fetch real assets first
      const response = await fetch(`/api/assets?address=${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens || []);
        setNfts(data.nfts || []);
      } else {
        // Fallback to mock data if API fails
        const mockTokens = [
          {
            chainId: 1,
            address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
            symbol: 'ETH',
            decimals: 18,
            balance: '2.5',
            name: 'Ethereum',
            valueUsd: 5000
          },
          {
            chainId: 1,
            address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
            symbol: 'USDC',
            decimals: 6,
            balance: '1000.0',
            name: 'USD Coin',
            valueUsd: 1000
          }
        ];

        const mockNfts = [
          {
            chainId: 1,
            contract: '0xB0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
            tokenId: '1234',
            collection: 'Cool Cats',
            name: 'Cool Cat #1234',
            image: 'https://via.placeholder.com/200x200'
          }
        ];

        setTokens(mockTokens);
        setNfts(mockNfts);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
      alert('Failed to load assets. Using demo data instead.');
      
      // Fallback to mock data
      const mockTokens = [
        {
          chainId: 1,
          address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
          symbol: 'ETH',
          decimals: 18,
          balance: '2.5',
          name: 'Ethereum',
          valueUsd: 5000
        },
        {
          chainId: 1,
          address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
          symbol: 'USDC',
          decimals: 6,
          balance: '1000.0',
          name: 'USD Coin',
          valueUsd: 1000
        }
      ];

      const mockNfts = [
        {
          chainId: 1,
          contract: '0xB0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
          tokenId: '1234',
          collection: 'Cool Cats',
          name: 'Cool Cat #1234',
          image: 'https://via.placeholder.com/200x200'
        }
      ];

      setTokens(mockTokens);
      setNfts(mockNfts);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Asset Discovery</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Load Assets</h2>
          <p className="text-gray-600 mb-4">
            Discover tokens and NFTs from your connected wallets.
          </p>
          <button 
            className="border rounded px-3 py-1 bg-blue-600 text-white hover:bg-blue-700" 
            onClick={loadAssets}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load Assets'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Tokens ({state.tokens.length})</h3>
            {state.tokens.length === 0 ? (
              <p className="text-gray-500">No tokens found. Click "Load Assets" to discover your tokens.</p>
            ) : (
              <div className="space-y-3">
                {state.tokens.map((token, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-sm text-gray-600">{token.name}</p>
                        <p className="text-sm">Balance: {token.balance}</p>
                      </div>
                      {token.valueUsd && (
                        <p className="text-sm text-green-600">${token.valueUsd.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">NFTs ({state.nfts.length})</h3>
            {state.nfts.length === 0 ? (
              <p className="text-gray-500">No NFTs found. Click "Load Assets" to discover your NFTs.</p>
            ) : (
              <div className="space-y-3">
                {state.nfts.map((nft, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex gap-3">
                      {nft.image && (
                        <img 
                          src={nft.image} 
                          alt={nft.name || 'NFT'} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{nft.name || `NFT #${nft.tokenId}`}</p>
                        <p className="text-sm text-gray-600">{nft.collection}</p>
                        <p className="text-sm">Token ID: {nft.tokenId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {(state.tokens.length > 0 || state.nfts.length > 0) && (
          <div className="text-center">
            <a 
              href="/beneficiaries" 
              className="px-4 py-2 rounded-xl border bg-green-600 text-white hover:bg-green-700"
            >
              Continue to Beneficiaries →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}