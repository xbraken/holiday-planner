import { useState, useEffect, useCallback } from 'react';
import {
  database,
  isFirebaseConfigured,
  ref,
  set,
  push,
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
  destinations: {},
  searchParams: {
    startDate: '',
    endDate: '',
    airport: 'DUB',
    airportName: 'Dublin',
    travelers: 6,
    currency: 'EUR',
  },
  selections: {},
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

  const addUser = useCallback(
    (username) => {
      if (!data) return;
      const users = data.users || [];
      if (!users.includes(username)) {
        updatePath('users', [...users, username]);
      }
    },
    [data, updatePath]
  );

  const addDestination = useCallback(
    (destination) => {
      if (isFirebaseConfigured) {
        const destRef = ref(database, `${DB_PATH}/destinations`);
        const newRef = push(destRef);
        set(newRef, { ...destination, votes: [], createdAt: Date.now() });
      } else {
        const d = getLocalData() || DEFAULT_DATA;
        const id = 'dest_' + Date.now();
        if (!d.destinations) d.destinations = {};
        d.destinations[id] = { ...destination, votes: [], createdAt: Date.now() };
        d.lastUpdated = Date.now();
        setLocalData(d);
        setData({ ...d });
      }
    },
    []
  );

  const voteDestination = useCallback(
    (destId, username) => {
      if (!data?.destinations?.[destId]) return;
      const votes = data.destinations[destId].votes || [];
      const newVotes = votes.includes(username)
        ? votes.filter((v) => v !== username)
        : [...votes, username];
      updatePath(`destinations/${destId}/votes`, newVotes);
    },
    [data, updatePath]
  );

  const removeDestination = useCallback(
    (destId) => {
      updatePath(`destinations/${destId}`, null);
      updatePath(`selections/${destId}`, null);
    },
    [updatePath]
  );

  const updateSearchParams = useCallback(
    (params) => {
      updatePath('searchParams', {
        ...(data?.searchParams || DEFAULT_DATA.searchParams),
        ...params,
      });
    },
    [data, updatePath]
  );

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

  const saveUserSelection = useCallback(
    (destId, username, selection) => {
      updatePath(`selections/${destId}/${username}`, {
        ...selection,
        selectedAt: Date.now(),
      });
    },
    [updatePath]
  );

  const clearUserSelection = useCallback(
    (destId, username) => {
      updatePath(`selections/${destId}/${username}`, null);
    },
    [updatePath]
  );

  const clearAll = useCallback(() => {
    updatePath(null, DEFAULT_DATA);
  }, [updatePath]);

  return {
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
  };
}
