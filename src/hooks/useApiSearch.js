/**
 * SerpAPI Google Flights integration via proxy.
 * In dev: Vite proxies /api → localhost:3001.
 * In prod: Vercel serverless function at /api/flights.
 */

import { useState, useCallback } from 'react';

const PROXY_URL = '';

export const AIRPORTS = [
  { code: 'DUB', name: 'Dublin', country: 'Ireland' },
  { code: 'LHR', name: 'London Heathrow', country: 'UK' },
  { code: 'STN', name: 'London Stansted', country: 'UK' },
  { code: 'MAN', name: 'Manchester', country: 'UK' },
  { code: 'BHX', name: 'Birmingham', country: 'UK' },
  { code: 'EDI', name: 'Edinburgh', country: 'UK' },
  { code: 'BFS', name: 'Belfast', country: 'UK' },
  { code: 'SNN', name: 'Shannon', country: 'Ireland' },
  { code: 'ORK', name: 'Cork', country: 'Ireland' },
  { code: 'KNO', name: 'Knock', country: 'Ireland' },
];

export const DESTINATIONS = [
  { city: 'Barcelona', country: 'Spain', code: 'BCN' },
  { city: 'Madrid', country: 'Spain', code: 'MAD' },
  { city: 'Malaga', country: 'Spain', code: 'AGP' },
  { city: 'Alicante', country: 'Spain', code: 'ALC' },
  { city: 'Palma de Mallorca', country: 'Spain', code: 'PMI' },
  { city: 'Ibiza', country: 'Spain', code: 'IBZ' },
  { city: 'Tenerife', country: 'Spain', code: 'TFS' },
  { city: 'Lanzarote', country: 'Spain', code: 'ACE' },
  { city: 'Gran Canaria', country: 'Spain', code: 'LPA' },
  { city: 'Fuerteventura', country: 'Spain', code: 'FUE' },
  { city: 'Menorca', country: 'Spain', code: 'MAH' },
  { city: 'Faro', country: 'Portugal', code: 'FAO' },
  { city: 'Lisbon', country: 'Portugal', code: 'LIS' },
  { city: 'Porto', country: 'Portugal', code: 'OPO' },
  { city: 'Rome', country: 'Italy', code: 'FCO' },
  { city: 'Milan', country: 'Italy', code: 'MXP' },
  { city: 'Naples', country: 'Italy', code: 'NAP' },
  { city: 'Venice', country: 'Italy', code: 'VCE' },
  { city: 'Paris', country: 'France', code: 'CDG' },
  { city: 'Nice', country: 'France', code: 'NCE' },
  { city: 'Amsterdam', country: 'Netherlands', code: 'AMS' },
  { city: 'Berlin', country: 'Germany', code: 'BER' },
  { city: 'Munich', country: 'Germany', code: 'MUC' },
  { city: 'Prague', country: 'Czech Republic', code: 'PRG' },
  { city: 'Vienna', country: 'Austria', code: 'VIE' },
  { city: 'Budapest', country: 'Hungary', code: 'BUD' },
  { city: 'Krakow', country: 'Poland', code: 'KRK' },
  { city: 'Warsaw', country: 'Poland', code: 'WAW' },
  { city: 'Gdansk', country: 'Poland', code: 'GDN' },
  { city: 'Wroclaw', country: 'Poland', code: 'WRO' },
  { city: 'Athens', country: 'Greece', code: 'ATH' },
  { city: 'Rhodes', country: 'Greece', code: 'RHO' },
  { city: 'Corfu', country: 'Greece', code: 'CFU' },
  { city: 'Crete', country: 'Greece', code: 'HER' },
  { city: 'Santorini', country: 'Greece', code: 'JTR' },
  { city: 'Dubrovnik', country: 'Croatia', code: 'DBV' },
  { city: 'Split', country: 'Croatia', code: 'SPU' },
  { city: 'Zagreb', country: 'Croatia', code: 'ZAG' },
  { city: 'Istanbul', country: 'Turkey', code: 'IST' },
  { city: 'Antalya', country: 'Turkey', code: 'AYT' },
  { city: 'Bodrum', country: 'Turkey', code: 'BJV' },
  { city: 'Marrakech', country: 'Morocco', code: 'RAK' },
  { city: 'Copenhagen', country: 'Denmark', code: 'CPH' },
  { city: 'Stockholm', country: 'Sweden', code: 'ARN' },
  { city: 'Oslo', country: 'Norway', code: 'OSL' },
  { city: 'Helsinki', country: 'Finland', code: 'HEL' },
  { city: 'Reykjavik', country: 'Iceland', code: 'KEF' },
  { city: 'Riga', country: 'Latvia', code: 'RIX' },
  { city: 'Tallinn', country: 'Estonia', code: 'TLL' },
  { city: 'Vilnius', country: 'Lithuania', code: 'VNO' },
  { city: 'Malta', country: 'Malta', code: 'MLA' },
  { city: 'Larnaca', country: 'Cyprus', code: 'LCA' },
  { city: 'Paphos', country: 'Cyprus', code: 'PFO' },
  { city: 'Sofia', country: 'Bulgaria', code: 'SOF' },
  { city: 'Bucharest', country: 'Romania', code: 'OTP' },
  { city: 'Belgrade', country: 'Serbia', code: 'BEG' },
  { city: 'Ljubljana', country: 'Slovenia', code: 'LJU' },
  { city: 'Bratislava', country: 'Slovakia', code: 'BTS' },
  { city: 'Dubai', country: 'UAE', code: 'DXB' },
  { city: 'New York', country: 'USA', code: 'JFK' },
  { city: 'Miami', country: 'USA', code: 'MIA' },
  { city: 'Los Angeles', country: 'USA', code: 'LAX' },
  { city: 'Cancun', country: 'Mexico', code: 'CUN' },
  { city: 'Bangkok', country: 'Thailand', code: 'BKK' },
  { city: 'Bali', country: 'Indonesia', code: 'DPS' },
  { city: 'Tokyo', country: 'Japan', code: 'NRT' },
  { city: 'London', country: 'UK', code: 'LHR' },
  { city: 'Edinburgh', country: 'UK', code: 'EDI' },
];

