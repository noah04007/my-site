import React from 'react';
import { Home, ListChecks, TrendingUp, BookOpen, User as UserIcon } from 'lucide-react';
import { ActiveTab } from '../types/index.js';
import { soundManager } from '../utils/audio.js';

interface BottomBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  pendingHabitsCount?: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  activeTab,
  onChangeTab,
  pendingHabitsCount = 0
}) => {
  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'habits', label: 'Habits', icon: ListChecks, badge: pendingHabitsCount },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: UserIcon }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-winter-950/85 backdrop-blur-2xl border-t border-white/5 px-3 py-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!isActive) {
                  soundManager.playCheck();
                  onChangeTab(tab.id);
                }
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-winter-cyan'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active ambient glow pill */}
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 rounded-full bg-winter-cyan shadow-glow-cyan" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && !isActive && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-winter-cyan text-winter-950 font-bold text-[9px] flex items-center justify-center shadow-glow-cyan">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-display tracking-tight transition-colors ${
                  isActive ? 'font-bold text-white' : 'font-medium text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
