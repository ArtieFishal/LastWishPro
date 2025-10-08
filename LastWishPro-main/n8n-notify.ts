import type { Handler } from '@netlify/functions';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

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
    const payload = JSON.parse(event.body || '{}');
    
    if (!N8N_WEBHOOK_URL) {
      console.warn('N8N_WEBHOOK_URL not configured, skipping notification');
      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({ message: 'Notification skipped - webhook not configured' })
      };
    }

    // Send notification to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        source: 'lastwish-app',
        ...payload
      })
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status}`);
    }

    return {
      statusCode: 202,
      headers,
      body: JSON.stringify({ message: 'Notification sent successfully' })
    };
  } catch (error) {
    console.error('n8n notification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send notification' })
    };
  }
};

