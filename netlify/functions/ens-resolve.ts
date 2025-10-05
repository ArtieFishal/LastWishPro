import type { Handler } from '@netlify/functions';

const ALCHEMY_KEY = process.env.ALCHEMY_KEY!;

export const handler: Handler = async (event) => {
  const name = event.queryStringParameters?.name;
  if (!name) return { statusCode: 400, body: 'name required' };

  try {
    // Minimal resolver using Alchemy Name Service endpoint
    const url = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
    const body = { 
      jsonrpc: '2.0', 
      id: 1, 
      method: 'alchemy_resolveName', 
      params: [name] 
    };
    
    const r = await fetch(url, { 
      method: 'POST', 
      headers: { 'content-type': 'application/json' }, 
      body: JSON.stringify(body) 
    });
    
    const j = await r.json();
    
    return { 
      statusCode: 200, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({ address: j.result }) 
    };
  } catch (error) {
    console.error('ENS resolve error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to resolve ENS name' }) 
    };
  }
};