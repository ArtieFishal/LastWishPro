// Netlify Function (CommonJS): moralis-proxy.js
// Routes: health, erc20, nfts, resolveEns, reverseEns
exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const route = params.route;
    if (route === "health") {
      return { statusCode: 200, body: JSON.stringify({ ok: true, note: "Functions are working" }) };
    }

    const key = process.env.MORALIS_API_KEY;
    if (!key) return { statusCode: 500, body: JSON.stringify({ error: "MORALIS_API_KEY not set" }) };
    const headers = { "X-API-Key": key, "Accept": "application/json" };

    let url = null;
    if (route === "erc20") {
      const address = params.address;
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return { statusCode: 400, body: JSON.stringify({ error: "Invalid address" }) };
      url = `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=eth`;
    } else if (route === "nfts") {
      const address = params.address;
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return { statusCode: 400, body: JSON.stringify({ error: "Invalid address" }) };
      url = `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=eth&format=decimal`;
    } else if (route === "resolveEns") {
      const name = params.name;
      if (!name || !/\.eth$/i.test(name)) return { statusCode: 400, body: JSON.stringify({ error: "Invalid ENS name" }) };
      url = `https://deep-index.moralis.io/api/v2.2/resolve/ens/${encodeURIComponent(name)}`;
    } else if (route === "reverseEns") {
      const address = params.address;
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return { statusCode: 400, body: JSON.stringify({ error: "Invalid address" }) };
      url = `https://deep-index.moralis.io/api/v2.2/resolve/${address}/reverse`;
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid route" }) };
    }

    const res = await fetch(url, { headers });
    const text = await res.text();
    return { statusCode: res.status, body: text };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || String(e) }) };
  }
};
