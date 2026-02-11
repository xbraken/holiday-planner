import { motion } from 'framer-motion';
import {
  Calendar,
  Plane,
  Users,
  Clock,
  Coins,
} from 'lucide-react';
import { AIRPORTS } from '../hooks/useApiSearch';

const CURRENCIES = [
  { code: 'EUR', symbol: '\u20ac', name: 'Euro' },
  { code: 'GBP', symbol: '\u00a3', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
];

export default function SearchParams({ params, onUpdate }) {
  const { startDate, endDate, airport, airportName, travelers, currency } = params || {};

  // Calculate trip duration
  const duration = (() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days <= 0) return null;
    return `${days} night${days !== 1 ? 's' : ''}`;
  })();

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Trip Details
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          Set dates and preferences - changes sync to everyone
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={startDate || ''}
                min={today}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Return Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={endDate || ''}
                min={startDate || today}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Duration indicator */}
        {duration && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl"
          >
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-700 font-medium">
              {duration}
            </span>
          </motion.div>
        )}

        {/* Airport & Travelers & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Departure Airport
            </label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={airport || 'DUB'}
                onChange={(e) => {
                  const selected = AIRPORTS.find((a) => a.code === e.target.value);
                  onUpdate({
                    airport: e.target.value,
                    airportName: selected?.name || e.target.value,
                  });
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {AIRPORTS.map((apt) => (
                  <option key={apt.code} value={apt.code}>
                    {apt.code} - {apt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Number of Travelers
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={travelers || 6}
                onChange={(e) => onUpdate({ travelers: parseInt(e.target.value) })}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} travelers
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Currency
          </label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={currency || 'EUR'}
              onChange={(e) => onUpdate({ currency: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
