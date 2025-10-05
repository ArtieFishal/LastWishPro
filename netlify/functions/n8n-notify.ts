import type { Handler } from '@netlify/functions';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!;

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

  try {
    const payload = JSON.parse(event.body || '{}');
    
    if (N8N_WEBHOOK_URL) {
      await fetch(N8N_WEBHOOK_URL, { 
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
    }
    
    return { 
      statusCode: 202, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '' 
    };
  } catch (error) {
    console.error('N8N notification error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to send notification' }) 
    };
  }
};