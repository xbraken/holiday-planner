/**
 * Vercel Serverless Function - SerpAPI proxy for Google Flights.
 *
 * Replaces the local Express server (server.js) for production.
 * The SerpAPI key is read from the SERPAPI_KEY environment variable
 * configured in Vercel project settings.
 */

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SERPAPI_KEY environment variable not set' });
  }

  try {
    const { departure_id, arrival_id, outbound_date, currency, type } = req.query;

    if (!departure_id || !arrival_id || !outbound_date) {
      return res.status(400).json({
        error: 'Missing required params: departure_id, arrival_id, outbound_date',
      });
    }

    const params = new URLSearchParams({
      engine: 'google_flights',
      departure_id,
      arrival_id,
      outbound_date,
      currency: currency || 'EUR',
      hl: 'en',
      gl: 'uk',
      type: type || '2',
      api_key: apiKey,
    });

    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!response.ok) {
      const text = await response.text();
      console.error('SerpAPI error:', response.status, text);
      return res.status(response.status).json({
        error: `SerpAPI error: ${response.status}`,
        details: text,
      });
    }

    const data = await response.json();

    // Cache for 1 hour on Vercel edge
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
