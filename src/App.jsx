import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { isFirebaseConfigured } from './firebase';
import { useFirebase } from './hooks/useFirebase';
import {
  getSortedLegs,
  getOriginForLeg,
  getInboundDestination,
  getOriginName,
  getInboundDestName,
} from './utils/tripHelpers';
import { resolveAirportCode } from './hooks/useApiSearch';
import Header from './components/SessionHeader';
import UserSelect from './components/UserSelect';
import TripOverview from './components/TripOverview';
import FlightBrowser from './components/FlightBrowser/FlightBrowser';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('holiday-planner-user') || '';
  });

  const [browserState, setBrowserState] = useState(null);

  const {
    data,
    connected,
    loading,
    addUser,
    setUserSettings,
    addLeg,
    updateLeg,
    removeLeg,
    saveLegFlight,
    clearLegFlight,
    cacheFlights,
    getCachedFlights,
    clearAll,
  } = useFirebase();

  const handleJoin = useCallback(
    (name) => {
      setCurrentUser(name);
      localStorage.setItem('holiday-planner-user', name);
      addUser(name);
    },
    [addUser]
  );

  const handleSwitch = useCallback((name) => {
    setCurrentUser(name);
    localStorage.setItem('holiday-planner-user', name);
  }, []);

  // Re-register user if they're in localStorage but missing from users list
  // Only runs once after initial load to avoid race conditions
  const [hasReregistered, setHasReregistered] = useState(false);
  useEffect(() => {
    if (hasReregistered || !currentUser || !data || loading) return;
    const users = data.users || [];
    if (!users.includes(currentUser)) {
      addUser(currentUser);
    }
    setHasReregistered(true);
  }, [currentUser, data, loading, hasReregistered, addUser]);

  const handleClear = useCallback(() => {
    clearAll();
    setCurrentUser('');
    localStorage.removeItem('holiday-planner-user');
  }, [clearAll]);

  // Open flight browser for a specific leg
  const handleBrowseFlights = useCallback(
    (username, legId, direction) => {
      const tripPlan = data?.tripPlans?.[username];
      if (!tripPlan) return;

      const sortedLegs = getSortedLegs(tripPlan.legs);
      const legIndex = sortedLegs.findIndex((l) => l.id === legId);
      const leg = sortedLegs[legIndex];
      if (!leg) return;

      if (!leg.departureDate || !leg.returnDate) {
        alert('Please set dates for this leg first.');
        return;
      }

      const homeAirport = tripPlan.homeAirport || 'DUB';
      const homeAirportName = tripPlan.homeAirportName || 'Dublin';

      const originCode = getOriginForLeg(sortedLegs, legIndex, homeAirport);
      const originNameStr = getOriginName(sortedLegs, legIndex, homeAirportName);
      const inboundCode = getInboundDestination(sortedLegs, legIndex, homeAirport);
      const inboundNameStr = getInboundDestName(sortedLegs, legIndex, homeAirportName);

      // Resolve airport codes - destination.code may be empty for custom entries
      const destCode = leg.destination.code || resolveAirportCode(leg.destination.city);
      if (!destCode) {
        alert(`Could not find airport code for "${leg.destination.city}". Try picking from the dropdown.`);
        return;
      }

      setBrowserState({
        username,
        legId,
        origin: { code: originCode, name: originNameStr },
        destination: { code: destCode, name: leg.destination.city },
        inboundDestination: { code: inboundCode, name: inboundNameStr },
        outboundDate: leg.departureDate,
        returnDate: leg.returnDate,
        currency: tripPlan.currency || 'EUR',
      });
    },
    [data]
  );

  // Confirm flight selection from browser
  const handleConfirmSelection = useCallback(
    (selection) => {
      if (browserState) {
        saveLegFlight(browserState.username, browserState.legId, 'outbound', selection.outbound);
        saveLegFlight(browserState.username, browserState.legId, 'inbound', selection.inbound);
        setBrowserState(null);
      }
    },
    [browserState, saveLegFlight]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading planner...</p>
        </motion.div>
      </div>
    );
  }

  const users = data?.users || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-3 sm:space-y-4 pb-20">
        {!isFirebaseConfigured && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4"
          >
            <p className="text-sm font-medium text-amber-800">
              Firebase not configured - running in local mode
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Edit <code className="bg-amber-100 px-1 py-0.5 rounded">src/firebase.js</code> with
              your Firebase config to enable real-time sync across devices.
            </p>
          </motion.div>
        )}

        <Header
          users={users}
          currentUser={currentUser}
          connected={connected}
          onClearAll={handleClear}
        />

        <UserSelect
          users={users}
          currentUser={currentUser}
          onJoin={handleJoin}
          onSwitch={handleSwitch}
        />

        {currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 sm:space-y-4"
          >
            <TripOverview
              tripPlans={data?.tripPlans}
              allUsers={users}
              currentUser={currentUser}
              onBrowseFlights={handleBrowseFlights}
              onAddLeg={addLeg}
              onRemoveLeg={removeLeg}
              onUpdateLeg={updateLeg}
              onClearFlight={clearLegFlight}
              onUpdateSettings={setUserSettings}
            />
          </motion.div>
        )}

        {data?.lastUpdated && (
          <div className="text-center text-[11px] text-gray-400 pt-2">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>

      {/* FlightBrowser overlay */}
      <AnimatePresence>
        {browserState && (
          <FlightBrowser
            origin={browserState.origin}
            destination={browserState.destination}
            inboundDestination={browserState.inboundDestination}
            outboundDate={browserState.outboundDate}
            returnDate={browserState.returnDate}
            currency={browserState.currency}
            getCachedFlights={getCachedFlights}
            cacheFlights={cacheFlights}
            onClose={() => setBrowserState(null)}
            onConfirm={handleConfirmSelection}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
