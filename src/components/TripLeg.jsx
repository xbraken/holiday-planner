import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Plane,
  ArrowRight,
  Clock,
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { cs } from '../utils/currency';
import FlightLeg from './shared/FlightLeg';
import LayoverBadge from './shared/LayoverBadge';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function FlightSummary({ label, flight, routeFrom, routeTo, date, currency, isEditable, onBrowse, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const sym = cs(currency);

  if (!flight) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Plane className={`w-3 h-3 ${label === 'Return' ? 'rotate-180' : ''}`} />
          <span className="font-mono">{routeFrom}</span>
          <ArrowRight className="w-3 h-3" />
          <span className="font-mono">{routeTo}</span>
        </div>
        {isEditable && date && (
          <button
            onClick={onBrowse}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Search className="w-3 h-3" />
            Browse
          </button>
        )}
        {!date && (
          <span className="ml-auto text-[11px] text-gray-400 italic">Set dates first</span>
        )}
      </div>
    );
  }

  const s = flight.summary;
  const legs = s?.legs || [];
  const layovers = s?.layovers || [];

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 py-1.5 text-left hover:bg-gray-50/50 rounded transition-colors"
      >
        <Plane className={`w-3 h-3 text-blue-500 shrink-0 ${label === 'Return' ? 'rotate-180' : ''}`} />
        <span className="text-xs font-mono text-gray-400">{routeFrom}</span>
        <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
        <span className="text-xs font-mono text-gray-400">{routeTo}</span>
        <span className="text-xs text-gray-600 font-medium">{s?.departureTime}</span>
        <ArrowRight className="w-2.5 h-2.5 text-gray-300 shrink-0" />
        <span className="text-xs text-gray-600 font-medium">{s?.arrivalTime}</span>
        <span className="text-[11px] text-gray-400 flex items-center gap-0.5 ml-auto">
          <Clock className="w-3 h-3" />
          {s?.duration}
        </span>
        <span className="text-xs font-bold text-green-600">{sym}{s?.price || 0}</span>
        {expanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-5 pb-2 space-y-1">
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span>{s?.airline}</span>
                <span>{s?.stops === 0 ? 'Direct' : `${s?.stops} stop${s?.stops > 1 ? 's' : ''}`}</span>
              </div>

              {legs.length > 1 && (
                <div className="space-y-0.5 mt-1">
                  {legs.map((leg, i) => (
                    <div key={i}>
                      <FlightLeg leg={leg} />
                      {i < legs.length - 1 && layovers[i] && (
                        <LayoverBadge layover={layovers[i]} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isEditable && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClear(); }}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-red-500 hover:bg-red-50 rounded transition-colors mt-1"
                >
                  <X className="w-3 h-3" />
                  Change flight
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TripLeg({
  leg,
  originCode,
  originName,
  inboundDestCode,
  inboundDestName,
  currency,
  isEditable,
  isLastLeg,
  onBrowseOutbound,
  onBrowseInbound,
  onUpdateDates,
  onRemove,
  onClearFlight,
}) {
  const dest = leg.destination || {};

  return (
    <div className="relative">
      {/* Dates first */}
      <div className="flex items-center gap-2 mb-1.5">
        <Calendar className="w-3.5 h-3.5 text-blue-500" />
        {isEditable ? (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={leg.departureDate || ''}
              onChange={(e) => onUpdateDates({ departureDate: e.target.value })}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-xs">\u2192</span>
            <input
              type="date"
              value={leg.returnDate || ''}
              min={leg.departureDate || ''}
              onChange={(e) => onUpdateDates({ returnDate: e.target.value })}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <span className="text-xs text-gray-600 font-medium">
            {leg.departureDate ? formatDate(leg.departureDate) : '?'}
            {' \u2192 '}
            {leg.returnDate ? formatDate(leg.returnDate) : '?'}
          </span>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-rose-500" />
        <h3 className="font-semibold text-gray-800">{dest.city || 'Unknown'}</h3>
        {dest.country && <span className="text-sm text-gray-500">{dest.country}</span>}
        {dest.code && (
          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
            {dest.code}
          </span>
        )}
        {isEditable && (
          <button
            onClick={onRemove}
            className="ml-auto p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Flights */}
      <div className="pl-2 space-y-0.5 border-l-2 border-gray-100">
        <FlightSummary
          label="Outbound"
          flight={leg.outbound}
          routeFrom={originCode}
          routeTo={dest.code || '?'}
          date={leg.departureDate}
          currency={currency}
          isEditable={isEditable}
          onBrowse={onBrowseOutbound}
          onClear={() => onClearFlight('outbound')}
        />
        <FlightSummary
          label="Return"
          flight={leg.inbound}
          routeFrom={dest.code || '?'}
          routeTo={inboundDestCode}
          date={leg.returnDate}
          currency={currency}
          isEditable={isEditable}
          onBrowse={onBrowseInbound}
          onClear={() => onClearFlight('inbound')}
        />
      </div>
    </div>
  );
}
