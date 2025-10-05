'use client';
import { useStore } from '@/lib/store';
import { useState } from 'react';

export default function Beneficiaries() {
  const { state, addBeneficiary, removeBeneficiary } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    addressOrEns: '',
    email: '',
    relationship: '',
    phoneNumber: '',
    physicalAddress: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.addressOrEns) {
      alert('Name and address are required');
      return;
    }

    addBeneficiary(formData);
    setFormData({
      name: '',
      addressOrEns: '',
      email: '',
      relationship: '',
      phoneNumber: '',
      physicalAddress: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Beneficiaries</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Beneficiary</h2>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address or ENS *</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={formData.addressOrEns}
                  onChange={(e) => handleInputChange('addressOrEns', e.target.value)}
                  placeholder="0x... or name.eth"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Relationship</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={formData.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  placeholder="e.g., Spouse, Child, Parent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full border rounded px-3 py-2"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Physical Address</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={formData.physicalAddress}
                  onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Beneficiary
            </button>
          </form>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Beneficiaries ({state.beneficiaries.length})</h2>
          {state.beneficiaries.length === 0 ? (
            <p className="text-gray-500">No beneficiaries added yet.</p>
          ) : (
            <div className="space-y-3">
              {state.beneficiaries.map((beneficiary) => (
                <div key={beneficiary.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{beneficiary.name}</h3>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                        <p><strong>Address:</strong> {beneficiary.addressOrEns}</p>
                        {beneficiary.email && <p><strong>Email:</strong> {beneficiary.email}</p>}
                        {beneficiary.relationship && <p><strong>Relationship:</strong> {beneficiary.relationship}</p>}
                        {beneficiary.phoneNumber && <p><strong>Phone:</strong> {beneficiary.phoneNumber}</p>}
                        {beneficiary.physicalAddress && <p><strong>Address:</strong> {beneficiary.physicalAddress}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeBeneficiary(beneficiary.id)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.beneficiaries.length > 0 && (
          <div className="text-center">
            <a 
              href="/assignments" 
              className="px-4 py-2 rounded-xl border bg-green-600 text-white hover:bg-green-700"
            >
              Continue to Assignments →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}