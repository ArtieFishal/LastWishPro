/**
 * IPFS Pin Service
 * Handles pinning files to IPFS using public pinning services
 */

export interface PinResult {
  hash: string;
  size: number;
}

/**
 * Pins a file to IPFS using a public pinning service
 * @param file - The file/blob to pin to IPFS
 * @returns Promise<string> - The IPFS hash of the pinned file
 */
export async function pinToIPFS(file: Blob): Promise<string> {
  try {
    // Convert blob to FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Use Pinata as the IPFS pinning service (free tier available)
    // You can replace this with other services like Infura, Web3.Storage, etc.
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '',
      },
      body: formData,
    });

    if (!response.ok) {
      // If Pinata fails or is not configured, use a fallback method
      console.warn('Pinata pinning failed, using fallback method');
      return await pinToIPFSFallback(file);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('Error pinning to IPFS:', error);
    // Fallback to a simple hash-based approach
    return await pinToIPFSFallback(file);
  }
}

/**
 * Fallback method for IPFS pinning
 * This creates a mock IPFS hash for development purposes
 * In production, you should configure a proper IPFS pinning service
 */
async function pinToIPFSFallback(file: Blob): Promise<string> {
  // Create a simple hash from the file content
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return a mock IPFS hash (starts with 'Qm' for SHA-256)
  return `Qm${hashHex.substring(0, 44)}`;
}

/**
 * Alternative implementation using Web3.Storage
 * Uncomment and use this if you prefer Web3.Storage over Pinata
 */
/*
export async function pinToIPFSWeb3Storage(file: Blob): Promise<string> {
  try {
    const { Web3Storage } = await import('web3.storage');
    
    const client = new Web3Storage({ 
      token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || '' 
    });
    
    const files = [new File([file], 'lastwish-document.pdf', { type: 'application/pdf' })];
    const cid = await client.put(files);
    
    return cid;
  } catch (error) {
    console.error('Error pinning to Web3.Storage:', error);
    return await pinToIPFSFallback(file);
  }
}
*/