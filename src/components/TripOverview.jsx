import { useState } from 'react';
import { Users } from 'lucide-react';
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
  const validTab = activeTab === '__all__' ? '__all__' : (allUsers.includes(activeTab) ? activeTab : currentUser);

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      {allUsers.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {/* All tab */}
          <button
            onClick={() => setActiveTab('__all__')}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              validTab === '__all__'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            All
          </button>

          {allUsers.map((user) => {
            const isActive = user === validTab;
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

      {/* All users view */}
      {validTab === '__all__' ? (
        <div className="space-y-4">
          {allUsers.map((user) => {
            const plan = tripPlans?.[user];
            const hasLegs = plan?.legs && Object.keys(plan.legs).length > 0;
            if (!hasLegs) return null;
            return (
              <div key={user} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getUserColor(user, allUsers)}`}>
                    {user}
                    {user === currentUser && <span className="ml-0.5 opacity-60">(you)</span>}
                  </span>
                </div>
                <PersonalTrip
                  username={user}
                  tripPlan={plan}
                  isCurrentUser={user === currentUser}
                  onBrowseFlights={onBrowseFlights}
                  onAddLeg={onAddLeg}
                  onRemoveLeg={onRemoveLeg}
                  onUpdateLeg={onUpdateLeg}
                  onClearFlight={onClearFlight}
                  onUpdateSettings={onUpdateSettings}
                />
              </div>
            );
          })}
          {/* Show message if no one has trips yet */}
          {allUsers.every((u) => {
            const p = tripPlans?.[u];
            return !p?.legs || Object.keys(p.legs).length === 0;
          }) && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No one has added destinations yet.</p>
            </div>
          )}
        </div>
      ) : (
        /* Single user view */
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
      )}
    </div>
  );
}
