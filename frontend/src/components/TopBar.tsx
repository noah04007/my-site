import React from 'react';
import { Sparkles, Bot, Bell, Volume2, VolumeX, Flame } from 'lucide-react';
import { User, Arc } from '../types/index.js';
import { soundManager } from '../utils/audio.js';

interface TopBarProps {
  user: User | null;
  activeArc: Arc | null;
  unreadNotificationsCount: number;
  onOpenAICoach: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  activeArc,
  unreadNotificationsCount,
  onOpenAICoach,
  onOpenNotifications,
  onOpenProfile,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 px-4 py-3 backdrop-blur-xl">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Brand / Active Arc */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500/25 to-indigo-600/35 border border-purple-400/40 flex items-center justify-center shadow-glow-purple">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-wider uppercase text-white font-display">
                {activeArc ? activeArc.title : 'WINTER ARC'}
              </span>
              {user && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-winter-cyan/15 text-winter-cyan border border-winter-cyan/30">
                  Lv.{user.level}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {activeArc ? activeArc.seasonName || 'Season of Transformation' : 'Consistency over perfection'}
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Audio FX toggle */}
          <button
            onClick={() => {
              soundManager.playCheck();
              onToggleSound();
            }}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-95"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-winter-cyan" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* AI Coach Button */}
          <button
            onClick={() => {
              soundManager.playCheck();
              onOpenAICoach();
            }}
            className="px-2.5 py-1.5 rounded-full bg-gradient-to-r from-winter-cyan/15 to-indigo-500/15 border border-winter-cyan/30 hover:border-winter-cyan/60 text-winter-cyan flex items-center gap-1.5 transition active:scale-95 shadow-glow-cyan"
          >
            <Bot className="w-3.5 h-3.5 text-winter-cyan animate-pulse" />
            <span className="text-[11px] font-bold tracking-tight font-display">ARC AI</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => {
              soundManager.playCheck();
              onOpenNotifications();
            }}
            className="relative w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-winter-cyan shadow-glow-cyan" />
            )}
          </button>

          {/* User Avatar Button */}
          <button
            onClick={() => {
              soundManager.playCheck();
              onOpenProfile();
            }}
            className="w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:border-winter-cyan transition flex items-center justify-center bg-winter-800 ml-0.5 active:scale-95"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white uppercase">
                {user ? user.name.charAt(0) : 'W'}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
