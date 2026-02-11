import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { isFirebaseConfigured } from './firebase';
import { useFirebase } from './hooks/useFirebase';
import Header from './components/SessionHeader';
import UserSelect from './components/UserSelect';
import Destinations from './components/Destinations';
import SearchParams from './components/SearchParams';
import FlightBrowser from './components/FlightBrowser/FlightBrowser';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('holiday-planner-user') || '';
  });

  // FlightBrowser overlay state: { destination, destId } or null
  const [browserState, setBrowserState] = useState(null);

  const {
    data,
    connected,
    loading,
    addUser,
    addDestination,
    voteDestination,
    removeDestination,
    updateSearchParams,
    cacheFlights,
    getCachedFlights,
    saveUserSelection,
    clearUserSelection,
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

  const handleClear = useCallback(() => {
    clearAll();
  }, [clearAll]);

  // Open flight browser for a destination
  const handleBrowse = useCallback(
    (dest) => {
      if (!data?.searchParams?.startDate || !data?.searchParams?.endDate) {
        alert('Please set departure and return dates first.');
        return;
      }
      setBrowserState(dest);
    },
    [data]
  );

  // Confirm flight selection from browser
  const handleConfirmSelection = useCallback(
    (selection) => {
      if (browserState) {
        saveUserSelection(browserState.id, currentUser, selection);
        setBrowserState(null);
      }
    },
    [browserState, currentUser, saveUserSelection]
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
            <Destinations
              destinations={data?.destinations}
              selections={data?.selections}
              currentUser={currentUser}
              allUsers={users}
              currency={data?.searchParams?.currency || 'EUR'}
              onAdd={addDestination}
              onVote={voteDestination}
              onRemove={removeDestination}
              onBrowse={handleBrowse}
              onClearSelection={clearUserSelection}
              searchParams={data?.searchParams}
            />

            <SearchParams
              params={data?.searchParams}
              onUpdate={updateSearchParams}
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
        {browserState && data?.searchParams && (
          <FlightBrowser
            destination={browserState}
            searchParams={data.searchParams}
            currentUser={currentUser}
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
