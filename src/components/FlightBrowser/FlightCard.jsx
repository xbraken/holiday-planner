import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cs } from '../../utils/currency';
import FlightLeg from '../shared/FlightLeg';
import LayoverBadge from '../shared/LayoverBadge';

export default function FlightCard({ flight, currency, selected, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const sym = cs(currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border transition-all ${
        selected
          ? 'border-blue-400 ring-2 ring-blue-200 shadow-sm'
          : 'border-gray-150 hover:border-gray-300'
      }`}
    >
      {/* Main row - tap to select */}
      <button
        onClick={onSelect}
        className="w-full text-left p-3 sm:p-4"
      >
        <div className="flex items-center gap-3">
          {/* Airline logo */}
          {flight.airlineLogo && (
            <img
              src={flight.airlineLogo}
              alt={flight.mainAirline}
              className="w-8 h-8 rounded shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}

          {/* Times + route */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-800">{flight.departureTime}</span>
              <ArrowRight className="w-3 h-3 text-gray-300" />
              <span className="text-sm font-bold text-gray-800">{flight.arrivalTime}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{flight.mainAirline}</span>
              <span className="text-[11px] text-gray-400">
                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </span>
              <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {flight.totalDuration}
              </span>
            </div>
          </div>

          {/* Price + select indicator */}
          <div className="text-right shrink-0 flex items-center gap-2">
            <div>
              <p className="text-base font-bold text-green-600">{sym}{flight.price}</p>
              <p className="text-[10px] text-gray-400">per person</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
            }`}>
              {selected && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {flight.isBestFlight && (
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" />
              Best flight
            </span>
          )}
          {flight.extensions?.slice(0, 3).map((ext, i) => (
            <span key={i} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {ext}
            </span>
          ))}
        </div>
      </button>

      {/* Expand toggle */}
      {flight.legs?.length > 0 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] text-blue-600 hover:bg-blue-50/50 border-t border-gray-100 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide details' : 'Show details'}
          </button>

          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="px-3 sm:px-4 pb-3 space-y-1 border-t border-gray-50"
            >
              {flight.legs.map((leg, i) => (
                <div key={i}>
                  <FlightLeg leg={leg} />
                  {i < flight.legs.length - 1 && flight.layovers?.[i] && (
                    <LayoverBadge layover={flight.layovers[i]} />
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
