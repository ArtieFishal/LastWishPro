import type { Handler } from '@netlify/functions';

const COVALENT_KEY = process.env.COVALENT_KEY!;

export const handler: Handler = async (event) => {
  const address = event.queryStringParameters?.address;
  if (!address) return { statusCode: 400, body: 'address required' };

  try {
    const url = `https://api.covalenthq.com/v1/eth-mainnet/address/${address}/balances_v2/?nft=true&key=${COVALENT_KEY}`;
    const r = await fetch(url);
    const j = await r.json();
    
    const tokens = (j.data?.items || [])
      .filter((x: any) => x.type === 'cryptocurrency')
      .map((x: any) => ({
        chainId: 1, 
        address: x.contract_address, 
        symbol: x.contract_ticker_symbol,
        decimals: x.contract_decimals, 
        balance: x.balance,
        name: x.contract_name,
        valueUsd: x.quote
      }));
      
    const nfts = (j.data?.items || [])
      .filter((x: any) => x.type === 'nft')
      .flatMap((x: any) => 
        (x.nft_data || []).map((n: any) => ({
          chainId: 1, 
          contract: x.contract_address, 
          tokenId: n.token_id, 
          collection: x.contract_name,
          name: n.external_data?.name,
          image: n.external_data?.image_256
        }))
      );
      
    return { 
      statusCode: 200, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({ tokens, nfts }) 
    };
  } catch (error) {
    console.error('Assets fetch error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to fetch assets' }) 
    };
  }
};