export function resolveAirportCode(destination) {
  const lower = destination.toLowerCase().trim();
  const match = DESTINATIONS.find(
    (d) => d.city.toLowerCase() === lower || d.code.toLowerCase() === lower
  );
  if (match) return match.code;
  const partial = DESTINATIONS.find(
    (d) => d.city.toLowerCase().includes(lower) || lower.includes(d.city.toLowerCase())
  );
  if (partial) return partial.code;
  if (/^[A-Z]{3}$/i.test(destination.trim())) return destination.trim().toUpperCase();
  return null;
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function extractTime(dateTimeStr) {
  if (!dateTimeStr) return '';
  const parts = dateTimeStr.split(' ');
  return parts.length > 1 ? parts[1] : dateTimeStr;
}

export function parseFlightOption(option, index = 0) {
  const legs = option.flights || [];
  const firstLeg = legs[0] || {};
  const lastLeg = legs[legs.length - 1] || {};
  const layovers = option.layovers || [];

  const flightLegs = legs.map((leg) => ({
    airline: leg.airline || '',
    airlineLogo: leg.airline_logo || '',
    flightNumber: leg.flight_number || '',
    departure: {
      airport: leg.departure_airport?.name || '',
      code: leg.departure_airport?.id || '',
      time: extractTime(leg.departure_airport?.time),
    },
    arrival: {
      airport: leg.arrival_airport?.name || '',
      code: leg.arrival_airport?.id || '',
      time: extractTime(leg.arrival_airport?.time),
    },
    duration: formatDuration(leg.duration || 0),
    durationMin: leg.duration || 0,
    airplane: leg.airplane || '',
    legroom: leg.legroom || '',
    oftenDelayed: leg.often_delayed_by_over_30_min || false,
  }));

  const layoverDetails = layovers.map((l) => ({
    airport: l.name || '',
    code: l.id || '',
    duration: formatDuration(l.duration || 0),
    durationMin: l.duration || 0,
    overnight: l.overnight || false,
  }));

  return {
    id: `fl_${index}`,
    legs: flightLegs,
    layovers: layoverDetails,
    totalDuration: formatDuration(option.total_duration || 0),
    totalDurationMin: option.total_duration || 0,
    price: option.price || 0,
    stops: layovers.length,
    mainAirline: firstLeg.airline || 'Unknown',
    airlineLogo: option.airline_logo || firstLeg.airline_logo || '',
    departureTime: extractTime(firstLeg.departure_airport?.time),
    departureCode: firstLeg.departure_airport?.id || '',
    arrivalTime: extractTime(lastLeg.arrival_airport?.time),
    arrivalCode: lastLeg.arrival_airport?.id || '',
    extensions: option.extensions || [],
    bookingToken: option.booking_token || '',
  };
}

export async function fetchFlights(departureCode, arrivalCode, date, currency) {
  const params = new URLSearchParams({
    departure_id: departureCode,
    arrival_id: arrivalCode,
    outbound_date: date,
    currency: currency,
    type: '2',
  });

  const response = await fetch(`${PROXY_URL}/api/flights?${params}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Server returned ${response.status}`);
  }
  return response.json();
}

export async function searchFlightsOneWay(departureCode, arrivalCode, date, currency) {
  const data = await fetchFlights(departureCode, arrivalCode, date, currency);
  const bestFlights = data.best_flights || [];
  const otherFlights = data.other_flights || [];
  const allRaw = [...bestFlights, ...otherFlights];
  const bestPrices = new Set(bestFlights.map((f) => f.price));

  const flights = allRaw.map((f, i) => ({
    ...parseFlightOption(f, i),
    isBestFlight: bestPrices.has(f.price),
  }));

  return {
    flights,
    priceInsights: data.price_insights || null,
    googleFlightsUrl: data.search_metadata?.google_flights_url || '',
  };
}

export function buildCacheKey(from, to, date) {
  return `${from}_${to}_${date}`;
}

export function useApiSearch() {
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const searchOneWay = useCallback(async (departureCode, arrivalCode, date, currency) => {
    setSearching(true);
    setError(null);
    try {
      const result = await searchFlightsOneWay(departureCode, arrivalCode, date, currency);
      setSearching(false);
      return result;
    } catch (err) {
      setError(err.message);
      setSearching(false);
      return { flights: [], priceInsights: null, googleFlightsUrl: '' };
    }
  }, []);

  return { searchOneWay, searching, error, setError };
}
