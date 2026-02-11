import { ArrowUpDown, Filter } from 'lucide-react';

export default function FlightFilters({ filters, onChange }) {
  const { sortBy, maxStops } = filters;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 px-4 sm:px-0">
      {/* Sort */}
      <div className="flex items-center gap-1 shrink-0">
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[11px] text-gray-500 mr-1">Sort:</span>
        {[
          { key: 'price', label: 'Price' },
          { key: 'duration', label: 'Duration' },
          { key: 'departureTime', label: 'Time' },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange({ ...filters, sortBy: opt.key })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              sortBy === opt.key
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-gray-200 shrink-0" />

      {/* Stops filter */}
      <div className="flex items-center gap-1 shrink-0">
        <Filter className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[11px] text-gray-500 mr-1">Stops:</span>
        {[
          { key: null, label: 'Any' },
          { key: 0, label: 'Direct' },
          { key: 1, label: '1 stop' },
        ].map((opt) => (
          <button
            key={String(opt.key)}
            onClick={() => onChange({ ...filters, maxStops: opt.key })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              maxStops === opt.key
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
