import { AnimatePresence } from 'framer-motion';
import FlightCard from './FlightCard';

function applyFilters(flights, filters) {
  let filtered = [...flights];

  if (filters.maxStops !== null && filters.maxStops !== undefined) {
    filtered = filtered.filter((f) => f.stops <= filters.maxStops);
  }

  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'duration':
        return a.totalDurationMin - b.totalDurationMin;
      case 'departureTime':
        return (a.departureTime || '').localeCompare(b.departureTime || '');
      case 'price':
      default:
        return a.price - b.price;
    }
  });

  return filtered;
}

export default function FlightList({ flights, filters, currency, selectedId, onSelect }) {
  const filtered = applyFilters(flights, filters);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-sm text-gray-400">
          {flights.length === 0
            ? 'No flights found for this route and date.'
            : 'No flights match your filters. Try changing the stops filter.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-4 sm:px-0">
      <p className="text-xs text-gray-400">{filtered.length} flight{filtered.length !== 1 ? 's' : ''} available</p>
      <AnimatePresence>
        {filtered.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            currency={currency}
            selected={selectedId === flight.id}
            onSelect={() => onSelect(flight)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
