import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogIn, ChevronDown } from 'lucide-react';

export default function UserSelect({ users, currentUser, onJoin, onSwitch }) {
  const [name, setName] = useState('');
  const [showSwitch, setShowSwitch] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onJoin(trimmed);
      setName('');
    }
  };

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
      >
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
          Join the Planning Session
        </h2>
        <p className="text-sm text-gray-500 mb-4">Enter your name to start planning</p>
        <form onSubmit={handleJoin} className="flex gap-2">
          <div className="flex-1 relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              maxLength={20}
              className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="shrink-0 flex items-center gap-1.5 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Join
          </button>
        </form>

        {users.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Or join as an existing user:</p>
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <button
                  key={user}
                  onClick={() => onJoin(user)}
                  className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 active:bg-blue-100 transition-colors"
                >
                  {user}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              Planning as <span className="text-blue-600">{currentUser}</span>
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSwitch(!showSwitch)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            Switch
            <ChevronDown className={`w-3 h-3 transition-transform ${showSwitch ? 'rotate-180' : ''}`} />
          </button>
          {showSwitch && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[140px] py-1"
            >
              {users
                .filter((u) => u !== currentUser)
                .map((user) => (
                  <button
                    key={user}
                    onClick={() => {
                      onSwitch(user);
                      setShowSwitch(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 active:bg-gray-100 text-gray-700"
                  >
                    {user}
                  </button>
                ))}
              <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (name.trim()) {
                      onJoin(name.trim());
                      setName('');
                      setShowSwitch(false);
                    }
                  }}
                  className="flex gap-1"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="New name"
                    maxLength={20}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
