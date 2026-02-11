import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  ThumbsUp,
  Trash2,
  Globe,
  Search,
  ChevronDown,
  X,
} from 'lucide-react';
import { DESTINATIONS } from '../hooks/useApiSearch';
import { getUserColor } from '../utils/colors';
import GroupSelections from './GroupSelections';

export default function Destinations({
  destinations,
  selections,
  currentUser,
  allUsers,
  currency,
  onAdd,
  onVote,
  onRemove,
  onBrowse,
  onClearSelection,
  searchParams,
}) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
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
    onAdd({
      city: dest.city,
      country: dest.country,
      code: dest.code,
      suggestedBy: currentUser,
    });
    setQuery('');
    setShowDropdown(false);
  };

  const handleCustomAdd = () => {
    if (query.trim()) {
      onAdd({
        city: query.trim(),
        country: '',
        suggestedBy: currentUser,
      });
      setQuery('');
      setShowDropdown(false);
    }
  };

  const destList = destinations
    ? Object.entries(destinations)
        .map(([id, dest]) => ({ id, ...dest }))
        .sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0))
    : [];

  const hasDates = searchParams?.startDate && searchParams?.endDate;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Destinations
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          Suggest places, browse flights, and pick your preferred option
        </p>
      </div>

      {/* Add destination - searchable dropdown */}
      <div className="p-4 sm:px-6 border-b border-gray-50 bg-gray-50/50">
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search city, country, or airport code..."
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setShowDropdown(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {!query && (
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              )}
            </div>
            <button
              onClick={handleCustomAdd}
              disabled={!query.trim()}
              className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-20 left-0 right-14 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
            >
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">
                  No matching destinations found
                </div>
              ) : (
                filtered.slice(0, 20).map((dest) => (
                  <button
                    key={dest.code + dest.city}
                    onClick={() => handleSelect(dest)}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-800">{dest.city}</span>
                      <span className="text-xs text-gray-500 ml-2">{dest.country}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{dest.code}</span>
                  </button>
                ))
              )}
              {filtered.length > 20 && (
                <div className="px-4 py-2 text-xs text-gray-400 text-center">
                  Type more to narrow results...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Destinations list */}
      <div className="divide-y divide-gray-50">
        <AnimatePresence>
          {destList.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 sm:p-8 text-center"
            >
              <Globe className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                No destinations yet. Be the first to suggest one!
              </p>
            </motion.div>
          )}

          {destList.map((dest) => {
            const votes = dest.votes || [];
            const hasVoted = votes.includes(currentUser);

            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 sm:px-6 hover:bg-gray-50/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">
                        {dest.city}
                      </h3>
                      {dest.country && (
                        <span className="text-sm text-gray-500">
                          {dest.country}
                        </span>
                      )}
                      {dest.code && (
                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {dest.code}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Suggested by{' '}
                      <span className="font-medium text-gray-500">
                        {dest.suggestedBy}
                      </span>
                    </p>

                    {votes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {votes.map((voter) => (
                          <span
                            key={voter}
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getUserColor(
                              voter,
                              allUsers
                            )}`}
                          >
                            {voter}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Browse flights button */}
                    <button
                      onClick={() => onBrowse({ id: dest.id, city: dest.city, country: dest.country, code: dest.code })}
                      disabled={!hasDates}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 active:bg-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title={hasDates ? 'Browse flights' : 'Set dates first'}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Flights</span>
                    </button>

                    <button
                      onClick={() => onVote(dest.id, currentUser)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        hasVoted
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp
                        className={`w-3.5 h-3.5 ${hasVoted ? 'fill-blue-600' : ''}`}
                      />
                      {votes.length}
                    </button>

                    {dest.suggestedBy === currentUser && (
                      <button
                        onClick={() => onRemove(dest.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Group selections for this destination */}
                <GroupSelections
                  destId={dest.id}
                  selections={selections}
                  allUsers={allUsers}
                  currentUser={currentUser}
                  currency={currency}
                  onClear={onClearSelection}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
