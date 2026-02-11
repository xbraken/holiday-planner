import { Plane, Coins } from 'lucide-react';
import { AIRPORTS } from '../hooks/useApiSearch';

const CURRENCIES = [
  { code: 'EUR', symbol: '\u20ac', name: 'Euro' },
  { code: 'GBP', symbol: '\u00a3', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
];

export default function UserSettings({ settings, isEditable, onUpdate }) {
  const { homeAirport, homeAirportName, currency } = settings || {};

  if (!isEditable) {
    return (
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Plane className="w-3.5 h-3.5" />
          {homeAirportName || homeAirport || 'DUB'}
        </span>
        <span className="flex items-center gap-1">
          <Coins className="w-3.5 h-3.5" />
          {currency || 'EUR'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5">
        <Plane className="w-3.5 h-3.5 text-gray-400" />
        <select
          value={homeAirport || 'DUB'}
          onChange={(e) => {
            const apt = AIRPORTS.find((a) => a.code === e.target.value);
            onUpdate({
              homeAirport: e.target.value,
              homeAirportName: apt?.name || e.target.value,
            });
          }}
          className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-6"
        >
          {AIRPORTS.map((apt) => (
            <option key={apt.code} value={apt.code}>
              {apt.code} - {apt.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1.5">
        <Coins className="w-3.5 h-3.5 text-gray-400" />
        <select
          value={currency || 'EUR'}
          onChange={(e) => onUpdate({ currency: e.target.value })}
          className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-6"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
