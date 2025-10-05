import type { Handler } from '@netlify/functions';

const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY!;
const RECEIVER = (process.env.PAYMENT_RECEIVER || '').toLowerCase();

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  const { txHash } = JSON.parse(event.body || '{}');
  if (!txHash) return { statusCode: 400, body: 'txHash required' };

  try {
    const url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${ETHERSCAN_KEY}`;
    const r = await fetch(url);
    const j = await r.json();
    
    const to = (j.result?.to || '').toLowerCase();
    const ok = to === RECEIVER;
    
    return { 
      statusCode: 200, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({ 
        confirmed: !!j.result && ok, 
        to,
        blockNumber: j.result?.blockNumber
      }) 
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to verify payment' }) 
    };
  }
};