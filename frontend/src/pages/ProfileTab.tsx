import React from 'react';
import {
  User as UserIcon,
  Flame,
  Award,
  Zap,
  Layers,
  Settings,
  Plus,
  CheckCircle2,
  Calendar,
  Volume2,
  VolumeX,
  Bell,
  LogOut,
  Sparkles,
  Trophy,
  Shield,
  ChevronRight
} from 'lucide-react';
import { User, Arc, LevelInfo, Achievement } from '../types/index.js';
import { soundManager } from '../utils/audio.js';

interface ProfileTabProps {
  user: User | null;
  levelInfo: LevelInfo | null;
  activeArc: Arc | null;
  allArcs: Arc[];
  achievements: Achievement[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onStartNewArc: () => void;
  onSwitchArc: (arcId: string) => Promise<void>;
  onTriggerEndOfArc: () => void;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  levelInfo,
  activeArc,
  allArcs,
  achievements,
  soundEnabled,
  onToggleSound,
  onOpenNotifications,
  onOpenAuth,
  onStartNewArc,
  onSwitchArc,
  onTriggerEndOfArc,
  onLogout
}) => {
  const unlockedBadges = achievements.filter(a => a.isUnlocked);

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* 1. User Identity Card */}
      <section className="p-5 rounded-3xl glass-card border border-white/10 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-winter-cyan/20 to-indigo-500/20 border border-winter-cyan/30 flex items-center justify-center text-white text-xl font-black font-display shadow-glow-cyan">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                user?.name.charAt(0) || 'W'
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-display">
                  {user?.name || 'Winter Arc Warrior'}
                </h2>
                {user?.isGuest && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Guest Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{user?.email || 'guest@winterarc.local'}</p>
            </div>
          </div>

          {user?.isGuest ? (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-winter-cyan text-winter-950 font-bold text-xs shadow-glow-cyan active:scale-95 transition"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Level & XP Strip */}
        <div className="p-3.5 rounded-2xl bg-winter-850 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Zap className="w-4 h-4 text-winter-cyan" />
              <span>{levelInfo?.title || 'Level 3 — Consistent'}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              {user?.xp || 450} XP total
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-winter-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-winter-cyan to-indigo-500 rounded-full transition-all duration-500 shadow-glow-cyan"
              style={{ width: `${levelInfo?.progressPercent || 65}%` }}
            />
          </div>
        </div>

        {/* Stats 3-column pill */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Streak</span>
            <span className="text-sm font-black font-display text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              {user?.currentStreak || 1}d
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Badges</span>
            <span className="text-sm font-black font-display text-winter-cyan flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {unlockedBadges.length}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Active Arcs</span>
            <span className="text-sm font-black font-display text-purple-400 flex items-center justify-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {allArcs.length}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Multiple Arcs Management */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-winter-cyan" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Your Seasons ({allArcs.length})
            </h3>
          </div>

          <button
            onClick={onStartNewArc}
            className="px-3 py-1.5 rounded-xl bg-winter-800 hover:bg-winter-700 text-winter-cyan border border-winter-cyan/20 text-xs font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Arc</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {allArcs.map(arc => {
            const isCurrent = activeArc?.id === arc.id;

            return (
              <div
                key={arc.id}
                onClick={() => {
                  if (!isCurrent) onSwitchArc(arc.id);
                }}
                className={`p-4 rounded-3xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'glass-card border-winter-cyan/40 shadow-glow-cyan'
                    : 'bg-winter-900/60 border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{arc.title}</h4>
                    {isCurrent && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-winter-cyan/20 text-winter-cyan font-bold border border-winter-cyan/30">
                        Active Arc
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">“{arc.mainGoal}”</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 font-medium">
                      {arc.durationDays} Days
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 font-medium">
                      {arc.intensity} Intensity
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isCurrent ? (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onTriggerEndOfArc();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-[11px] transition active:scale-95"
                    >
                      Complete Arc
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold">Switch</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Settings & Preferences */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Settings className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Preferences & Tools
          </h3>
        </div>

        <div className="rounded-3xl glass-card border border-white/5 divide-y divide-white/5 overflow-hidden text-xs">
          {/* Audio FX toggle */}
          <div
            onClick={onToggleSound}
            className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-winter-cyan" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-slate-200">Sound Effects & Haptics</span>
            </div>
            <span
              className={`font-semibold ${
                soundEnabled ? 'text-winter-cyan' : 'text-slate-500'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </span>
          </div>

          {/* Notifications Modal */}
          <div
            onClick={onOpenNotifications}
            className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="text-slate-200">Daily Reminder Schedules</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* End of Arc Preview */}
          <div
            onClick={onTriggerEndOfArc}
            className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-slate-200">End of Arc Experience & Reflection</span>
            </div>
            <span className="text-[10px] text-amber-400 font-semibold">Review & Seal</span>
          </div>
        </div>
      </section>

      {/* App Creed / Philosophy footer */}
      <section className="text-center pt-4 pb-2 space-y-1">
        <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
          WINTER ARC • 2026
        </p>
        <p className="text-xs text-slate-400 italic">
          “Your season. Your rules. Your transformation.”
        </p>
      </section>
    </div>
  );
};
