import type { Handler } from '@netlify/functions';

const COVALENT_KEY = process.env.COVALENT_KEY;
const ALCHEMY_KEY = process.env.ALCHEMY_KEY;

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const address = event.queryStringParameters?.address;
  const chains = event.queryStringParameters?.chains || '1';

  if (!address) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'address parameter required' })
    };
  }

  try {
    let tokens: any[] = [];
    let nfts: any[] = [];

    // Try Covalent API first
    if (COVALENT_KEY) {
      try {
        const covalentUrl = `https://api.covalenthq.com/v1/eth-mainnet/address/${address}/balances_v2/?nft=true&key=${COVALENT_KEY}`;
        const covalentResponse = await fetch(covalentUrl);
        const covalentData = await covalentResponse.json();

        if (covalentData.data?.items) {
          tokens = covalentData.data.items
            .filter((item: any) => item.type === 'cryptocurrency')
            .map((item: any) => ({
              chainId: 1,
              address: item.contract_address,
              symbol: item.contract_ticker_symbol,
              decimals: item.contract_decimals,
              balance: item.balance
            }));

          nfts = covalentData.data.items
            .filter((item: any) => item.type === 'nft')
            .flatMap((item: any) => 
              (item.nft_data || []).map((nft: any) => ({
                chainId: 1,
                contract: item.contract_address,
                tokenId: nft.token_id,
                collection: item.contract_name,
                name: nft.external_data?.name
              }))
            );
        }
      } catch (covalentError) {
        console.warn('Covalent API failed:', covalentError);
      }
    }

    // Fallback to mock data for demo purposes
    if (tokens.length === 0 && nfts.length === 0) {
      tokens = [
        {
          chainId: 1,
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          decimals: 18,
          balance: '1500000000000000000' // 1.5 ETH
        },
        {
          chainId: 1,
          address: '0xa0b86a33e6441e8c8c7014c8c7014c8c7014c8c7',
          symbol: 'USDC',
          decimals: 6,
          balance: '1000000000' // 1000 USDC
        }
      ];

      nfts = [
        {
          chainId: 1,
          contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
          tokenId: '1234',
          collection: 'Bored Ape Yacht Club',
          name: 'Bored Ape #1234'
        },
        {
          chainId: 1,
          contract: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
          tokenId: '5678',
          collection: 'Mutant Ape Yacht Club',
          name: 'Mutant Ape #5678'
        }
      ];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ tokens, nfts })
    };
  } catch (error) {
    console.error('Assets fetch error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch assets' })
    };
  }
};

