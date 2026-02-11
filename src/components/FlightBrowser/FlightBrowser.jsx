import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plane,
  Loader2,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { searchFlightsOneWay, buildCacheKey, resolveAirportCode } from '../../hooks/useApiSearch';
import { cs } from '../../utils/currency';
import FlightFilters from './FlightFilters';
import FlightList from './FlightList';
import SelectionBar from './SelectionBar';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function FlightBrowser({
  destination,
  searchParams,
  currentUser,
  getCachedFlights,
  cacheFlights,
  onClose,
  onConfirm,
}) {
  const [step, setStep] = useState('outbound'); // 'outbound' | 'return'
  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [outboundMeta, setOutboundMeta] = useState({});
  const [returnMeta, setReturnMeta] = useState({});
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ sortBy: 'price', maxStops: null });

  const departureCode = searchParams.airport || 'DUB';
  const arrivalCode = resolveAirportCode(destination.city) || destination.code;
  const currency = searchParams.currency || 'EUR';
  const outboundDate = searchParams.startDate;
  const returnDate = searchParams.endDate;

  const outboundCacheKey = buildCacheKey(departureCode, arrivalCode, outboundDate);
  const returnCacheKey = buildCacheKey(arrivalCode, departureCode, returnDate);

  // Load flights on mount - check cache first
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Check outbound cache
        let obData = getCachedFlights(outboundCacheKey);
        if (!obData) {
          obData = await searchFlightsOneWay(departureCode, arrivalCode, outboundDate, currency);
          if (!cancelled) cacheFlights(outboundCacheKey, obData);
        }

        // Check return cache
        let retData = getCachedFlights(returnCacheKey);
        if (!retData) {
          retData = await searchFlightsOneWay(arrivalCode, departureCode, returnDate, currency);
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
  }, [departureCode, arrivalCode, outboundDate, returnDate, currency]);

  const handleConfirm = useCallback(() => {
    if (!selectedOutbound || !selectedReturn) return;

    onConfirm({
      outbound: {
        flightId: selectedOutbound.id,
        cacheKey: outboundCacheKey,
        date: outboundDate,
        summary: {
          airline: selectedOutbound.mainAirline,
          airlineLogo: selectedOutbound.airlineLogo,
          departureTime: selectedOutbound.departureTime,
          arrivalTime: selectedOutbound.arrivalTime,
          departureCode: selectedOutbound.departureCode,
          arrivalCode: selectedOutbound.arrivalCode,
          duration: selectedOutbound.totalDuration,
          stops: selectedOutbound.stops,
          price: selectedOutbound.price,
          legs: selectedOutbound.legs,
          layovers: selectedOutbound.layovers,
          extensions: selectedOutbound.extensions,
        },
      },
      return: {
        flightId: selectedReturn.id,
        cacheKey: returnCacheKey,
        date: returnDate,
        summary: {
          airline: selectedReturn.mainAirline,
          airlineLogo: selectedReturn.airlineLogo,
          departureTime: selectedReturn.departureTime,
          arrivalTime: selectedReturn.arrivalTime,
          departureCode: selectedReturn.departureCode,
          arrivalCode: selectedReturn.arrivalCode,
          duration: selectedReturn.totalDuration,
          stops: selectedReturn.stops,
          price: selectedReturn.price,
          legs: selectedReturn.legs,
          layovers: selectedReturn.layovers,
          extensions: selectedReturn.extensions,
        },
      },
      totalPerPerson: selectedOutbound.price + selectedReturn.price,
      googleFlightsUrl: outboundMeta.googleFlightsUrl || returnMeta.googleFlightsUrl || '',
    });
  }, [selectedOutbound, selectedReturn, outboundCacheKey, returnCacheKey, outboundDate, returnDate, outboundMeta, returnMeta, onConfirm]);

  const sym = cs(currency);
  const currentFlights = step === 'outbound' ? outboundFlights : returnFlights;
  const currentMeta = step === 'outbound' ? outboundMeta : returnMeta;
  const currentDate = step === 'outbound' ? outboundDate : returnDate;
  const currentSelected = step === 'outbound' ? selectedOutbound : selectedReturn;
  const currentRoute = step === 'outbound'
    ? `${departureCode} \u2192 ${arrivalCode}`
    : `${arrivalCode} \u2192 ${departureCode}`;

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
                {destination.city}
                <span className="text-gray-400 font-normal ml-2 text-sm">{currentRoute}</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(currentDate)}</span>
                <span className="text-gray-300">|</span>
                <Plane className={`w-3 h-3 ${step === 'return' ? 'rotate-180' : ''}`} />
                <span className="font-medium text-blue-600">
                  {step === 'outbound' ? 'Select outbound' : 'Select return'}
                </span>
              </div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mt-3">
            <div className={`flex-1 h-1 rounded-full ${step === 'outbound' ? 'bg-blue-500' : 'bg-blue-500'}`} />
            <div className={`flex-1 h-1 rounded-full ${step === 'return' ? 'bg-blue-500' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>

      {/* Selected outbound context bar (shown during return step) */}
      {step === 'return' && selectedOutbound && (
        <div className="bg-blue-50 border-b border-blue-100 shrink-0">
          <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2">
            <Plane className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-xs text-blue-700">
              Outbound: {selectedOutbound.mainAirline} {selectedOutbound.departureTime}
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
              currency={currency}
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

          {/* Google Flights link */}
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
        currency={currency}
        onNextStep={() => {
          setStep('return');
          setFilters({ sortBy: 'price', maxStops: null });
        }}
        onConfirm={handleConfirm}
      />
    </motion.div>
  );
}
