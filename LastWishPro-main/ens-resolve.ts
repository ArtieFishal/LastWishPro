import type { Handler } from '@netlify/functions';

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

  const name = event.queryStringParameters?.name;
  if (!name) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ error: 'name parameter required' })
    };
  }

  if (!ALCHEMY_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'ALCHEMY_KEY not configured' })
    };
  }

  try {
    // Use Alchemy Name Service endpoint for ENS resolution
    const url = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
    const body = {
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_resolveName',
      params: [name]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ address: data.result })
    };
  } catch (error) {
    console.error('ENS resolution error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to resolve ENS name' })
    };
  }
};

