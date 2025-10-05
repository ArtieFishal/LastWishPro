'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStore } from '@/lib/store';

const schema = z.object({
  fullName: z.string().min(2),
  primaryWallet: z.string().optional(),
  specialInstructions: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Onboarding() {
  const { state, setOwner } = useStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema), 
    defaultValues: state.owner 
  });

  const onSubmit = (data: FormData) => {
    setOwner(data);
    // Redirect to wallets page after saving
    window.location.href = '/wallets';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Owner Profile</h1>
      <form className="grid gap-3 max-w-xl" onSubmit={handleSubmit(onSubmit)}>
        <label className="grid gap-1">
          <span>Full Legal Name *</span>
          <input 
            className="border rounded px-3 py-2" 
            {...register('fullName')} 
          />
          {errors.fullName && <em className="text-red-600 text-sm">Required</em>}
        </label>
        
        <label className="grid gap-1">
          <span>Primary Wallet Address</span>
          <input 
            className="border rounded px-3 py-2"
            {...register('primaryWallet')} 
            placeholder="0x... or name.eth"
          />
        </label>
        
        <label className="grid gap-1">
          <span>Special Instructions (optional)</span>
          <textarea 
            className="border rounded px-3 py-2" 
            rows={4}
            {...register('specialInstructions')} 
            placeholder="Any special instructions for your digital assets..."
          />
        </label>
        
        <button 
          type="submit"
          className="mt-2 px-4 py-2 rounded-xl border w-max bg-blue-600 text-white hover:bg-blue-700"
        >
          Save & Continue
        </button>
      </form>
    </div>
  );
}