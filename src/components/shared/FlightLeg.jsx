import { Clock, ArrowRight, AlertTriangle } from 'lucide-react';

export default function FlightLeg({ leg }) {
  return (
    <div className="flex items-start gap-2">
      {leg.airlineLogo && (
        <img
          src={leg.airlineLogo}
          alt={leg.airline}
          className="w-6 h-6 rounded mt-0.5 shrink-0"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">
            {leg.departure.time}
          </span>
          <span className="text-[11px] text-gray-400">{leg.departure.code}</span>
          <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
          <span className="text-sm font-semibold text-gray-800">
            {leg.arrival.time}
          </span>
          <span className="text-[11px] text-gray-400">{leg.arrival.code}</span>
          <span className="text-[11px] text-gray-400 ml-auto flex items-center gap-0.5 shrink-0">
            <Clock className="w-3 h-3" />
            {leg.duration}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-500">{leg.airline}</span>
          <span className="text-[11px] text-gray-400">{leg.flightNumber}</span>
          {leg.airplane && (
            <span className="text-[11px] text-gray-400 hidden sm:inline">{leg.airplane}</span>
          )}
          {leg.oftenDelayed && (
            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />
              Often delayed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
