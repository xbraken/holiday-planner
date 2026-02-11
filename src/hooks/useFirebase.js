import { useState, useEffect, useCallback } from 'react';
import {
  database,
  isFirebaseConfigured,
  ref,
  set,
  remove,
  onValue,
  off,
} from '../firebase';

const DB_PATH = 'planner';
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000; // 6 hours

function getLocalData() {
  try {
    const raw = localStorage.getItem('holiday-planner-data');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalData(data) {
  localStorage.setItem('holiday-planner-data', JSON.stringify(data));
}

const DEFAULT_DATA = {
  users: [],
  tripPlans: {},
  flightCache: {},
  lastUpdated: Date.now(),
};

export function useFirebase() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(isFirebaseConfigured);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const dbRef = ref(database, DB_PATH);

      onValue(
        dbRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val) {
            setData(val);
          } else {
            set(dbRef, DEFAULT_DATA);
            setData(DEFAULT_DATA);
          }
          setLoading(false);
          setConnected(true);
        },
        (error) => {
          console.error('Firebase error:', error);
          setConnected(false);
          setLoading(false);
        }
      );

      const connRef = ref(database, '.info/connected');
      onValue(connRef, (snap) => {
        setConnected(snap.val() === true);
      });

      return () => {
        off(dbRef);
        off(connRef);
      };
    } else {
      const existing = getLocalData();
      if (existing) {
        setData(existing);
      } else {
        setLocalData(DEFAULT_DATA);
        setData(DEFAULT_DATA);
      }
      setLoading(false);
      setConnected(false);

      const interval = setInterval(() => {
        const d = getLocalData();
        if (d) setData(d);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const updatePath = useCallback((path, value) => {
    if (isFirebaseConfigured) {
      const fullPath = path ? `${DB_PATH}/${path}` : DB_PATH;
      const dbRef = ref(database, fullPath);
      if (value === null) return remove(dbRef);
      return set(dbRef, value);
    } else {
      const d = getLocalData() || DEFAULT_DATA;
      if (path) {
        const parts = path.split('/');
        let obj = d;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!obj[parts[i]]) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        if (value === null) {
          delete obj[parts[parts.length - 1]];
        } else {
          obj[parts[parts.length - 1]] = value;
        }
      } else {
        Object.assign(d, value);
      }
      d.lastUpdated = Date.now();
      setLocalData(d);
      setData({ ...d });
    }
  }, []);

  // ── Users ──

  const addUser = useCallback(
    (username) => {
      if (!data) return;
      const users = data.users || [];
      if (!users.includes(username)) {
        updatePath('users', [...users, username]);
      }
      // Initialize trip plan if not exists
      if (!data?.tripPlans?.[username]) {
        updatePath(`tripPlans/${username}`, {
          homeAirport: 'DUB',
          homeAirportName: 'Dublin',
          currency: 'EUR',
          legs: {},
        });
      }
    },
    [data, updatePath]
  );

  // ── Trip Settings ──

  const setUserSettings = useCallback(
    (username, settings) => {
      if (!data?.tripPlans?.[username]) return;
      Object.entries(settings).forEach(([key, value]) => {
        updatePath(`tripPlans/${username}/${key}`, value);
      });
    },
    [data, updatePath]
  );

  // ── Legs ──

  const addLeg = useCallback(
    (username, legData) => {
      const legs = data?.tripPlans?.[username]?.legs || {};
      const existingOrders = Object.values(legs).map((l) => l.order);
      const nextOrder = existingOrders.length > 0 ? Math.max(...existingOrders) + 1 : 0;
      const legId = 'leg_' + Date.now();

      updatePath(`tripPlans/${username}/legs/${legId}`, {
        order: nextOrder,
        destination: legData.destination,
        departureDate: legData.departureDate || '',
        returnDate: legData.returnDate || '',
        outbound: null,
        inbound: null,
        createdAt: Date.now(),
      });
    },
    [data, updatePath]
  );

  const updateLeg = useCallback(
    (username, legId, updates) => {
      const leg = data?.tripPlans?.[username]?.legs?.[legId];
      if (!leg) return;

      const destChanged =
        updates.destination && updates.destination.code !== leg.destination?.code;
      const deptDateChanged =
        updates.departureDate !== undefined && updates.departureDate !== leg.departureDate;
      const retDateChanged =
        updates.returnDate !== undefined && updates.returnDate !== leg.returnDate;

      const merged = { ...updates };
      if (destChanged || deptDateChanged) merged.outbound = null;
      if (destChanged || retDateChanged) merged.inbound = null;

      Object.entries(merged).forEach(([key, value]) => {
        updatePath(`tripPlans/${username}/legs/${legId}/${key}`, value);
      });
    },
    [data, updatePath]
  );

  const removeLeg = useCallback(
    (username, legId) => {
      updatePath(`tripPlans/${username}/legs/${legId}`, null);
    },
    [updatePath]
  );

  const saveLegFlight = useCallback(
    (username, legId, direction, flightData) => {
      if (direction !== 'outbound' && direction !== 'inbound') return;
      updatePath(`tripPlans/${username}/legs/${legId}/${direction}`, {
        ...flightData,
        selectedAt: Date.now(),
      });
    },
    [updatePath]
  );

  const clearLegFlight = useCallback(
    (username, legId, direction) => {
      if (direction !== 'outbound' && direction !== 'inbound') return;
      updatePath(`tripPlans/${username}/legs/${legId}/${direction}`, null);
    },
    [updatePath]
  );

  // ── Flight Cache ──

  const cacheFlights = useCallback(
    (cacheKey, flightData) => {
      updatePath(`flightCache/${cacheKey}`, {
        ...flightData,
        searchedAt: Date.now(),
      });
    },
    [updatePath]
  );

  const getCachedFlights = useCallback(
    (cacheKey) => {
      const cached = data?.flightCache?.[cacheKey];
      if (!cached) return null;
      if (Date.now() - cached.searchedAt > CACHE_MAX_AGE) return null;
      return cached;
    },
    [data]
  );

  // ── Reset ──

  const clearAll = useCallback(() => {
    updatePath(null, DEFAULT_DATA);
  }, [updatePath]);

  return {
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
  };
}
