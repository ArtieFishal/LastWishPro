'use client';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';

export default function Assignments() {
  const { state, addAssignment, removeAssignment } = useStore();
  const [assignments, setAssignments] = useState<Record<string, Record<string, number>>>({});

  // Initialize assignments from store
  useEffect(() => {
    const initialAssignments: Record<string, Record<string, number>> = {};
    
    // Create assignments for all assets
    [...state.tokens, ...state.nfts].forEach(asset => {
      const assetKey = `${asset.chainId}:${'address' in asset ? asset.address : asset.contract}:${'tokenId' in asset ? asset.tokenId : 'token'}`;
      const existingAssignment = state.assignments.find(a => a.assetKey === assetKey);
      
      if (existingAssignment) {
        const assignmentMap: Record<string, number> = {};
        existingAssignment.splits.forEach(split => {
          assignmentMap[split.beneficiaryId] = split.pct;
        });
        initialAssignments[assetKey] = assignmentMap;
      } else {
        // Initialize with equal distribution
        const equalShare = state.beneficiaries.length > 0 ? 100 / state.beneficiaries.length : 0;
        const assignmentMap: Record<string, number> = {};
        state.beneficiaries.forEach(beneficiary => {
          assignmentMap[beneficiary.id] = equalShare;
        });
        initialAssignments[assetKey] = assignmentMap;
      }
    });
    
    setAssignments(initialAssignments);
  }, [state.tokens, state.nfts, state.beneficiaries, state.assignments]);

  const updateAssignment = (assetKey: string, beneficiaryId: string, percentage: number) => {
    setAssignments(prev => ({
      ...prev,
      [assetKey]: {
        ...prev[assetKey],
        [beneficiaryId]: percentage
      }
    }));
  };

  const saveAssignments = () => {
    Object.entries(assignments).forEach(([assetKey, splits]) => {
      const splitsArray = Object.entries(splits).map(([beneficiaryId, pct]) => ({
        beneficiaryId,
        pct
      }));
      
      addAssignment({
        assetKey,
        splits: splitsArray
      });
    });
    
    alert('Assignments saved successfully!');
  };

  const getTotalPercentage = (assetKey: string) => {
    return Object.values(assignments[assetKey] || {}).reduce((sum, pct) => sum + pct, 0);
  };

  const getAssetName = (asset: any) => {
    if ('symbol' in asset) {
      return `${asset.symbol} (${asset.name})`;
    } else {
      return `${asset.name || `NFT #${asset.tokenId}`} (${asset.collection})`;
    }
  };

  const allAssets = [...state.tokens, ...state.nfts];

  if (allAssets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Asset Assignments</h1>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No assets found. Please load assets first.</p>
          <a href="/assets" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Assets
          </a>
        </div>
      </div>
    );
  }

  if (state.beneficiaries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Asset Assignments</h1>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No beneficiaries found. Please add beneficiaries first.</p>
          <a href="/beneficiaries" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Beneficiaries
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Asset Assignments</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-800 mb-2">Assignment Instructions</h2>
          <p className="text-blue-700 text-sm">
            Assign percentage ownership of each asset to your beneficiaries. The total for each asset must equal 100%.
          </p>
        </div>

        <div className="space-y-6">
          {allAssets.map((asset) => {
            const assetKey = `${asset.chainId}:${'address' in asset ? asset.address : asset.contract}:${'tokenId' in asset ? asset.tokenId : 'token'}`;
            const totalPercentage = getTotalPercentage(assetKey);
            const isComplete = Math.abs(totalPercentage - 100) < 0.1;

            return (
              <div key={assetKey} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{getAssetName(asset)}</h3>
                    <p className="text-sm text-gray-600">
                      {'symbol' in asset ? `Balance: ${asset.balance} ${asset.symbol}` : `Token ID: ${asset.tokenId}`}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded text-sm font-medium ${
                    isComplete 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {totalPercentage.toFixed(1)}%
                  </div>
                </div>

                <div className="grid gap-4">
                  {state.beneficiaries.map((beneficiary) => (
                    <div key={beneficiary.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium">
                          {beneficiary.name}
                        </label>
                        <p className="text-xs text-gray-500">{beneficiary.addressOrEns}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-20 border rounded px-2 py-1 text-sm"
                          value={assignments[assetKey]?.[beneficiary.id] || 0}
                          onChange={(e) => updateAssignment(assetKey, beneficiary.id, parseFloat(e.target.value) || 0)}
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {Object.keys(assignments).every(assetKey => Math.abs(getTotalPercentage(assetKey) - 100) < 0.1) ? (
              <span className="text-green-600">✓ All assignments are complete (100%)</span>
            ) : (
              <span className="text-red-600">⚠ Some assignments are incomplete</span>
            )}
          </div>
          <div className="space-x-3">
            <button
              onClick={saveAssignments}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Assignments
            </button>
            <a
              href="/generate"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Continue to Generate →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}