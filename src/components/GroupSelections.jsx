import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
  ExternalLink,
  X,
} from 'lucide-react';
import { getUserColor } from '../utils/colors';
import { cs } from '../utils/currency';
import FlightLeg from './shared/FlightLeg';
import LayoverBadge from './shared/LayoverBadge';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function FlightDetailPanel({ label, icon, colorClass, summary, date }) {
  if (!summary) return null;
  const legs = summary.legs || [];
  const layovers = summary.layovers || [];

  return (
    <div className={`${colorClass} rounded-lg p-2.5`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
        {date && (
          <span className="text-[11px] ml-auto opacity-70 flex items-center gap-0.5">
            <Calendar className="w-3 h-3" />
            {formatDate(date)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-semibold">{summary.departureTime}</span>
        <span className="text-[11px] opacity-60">{summary.departureCode}</span>
        <ArrowRight className="w-3 h-3 opacity-40" />
        <span className="font-semibold">{summary.arrivalTime}</span>
        <span className="text-[11px] opacity-60">{summary.arrivalCode}</span>
        <span className="text-[11px] opacity-60 ml-auto flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          {summary.duration}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs opacity-70">{summary.airline}</span>
        <span className="text-[11px] opacity-50">
          {summary.stops === 0 ? 'Direct' : `${summary.stops} stop${summary.stops > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Full leg details */}
      {legs.length > 1 && (
        <div className="mt-2 pt-2 border-t border-black/5 space-y-1">
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
    </div>
  );
}

function UserSelectionRow({ username, selection, currency, allUsers, isCurrentUser, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const sym = cs(currency);
  const color = getUserColor(username, allUsers);

  if (!selection) {
    return (
      <div className="flex items-center gap-2 py-2 px-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
          {username}
        </span>
        <span className="text-xs text-gray-400 italic">Not yet selected</span>
      </div>
    );
  }

  const ob = selection.outbound?.summary;
  const ret = selection.return?.summary || selection['return']?.summary;
  const obDate = selection.outbound?.date;
  const retDate = selection.return?.date || selection['return']?.date;

  return (
    <div className="border-b border-gray-50 last:border-0">
      {/* Compact row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-3 py-2.5 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${color}`}>
            {username}
            {isCurrentUser && <span className="ml-0.5 opacity-60">(you)</span>}
          </span>
          <div className="flex-1 min-w-0 flex items-center gap-1 text-xs text-gray-600 truncate">
            {ob && (
              <>
                <span className="font-medium">{ob.departureTime}</span>
                <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                <span className="font-medium">{ob.arrivalTime}</span>
              </>
            )}
            {ob && ret && <span className="text-gray-300 mx-0.5">|</span>}
            {ret && (
              <>
                <span className="font-medium">{ret.departureTime}</span>
                <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                <span className="font-medium">{ret.arrivalTime}</span>
              </>
            )}
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="text-sm font-bold text-green-600">{sym}{selection.totalPerPerson || 0}</span>
            {expanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
          </div>
        </div>
        {/* Date line */}
        {(obDate || retDate) && (
          <div className="flex items-center gap-1 mt-1 ml-[calc(0.5rem+4px)]">
            <Calendar className="w-3 h-3 text-gray-300" />
            <span className="text-[11px] text-gray-400">
              {obDate && formatDate(obDate)}
              {obDate && retDate && ' \u2192 '}
              {retDate && formatDate(retDate)}
            </span>
          </div>
        )}
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              <FlightDetailPanel
                label="Outbound"
                icon={<Plane className="w-3.5 h-3.5 text-blue-600" />}
                colorClass="bg-blue-50/70 text-blue-800"
                summary={ob}
                date={obDate}
              />
              <FlightDetailPanel
                label="Return"
                icon={<Plane className="w-3.5 h-3.5 text-indigo-600 rotate-180" />}
                colorClass="bg-indigo-50/70 text-indigo-800"
                summary={ret}
                date={retDate}
              />

              {/* Cost breakdown */}
              <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Outbound</span>
                  <span>{sym}{ob?.price || 0}</span>
                </div>
                <div className="flex justify-between mt-0.5">
                  <span>Return</span>
                  <span>{sym}{ret?.price || 0}</span>
                </div>
                <div className="flex justify-between mt-1 pt-1 border-t border-gray-200 font-semibold text-gray-800">
                  <span>Total per person</span>
                  <span>{sym}{selection.totalPerPerson || 0}</span>
                </div>
              </div>

              {/* Google Flights + clear */}
              <div className="flex gap-2">
                {selection.googleFlightsUrl && (
                  <a
                    href={selection.googleFlightsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Google Flights
                  </a>
                )}
                {isCurrentUser && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onClear(); }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Change
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GroupSelections({ destId, selections, allUsers, currentUser, currency, onClear }) {
  const userSelections = selections?.[destId] || {};
  const selectedUsers = Object.keys(userSelections);
  const hasAnySelections = selectedUsers.length > 0;

  if (!hasAnySelections && allUsers.length === 0) return null;

  // Calculate group total
  const groupTotal = selectedUsers.reduce((sum, u) => sum + (userSelections[u]?.totalPerPerson || 0), 0);

  return (
    <div className="mt-2 bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          Flight Selections
        </span>
        {hasAnySelections && (
          <span className="text-[11px] text-gray-400">
            {selectedUsers.length}/{allUsers.length} selected
          </span>
        )}
      </div>

      {/* User rows */}
      {allUsers.map((user) => (
        <UserSelectionRow
          key={user}
          username={user}
          selection={userSelections[user]}
          currency={currency}
          allUsers={allUsers}
          isCurrentUser={user === currentUser}
          onClear={() => onClear(destId, user)}
        />
      ))}

      {/* Group total */}
      {selectedUsers.length > 1 && (
        <div className="px-3 py-2 bg-green-50/50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-500">Group total ({selectedUsers.length} people)</span>
          <span className="text-sm font-bold text-green-600">{cs(currency)}{groupTotal}</span>
        </div>
      )}
    </div>
  );
}
