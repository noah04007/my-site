import React, { useState } from 'react';
import { X, Bell, CheckCircle2, Flame, Calendar, Sparkles } from 'lucide-react';
import { AppNotification } from '../types/index.js';
import { soundManager } from '../utils/audio.js';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => Promise<void>;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead
}) => {
  const [morningReminders, setMorningReminders] = useState(true);
  const [eveningCheckin, setEveningCheckin] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [weeklyReviewAlert, setWeeklyReviewAlert] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-winter-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-winter-cyan/15 flex items-center justify-center border border-winter-cyan/30">
              <Bell className="w-4 h-4 text-winter-cyan" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-display">Arc Notifications</h3>
              <p className="text-[11px] text-slate-400">Gentle accountability cues</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preferences Toggles */}
        <div className="py-4 space-y-2 border-b border-white/5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Reminder Preferences
          </h4>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-winter-850 border border-white/5 cursor-pointer">
              <span className="text-slate-200">Morning Intention (08:00)</span>
              <input
                type="checkbox"
                checked={morningReminders}
                onChange={e => {
                  soundManager.playCheck();
                  setMorningReminders(e.target.checked);
                }}
                className="w-4 h-4 rounded text-winter-cyan accent-winter-cyan"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-winter-850 border border-white/5 cursor-pointer">
              <span className="text-slate-200">Evening Check-In (21:00)</span>
              <input
                type="checkbox"
                checked={eveningCheckin}
                onChange={e => {
                  soundManager.playCheck();
                  setEveningCheckin(e.target.checked);
                }}
                className="w-4 h-4 rounded text-winter-cyan accent-winter-cyan"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-winter-850 border border-white/5 cursor-pointer">
              <span className="text-slate-200">Streak Milestones</span>
              <input
                type="checkbox"
                checked={streakAlerts}
                onChange={e => {
                  soundManager.playCheck();
                  setStreakAlerts(e.target.checked);
                }}
                className="w-4 h-4 rounded text-winter-cyan accent-winter-cyan"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-winter-850 border border-white/5 cursor-pointer">
              <span className="text-slate-200">Weekly Review Summary (Sunday)</span>
              <input
                type="checkbox"
                checked={weeklyReviewAlert}
                onChange={e => {
                  soundManager.playCheck();
                  setWeeklyReviewAlert(e.target.checked);
                }}
                className="w-4 h-4 rounded text-winter-cyan accent-winter-cyan"
              />
            </label>
          </div>
        </div>

        {/* Notifications History List */}
        <div className="pt-4 space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Recent Alerts ({notifications.length})
          </h4>

          {notifications.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No new alerts. Your Arc is quiet and focused.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) onMarkRead(notif.id);
                  }}
                  className={`p-3 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                    notif.isRead
                      ? 'bg-winter-850/60 border-white/5 opacity-70'
                      : 'bg-winter-850 border-winter-cyan/30 shadow-glow-cyan'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-winter-cyan/20 border border-winter-cyan/30 flex items-center justify-center shrink-0 mt-0.5">
                    {notif.type === 'streak' ? (
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                    ) : notif.type === 'weekly_review' ? (
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-winter-cyan" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-xs text-white truncate">{notif.title}</h5>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-winter-cyan shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
