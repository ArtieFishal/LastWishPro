import type { Handler } from '@netlify/functions';

const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;
const PAYMENT_RECEIVER = process.env.PAYMENT_RECEIVER?.toLowerCase();

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { txHash } = JSON.parse(event.body || '{}');
    
    if (!txHash) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'txHash required' })
      };
    }

    if (!ETHERSCAN_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'ETHERSCAN_KEY not configured' })
      };
    }

    // Verify transaction using Etherscan API
    const url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${ETHERSCAN_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const transaction = data.result;
    if (!transaction) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          confirmed: false, 
          error: 'Transaction not found' 
        })
      };
    }

    const to = transaction.to?.toLowerCase();
    const confirmed = !!transaction && (!PAYMENT_RECEIVER || to === PAYMENT_RECEIVER);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        confirmed,
        to,
        from: transaction.from,
        value: transaction.value,
        blockNumber: transaction.blockNumber
      })
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to verify payment' })
    };
  }
};

