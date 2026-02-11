import { useState } from 'react';
import { getUserColor } from '../utils/colors';
import PersonalTrip from './PersonalTrip';

export default function TripOverview({
  tripPlans,
  allUsers,
  currentUser,
  onBrowseFlights,
  onAddLeg,
  onRemoveLeg,
  onUpdateLeg,
  onClearFlight,
  onUpdateSettings,
}) {
  const [activeTab, setActiveTab] = useState(currentUser);

  // Ensure active tab is valid
  const validTab = allUsers.includes(activeTab) ? activeTab : currentUser;

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      {allUsers.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {allUsers.map((user) => {
            const isActive = user === validTab;
            const color = getUserColor(user, allUsers);
            return (
              <button
                key={user}
                onClick={() => setActiveTab(user)}
                className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {user}
                {user === currentUser && (
                  <span className={`ml-1 text-xs ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                    (you)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Active user's trip */}
      <PersonalTrip
        username={validTab}
        tripPlan={tripPlans?.[validTab]}
        isCurrentUser={validTab === currentUser}
        onBrowseFlights={onBrowseFlights}
        onAddLeg={onAddLeg}
        onRemoveLeg={onRemoveLeg}
        onUpdateLeg={onUpdateLeg}
        onClearFlight={onClearFlight}
        onUpdateSettings={onUpdateSettings}
      />
    </div>
  );
}
