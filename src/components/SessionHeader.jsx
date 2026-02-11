import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Wifi,
  WifiOff,
  Trash2,
  Palmtree,
} from 'lucide-react';

export default function Header({
  users,
  currentUser,
  connected,
  onClearAll,
}) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const userColors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-yellow-500',
    'bg-red-500',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Palmtree className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Holiday Planner</h1>
              <p className="text-blue-100 text-xs sm:text-sm">Plan together, travel together</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                connected
                  ? 'bg-green-400/20 text-green-100'
                  : 'bg-red-400/20 text-red-100'
              }`}
            >
              {connected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Active Users */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Active Planners
            </label>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {users.length} {users.length === 1 ? 'person' : 'people'} planning
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {users.map((user, idx) => (
                <motion.div
                  key={user}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    user === currentUser
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      userColors[idx % userColors.length]
                    }`}
                  />
                  {user}
                  {user === currentUser && (
                    <span className="text-[10px] text-blue-500">(you)</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {users.length === 0 && (
              <p className="text-sm text-gray-400 italic">No one has joined yet</p>
            )}
          </div>
        </div>

        {/* Clear All action */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          {showConfirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500">Reset everything?</span>
              <button
                onClick={() => {
                  onClearAll();
                  setShowConfirmClear(false);
                }}
                className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 active:bg-red-700 transition-colors"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-xl hover:bg-red-100 active:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
