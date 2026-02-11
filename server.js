/**
 * Simple Express proxy server for SerpAPI.
 *
 * SerpAPI does not allow direct browser (CORS) requests, so the React
 * frontend calls this local server, which forwards the request to
 * SerpAPI server-side and returns the response.
 *
 * Run with:  node server.js
 * Runs on:   http://localhost:3001
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

const SERPAPI_KEY = process.env.SERPAPI_KEY;

app.use(cors());
app.use(express.json());

// Proxy endpoint for Google Flights search
app.get('/api/flights', async (req, res) => {
  try {
    const { departure_id, arrival_id, outbound_date, currency, type } = req.query;

    if (!departure_id || !arrival_id || !outbound_date) {
      return res.status(400).json({ error: 'Missing required params: departure_id, arrival_id, outbound_date' });
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
      api_key: SERPAPI_KEY,
    });

    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!response.ok) {
      const text = await response.text();
      console.error('SerpAPI error:', response.status, text);
      return res.status(response.status).json({ error: `SerpAPI error: ${response.status}`, details: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SerpAPI proxy server running at http://localhost:${PORT}`);
  console.log(`Flight search endpoint: http://localhost:${PORT}/api/flights`);
});
