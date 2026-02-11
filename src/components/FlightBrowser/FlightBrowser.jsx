import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plane,
  Loader2,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { searchFlightsOneWay, buildCacheKey } from '../../hooks/useApiSearch';
import { cs } from '../../utils/currency';
import FlightFilters from './FlightFilters';
import FlightList from './FlightList';
import SelectionBar from './SelectionBar';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function buildFlightSummary(flight) {
  return {
    airline: flight.mainAirline,
    airlineLogo: flight.airlineLogo,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    departureCode: flight.departureCode,
    arrivalCode: flight.arrivalCode,
    duration: flight.totalDuration,
    stops: flight.stops,
    price: flight.price,
    legs: flight.legs,
    layovers: flight.layovers,
    extensions: flight.extensions,
  };
}

export default function FlightBrowser({
  origin,
  destination,
  inboundDestination,
  outboundDate,
  returnDate,
  currency,
  getCachedFlights,
  cacheFlights,
  onClose,
  onConfirm,
}) {
  const [step, setStep] = useState('outbound');
  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [outboundMeta, setOutboundMeta] = useState({});
  const [returnMeta, setReturnMeta] = useState({});
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ sortBy: 'price', maxStops: null });

  const departureCode = origin.code;
  const arrivalCode = destination.code;
  const inboundDestCode = inboundDestination.code;
  const cur = currency || 'EUR';

  const outboundCacheKey = buildCacheKey(departureCode, arrivalCode, outboundDate);
  const returnCacheKey = buildCacheKey(arrivalCode, inboundDestCode, returnDate);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        let obData = getCachedFlights(outboundCacheKey);
        if (!obData) {
          obData = await searchFlightsOneWay(departureCode, arrivalCode, outboundDate, cur);
          if (!cancelled) cacheFlights(outboundCacheKey, obData);
        }

        let retData = getCachedFlights(returnCacheKey);
        if (!retData) {
          retData = await searchFlightsOneWay(arrivalCode, inboundDestCode, returnDate, cur);
          if (!cancelled) cacheFlights(returnCacheKey, retData);
        }

        if (!cancelled) {
          setOutboundFlights(obData.flights || []);
          setOutboundMeta({ priceInsights: obData.priceInsights, googleFlightsUrl: obData.googleFlightsUrl });
          setReturnFlights(retData.flights || []);
          setReturnMeta({ priceInsights: retData.priceInsights, googleFlightsUrl: retData.googleFlightsUrl });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [departureCode, arrivalCode, inboundDestCode, outboundDate, returnDate, cur]);

  const handleConfirm = useCallback(() => {
    if (!selectedOutbound || !selectedReturn) return;

    onConfirm({
      outbound: {
        flightId: selectedOutbound.id,
        cacheKey: outboundCacheKey,
        date: outboundDate,
        summary: buildFlightSummary(selectedOutbound),
      },
      inbound: {
        flightId: selectedReturn.id,
        cacheKey: returnCacheKey,
        date: returnDate,
        summary: buildFlightSummary(selectedReturn),
      },
    });
  }, [selectedOutbound, selectedReturn, outboundCacheKey, returnCacheKey, outboundDate, returnDate, onConfirm]);

  const sym = cs(cur);
  const currentFlights = step === 'outbound' ? outboundFlights : returnFlights;
  const currentMeta = step === 'outbound' ? outboundMeta : returnMeta;
  const currentDate = step === 'outbound' ? outboundDate : returnDate;
  const currentSelected = step === 'outbound' ? selectedOutbound : selectedReturn;

  const outboundRoute = `${departureCode} \u2192 ${arrivalCode}`;
  const inboundRoute = `${arrivalCode} \u2192 ${inboundDestCode}`;
  const currentRoute = step === 'outbound' ? outboundRoute : inboundRoute;

  const stepLabel = step === 'outbound'
    ? `Flight to ${destination.name}`
    : `Flight to ${inboundDestination.name}`;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-gray-50 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={step === 'return' ? () => setStep('outbound') : onClose}
              className="shrink-0 p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-800 truncate">
                {destination.name}
                <span className="text-gray-400 font-normal ml-2 text-sm">{currentRoute}</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(currentDate)}</span>
                <span className="text-gray-300">|</span>
                <Plane className={`w-3 h-3 ${step === 'return' ? 'rotate-180' : ''}`} />
                <span className="font-medium text-blue-600">{stepLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <div className={`flex-1 h-1 rounded-full bg-blue-500`} />
            <div className={`flex-1 h-1 rounded-full ${step === 'return' ? 'bg-blue-500' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>

      {/* Selected outbound context bar */}
      {step === 'return' && selectedOutbound && (
        <div className="bg-blue-50 border-b border-blue-100 shrink-0">
          <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2">
            <Plane className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-xs text-blue-700">
              {outboundRoute}: {selectedOutbound.mainAirline} {selectedOutbound.departureTime}
              {' \u2192 '}{selectedOutbound.arrivalTime}
              <span className="font-semibold ml-1">{sym}{selectedOutbound.price}</span>
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      {!loading && !error && (
        <div className="bg-white border-b border-gray-100 shrink-0">
          <div className="max-w-2xl mx-auto py-2.5 sm:px-4">
            <FlightFilters filters={filters} onChange={setFilters} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-2xl mx-auto py-3 sm:px-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">Searching flights...</p>
              <p className="text-xs text-gray-400">Finding options via Google Flights</p>
            </div>
          ) : error ? (
            <div className="mx-4 sm:mx-0 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : (
            <FlightList
              flights={currentFlights}
              filters={filters}
              currency={cur}
              selectedId={currentSelected?.id}
              onSelect={(flight) => {
                if (step === 'outbound') {
                  setSelectedOutbound(flight);
                } else {
                  setSelectedReturn(flight);
                }
              }}
            />
          )}

          {currentMeta.googleFlightsUrl && !loading && (
            <div className="px-4 sm:px-0 mt-4">
              <a
                href={currentMeta.googleFlightsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Google Flights
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Bottom selection bar */}
      <SelectionBar
        step={step}
        selectedOutbound={selectedOutbound}
        selectedReturn={selectedReturn}
        currency={cur}
        onNextStep={() => {
          setStep('return');
          setFilters({ sortBy: 'price', maxStops: null });
        }}
        onConfirm={handleConfirm}
      />
    </motion.div>
  );
}
