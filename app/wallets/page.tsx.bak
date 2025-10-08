'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useStore } from '@/lib/store';
import { useState } from 'react';

export default function Wallets() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { state, addWallet, removeWallet } = useStore();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      await connect({ connector: injected() });
      
      // Add wallet to store
      if (address) {
        addWallet({
          address,
          blockchain: 'ethereum',
          walletType: 'MetaMask'
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    // Remove wallet from store
    if (address) {
      const wallet = state.wallets.find(w => w.address === address);
      if (wallet) {
        removeWallet(wallet.id);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Wallet Connection</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
          <div className="flex gap-2 items-center">
            {isConnected ? (
              <>
                <div className="space-y-2">
                  <p><strong>Account:</strong> {address}</p>
                  <p><strong>Chain:</strong> {chainId}</p>
                </div>
                <button 
                  className="border rounded px-3 py-1 bg-red-600 text-white hover:bg-red-700" 
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button 
                className="border rounded px-3 py-1 bg-blue-600 text-white hover:bg-blue-700" 
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Connected Wallets ({state.wallets.length})</h2>
          {state.wallets.length === 0 ? (
            <p className="text-gray-500">No wallets connected yet.</p>
          ) : (
            <div className="space-y-3">
              {state.wallets.map((wallet) => (
                <div key={wallet.id} className="border rounded p-3 flex justify-between items-center">
                  <div>
                    <p><strong>Address:</strong> {wallet.address}</p>
                    <p><strong>Blockchain:</strong> {wallet.blockchain}</p>
                    <p><strong>Type:</strong> {wallet.walletType}</p>
                  </div>
                  <button 
                    className="text-red-600 hover:text-red-800"
                    onClick={() => removeWallet(wallet.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.wallets.length > 0 && (
          <div className="text-center">
            <a 
              href="/assets" 
              className="px-4 py-2 rounded-xl border bg-green-600 text-white hover:bg-green-700"
            >
              Continue to Assets →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}