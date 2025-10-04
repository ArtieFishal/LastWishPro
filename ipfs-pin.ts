import type { Handler } from '@netlify/functions';

const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN;

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
    const { json: jsonData } = JSON.parse(event.body || '{}');
    
    if (!jsonData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'json data required' })
      };
    }

    if (!WEB3_STORAGE_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'WEB3_STORAGE_TOKEN not configured' })
      };
    }

    // Create a blob from the JSON data
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json'
    });

    // Upload to web3.storage
    const formData = new FormData();
    formData.append('file', blob, 'lastwish-data.json');

    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEB3_STORAGE_TOKEN}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Web3.Storage upload failed: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        cid: data.cid,
        url: `https://${data.cid}.ipfs.w3s.link/lastwish-data.json`
      })
    };
  } catch (error) {
    console.error('IPFS pin error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to pin to IPFS' })
    };
  }
};

