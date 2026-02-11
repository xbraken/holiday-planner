import { useState, useRef, useEffect } from 'react';
import { Globe, Plus, Calendar, X, ChevronDown } from 'lucide-react';
import { DESTINATIONS } from '../hooks/useApiSearch';

export default function AddLegForm({ onAdd, onCancel, lastReturnDate }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);
  const [departureDate, setDepartureDate] = useState(lastReturnDate || '');
  const [returnDate, setReturnDate] = useState('');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? DESTINATIONS.filter(
        (d) =>
          d.city.toLowerCase().includes(query.toLowerCase()) ||
          d.country.toLowerCase().includes(query.toLowerCase()) ||
          d.code.toLowerCase().includes(query.toLowerCase())
      )
    : DESTINATIONS;

  const handleSelect = (dest) => {
    setSelectedDest(dest);
    setQuery(dest.city);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    const dest = selectedDest || (query.trim() ? { city: query.trim(), country: '', code: '' } : null);
    if (!dest) return;
    onAdd({
      destination: { city: dest.city, country: dest.country || '', code: dest.code || '' },
      departureDate,
      returnDate,
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Add destination</h3>
        <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Destination picker */}
      <div className="relative">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedDest(null);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search city, country, or airport code..."
            className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {query ? (
            <button
              onClick={() => { setQuery(''); setSelectedDest(null); setShowDropdown(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          )}
        </div>

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">No matching destinations</div>
            ) : (
              filtered.slice(0, 15).map((dest) => (
                <button
                  key={dest.code + dest.city}
                  onClick={() => handleSelect(dest)}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-800">{dest.city}</span>
                    <span className="text-xs text-gray-500 ml-2">{dest.country}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{dest.code}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-1">Arrive</label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={departureDate}
              min={today}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-1">Depart</label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={returnDate}
              min={departureDate || today}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!query.trim()}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add to trip
      </button>
    </div>
  );
}
