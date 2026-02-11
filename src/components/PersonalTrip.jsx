import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Plus, MapPin } from 'lucide-react';
import {
  getSortedLegs,
  getOriginForLeg,
  getInboundDestination,
  getOriginName,
  getInboundDestName,
  calculateTripTotal,
} from '../utils/tripHelpers';
import { cs } from '../utils/currency';
import UserSettings from './UserSettings';
import TripLeg from './TripLeg';
import AddLegForm from './AddLegForm';

export default function PersonalTrip({
  username,
  tripPlan,
  isCurrentUser,
  onBrowseFlights,
  onAddLeg,
  onRemoveLeg,
  onUpdateLeg,
  onClearFlight,
  onUpdateSettings,
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  if (!tripPlan) return null;

  const sortedLegs = getSortedLegs(tripPlan.legs);
  const homeAirport = tripPlan.homeAirport || 'DUB';
  const homeAirportName = tripPlan.homeAirportName || 'Dublin';
  const currency = tripPlan.currency || 'EUR';
  const sym = cs(currency);
  const total = calculateTripTotal(sortedLegs);
  const lastLeg = sortedLegs[sortedLegs.length - 1];

  return (
    <div className="space-y-3">
      {/* Settings bar */}
      <div className="flex items-center justify-between gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{homeAirportName}</span>
          <span className="text-xs text-gray-400 font-mono">({homeAirport})</span>
        </div>
        <UserSettings
          settings={tripPlan}
          isEditable={isCurrentUser}
          onUpdate={(s) => onUpdateSettings(username, s)}
        />
      </div>

      {/* Legs */}
      {sortedLegs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            {isCurrentUser
              ? 'No destinations yet. Add your first stop!'
              : `${username} hasn't added any destinations yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Home departure marker */}
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500">
            <Home className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-medium">{homeAirportName}</span>
            <span className="font-mono text-gray-400">({homeAirport})</span>
            <div className="flex-1 border-t border-dashed border-gray-200 ml-2" />
          </div>

          <AnimatePresence>
            {sortedLegs.map((leg, i) => (
              <motion.div
                key={leg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-xl border border-gray-100 p-4"
              >
                <TripLeg
                  leg={leg}
                  originCode={getOriginForLeg(sortedLegs, i, homeAirport)}
                  originName={getOriginName(sortedLegs, i, homeAirportName)}
                  inboundDestCode={getInboundDestination(sortedLegs, i, homeAirport)}
                  inboundDestName={getInboundDestName(sortedLegs, i, homeAirportName)}
                  currency={currency}
                  isEditable={isCurrentUser}
                  isLastLeg={i === sortedLegs.length - 1}
                  onBrowseOutbound={() => onBrowseFlights(username, leg.id, 'outbound')}
                  onBrowseInbound={() => onBrowseFlights(username, leg.id, 'inbound')}
                  onUpdateDates={(dates) => onUpdateLeg(username, leg.id, dates)}
                  onRemove={() => onRemoveLeg(username, leg.id)}
                  onClearFlight={(dir) => onClearFlight(username, leg.id, dir)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Home return marker */}
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500">
            <div className="flex-1 border-t border-dashed border-gray-200 mr-2" />
            <Home className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-medium">{homeAirportName}</span>
            <span className="font-mono text-gray-400">({homeAirport})</span>
          </div>
        </div>
      )}

      {/* Add destination */}
      {isCurrentUser && (
        <AnimatePresence>
          {showAddForm ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <AddLegForm
                onAdd={(legData) => {
                  onAddLeg(username, legData);
                  setShowAddForm(false);
                }}
                onCancel={() => setShowAddForm(false)}
                lastReturnDate={lastLeg?.returnDate || ''}
              />
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add destination
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Trip total */}
      {sortedLegs.length > 0 && total > 0 && (
        <div className="flex justify-between items-center px-4 py-3 bg-green-50 rounded-xl border border-green-100">
          <span className="text-sm text-gray-600">Trip total</span>
          <span className="text-lg font-bold text-green-600">{sym}{total}</span>
        </div>
      )}
    </div>
  );
}
