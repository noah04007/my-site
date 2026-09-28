import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api.js';
import {
  User,
  LevelInfo,
  Arc,
  Habit,
  Goal,
  DailyCheckIn,
  JournalEntry,
  Achievement,
  AppNotification,
  ArcStats,
  ActiveTab
} from './types/index.js';
import { soundManager } from './utils/audio.js';
import { fireCelebrationConfetti, fireGrandCelebration } from './utils/confetti.js';

// Layout & Navigation Components
import { TopBar } from './components/TopBar.js';
import { BottomBar } from './components/BottomBar.js';

// Modals
import { OnboardingFlow } from './components/OnboardingFlow.js';
import { AuthModal } from './components/AuthModal.js';
import { AICoachModal } from './components/AICoachModal.js';
import { DailyCheckInModal } from './components/DailyCheckInModal.js';
import { WeeklyReviewModal } from './components/WeeklyReviewModal.js';
import { HabitModal } from './components/HabitModal.js';
import { GoalModal } from './components/GoalModal.js';
import { NotificationsModal } from './components/NotificationsModal.js';
import { EndOfArcModal } from './components/EndOfArcModal.js';

// Tab Pages
import { HomeTab } from './pages/HomeTab.js';
import { HabitsTab } from './pages/HabitsTab.js';
import { ProgressTab } from './pages/ProgressTab.js';
import { JournalTab } from './pages/JournalTab.js';
import { ProfileTab } from './pages/ProfileTab.js';

export default function App() {
  // Application Data State
  const [user, setUser] = useState<User | null>(null);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [activeArc, setActiveArc] = useState<Arc | null>(null);
  const [allArcs, setAllArcs] = useState<Arc[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<ArcStats | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [onThisDay, setOnThisDay] = useState<JournalEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [weeklyReviewPreview, setWeeklyReviewPreview] = useState<any>(null);

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundManager.enabled);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bannerAlert, setBannerAlert] = useState<{ message: string; type: 'xp' | 'success' } | null>(null);

  // Modal Visibility State
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showAICoach, setShowAICoach] = useState<boolean>(false);
  const [showCheckIn, setShowCheckIn] = useState<boolean>(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState<boolean>(false);
  const [showAddHabit, setShowAddHabit] = useState<boolean>(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showAddGoal, setShowAddGoal] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showEndOfArc, setShowEndOfArc] = useState<boolean>(false);

  // Floating XP / Success banner flash
  const triggerBanner = (message: string, type: 'xp' | 'success' = 'xp') => {
    setBannerAlert({ message, type });
    setTimeout(() => {
      setBannerAlert(null);
    }, 2800);
  };

  // Synchronize and load all app data
  const loadAppData = useCallback(async () => {
    try {
      // 1. Check or authenticate user
      let currentUser = user;
      if (!api.getToken()) {
        const guestRes = await api.guestLogin();
        currentUser = guestRes.user;
        setUser(guestRes.user);
      } else {
        try {
          const meRes = await api.getMe();
          currentUser = meRes.user;
          setUser(meRes.user);
          setLevelInfo(meRes.levelInfo);
        } catch {
          const guestRes = await api.guestLogin();
          currentUser = guestRes.user;
          setUser(guestRes.user);
        }
      }

      // 2. Load Arcs
      const arcsRes = await api.getArcs();
      setAllArcs(arcsRes.arcs || []);

      const activeArcRes = await api.getActiveArc();
      if (activeArcRes.arc) {
        setActiveArc(activeArcRes.arc);
        setStats(activeArcRes.stats);
      } else if (!arcsRes.arcs || arcsRes.arcs.length === 0) {
        // First-time user: Trigger onboarding!
        setShowOnboarding(true);
      }

      // 3. Load Habits & Completions
      const habitsRes = await api.getHabits();
      setHabits(habitsRes.habits || []);

      // 4. Load Goals
      const goalsRes = await api.getGoals();
      setGoals(goalsRes.goals || []);

      // 5. Load Today's Checkin
      try {
        const checkinRes = await api.getTodayCheckIn();
        setTodayCheckIn(checkinRes.checkIn);
      } catch {
        // Ignore
      }

      // 6. Load Journal & Memories
      try {
        const journalRes = await api.getJournal();
        setJournalEntries(journalRes.entries || []);
        const memoriesRes = await api.getOnThisDay();
        setOnThisDay(memoriesRes.memories || []);
      } catch {
        // Ignore
      }

      // 7. Load Achievements & Notifications
      try {
        const achRes = await api.getAchievements();
        setAchievements(achRes.achievements || []);
        const notifRes = await api.getNotifications();
        setNotifications(notifRes.notifications || []);
      } catch {
        // Ignore
      }

      // 8. Weekly review preview
      try {
        const reviewRes = await api.getCurrentReviewPreview();
        setWeeklyReviewPreview(reviewRes);
      } catch {
        // Ignore
      }
    } catch (err) {
      console.error('Error loading initial Winter Arc state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAppData();
  }, []);

  // Action: Toggle Habit completion
  const handleToggleHabit = async (habitId: string) => {
    // Optimistic UI toggle
    setHabits(prev =>
      prev.map(h => (h.id === habitId ? { ...h, isCompletedToday: !h.isCompletedToday } : h))
    );

    try {
      const res = await api.toggleHabit(habitId);
      soundManager.playCheck();

      if (res.completed) {
        fireCelebrationConfetti();
        triggerBanner(`+15 XP Habit Completed! Total: ${res.user.xp} XP`);
      }

      if (res.allCompletedToday) {
        soundManager.playCelebration();
        fireGrandCelebration();
        triggerBanner(`🔥 ALL HABITS CHECKED! +${res.bonusXpAwarded} BONUS XP!`, 'success');
      }

      // Update user and stats
      setUser(prev => (prev ? { ...prev, ...res.user } : null));
      setLevelInfo(res.levelInfo);

      // Refresh stats
      const activeArcRes = await api.getActiveArc();
      if (activeArcRes.stats) setStats(activeArcRes.stats);
    } catch (err) {
      console.error('Error toggling habit:', err);
      // Revert on error
      loadAppData();
    }
  };

  // Action: Complete Onboarding and Create Initial Arc
  const handleOnboardingComplete = async (data: {
    categories: string[];
    mainGoal: string;
    durationDays: number;
    intensity: 'Chill' | 'Balanced' | 'Hardcore';
    habits: Array<{
      name: string;
      icon: string;
      category: string;
      frequency: 'daily' | 'weekdays' | 'custom';
      targetTime?: string;
      daysPerWeek: number;
    }>;
  }) => {
    try {
      // Create Arc
      const arcRes = await api.createArc({
        title: `Winter Arc ${new Date().getFullYear()}`,
        seasonName: 'Winter Arc',
        durationDays: data.durationDays,
        intensity: data.intensity,
        mainGoal: data.mainGoal,
        categories: data.categories
      });

      // Create habits
      for (const h of data.habits) {
        await api.createHabit({
          arcId: arcRes.arc.id,
          name: h.name,
          icon: h.icon,
          category: h.category,
          frequency: h.frequency,
          targetTime: h.targetTime,
          daysPerWeek: h.daysPerWeek
        });
      }

      // Create initial goal based on main objective
      await api.createGoal({
        title: data.mainGoal,
        category: data.categories[0] || 'Discipline',
        tasks: ['Establish consistent morning rhythm', 'Protect evening sleep window', 'Show up every single day']
      });

      soundManager.playCelebration();
      fireGrandCelebration();
      setShowOnboarding(false);
      await loadAppData();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    }
  };

  // Action: Daily Check-In Submit
  const handleSubmitCheckIn = async (data: {
    mood: string;
    productivityScore: number;
    proudOf: string;
    improveTomorrow: string;
  }) => {
    const res = await api.submitCheckIn(data);
    setTodayCheckIn(res.checkIn);
    setUser(prev => (prev ? { ...prev, ...res.user } : null));
    setLevelInfo(res.levelInfo);
    triggerBanner(`+${res.xpAwarded} XP Recorded! Evening Reflection Complete.`);

    // Refresh journal
    const journalRes = await api.getJournal();
    setJournalEntries(journalRes.entries || []);
  };

  // Action: Weekly Review Submit
  const handleSubmitWeeklyReview = async (reviewData: any) => {
    await api.submitWeeklyReview(reviewData);
    triggerBanner(`🏆 Weekly Review Sealed! Momentum Intact.`);
    const activeArcRes = await api.getActiveArc();
    if (activeArcRes.stats) setStats(activeArcRes.stats);
  };

  // Action: Habit Save / Edit / Delete / Pause
  const handleSaveHabit = async (habitData: Partial<Habit>) => {
    if (editingHabit) {
      await api.updateHabit(editingHabit.id, habitData);
      setEditingHabit(null);
    } else {
      await api.createHabit({
        arcId: activeArc?.id,
        ...habitData
      });
    }
    const habitsRes = await api.getHabits();
    setHabits(habitsRes.habits || []);
    triggerBanner('Habit Saved to Arc');
  };

  const handlePauseHabit = async (habitId: string, isPaused: boolean) => {
    await api.updateHabit(habitId, { isPaused });
    soundManager.playCheck();
    setHabits(prev => prev.map(h => (h.id === habitId ? { ...h, isPaused } : h)));
    triggerBanner(isPaused ? 'Habit Paused. Rest is part of discipline.' : 'Habit Resumed.');
  };

  const handleDeleteHabit = async (habitId: string) => {
    await api.deleteHabit(habitId);
    soundManager.playCheck();
    setHabits(prev => prev.filter(h => h.id !== habitId));
    triggerBanner('Habit Removed');
  };

  // Action: Goal Tasks & Creation
  const handleCreateGoal = async (goalData: { title: string; category?: string; targetDate?: string; tasks?: string[] }) => {
    await api.createGoal(goalData);
    const goalsRes = await api.getGoals();
    setGoals(goalsRes.goals || []);
    triggerBanner('Goal Established');
  };

  const handleToggleGoalTask = async (taskId: string) => {
    const res = await api.toggleGoalTask(taskId);
    setUser(prev => (prev ? { ...prev, ...res.user } : null));
    setLevelInfo(res.levelInfo);
    if (res.task.isCompleted) {
      fireCelebrationConfetti();
      triggerBanner('+25 XP Milestone Reached!');
    }
    const goalsRes = await api.getGoals();
    setGoals(goalsRes.goals || []);
  };

  const handleDeleteGoal = async (goalId: string) => {
    await api.deleteGoal(goalId);
    setGoals(prev => prev.filter(g => g.id !== goalId));
    soundManager.playCheck();
    triggerBanner('Goal Removed');
  };

  // Action: Journal Note Creation
  const handleCreateJournalEntry = async (entryData: any) => {
    await api.createJournalEntry(entryData);
    const journalRes = await api.getJournal();
    setJournalEntries(journalRes.entries || []);
    triggerBanner('+20 XP Reflection Logged');
  };

  // Action: Switch Arc
  const handleSwitchArc = async (arcId: string) => {
    await api.setActiveArc(arcId);
    soundManager.playCheck();
    await loadAppData();
    triggerBanner('Active Arc Switched');
  };

  // Action: Complete Arc & End-of-Arc reflection
  const handleCompleteArc = async (reflections: any) => {
    if (activeArc) {
      await api.completeArc(activeArc.id, reflections);
      await loadAppData();
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleToggleSound = () => {
    const nextState = soundManager.toggleSound();
    setSoundEnabled(nextState);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const pendingHabitsCount = habits.filter(h => !h.isPaused && !h.isCompletedToday).length;

  return (
    <div className="min-h-screen bg-winter-950 text-slate-100 flex justify-center relative overflow-x-hidden">
      {/* Ambient Winter Backlight Glow */}
      <div className="ambient-glow" />

      {/* Floating XP / Success banner */}
      {bannerAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-winter-cyan text-winter-950 font-black text-xs font-display flex items-center gap-2 shadow-glow-cyan animate-fade-in">
          <span>{bannerAlert.message}</span>
        </div>
      )}

      {/* Mobile-first Phone Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-winter-950 border-x border-white/5 relative z-10">
        {/* Top Header */}
        <TopBar
          user={user}
          activeArc={activeArc}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenAICoach={() => setShowAICoach(true)}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenProfile={() => setActiveTab('profile')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-3 overflow-y-auto">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-winter-cyan/20 border border-winter-cyan/40 flex items-center justify-center text-winter-cyan animate-spin">
                ❄️
              </div>
              <p className="text-xs text-slate-400 font-display font-medium tracking-wide">
                Entering Your Winter Arc...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeTab
                  arc={activeArc}
                  stats={stats}
                  todayHabits={habits.filter(h => !h.isPaused)}
                  goals={goals}
                  todayCheckIn={todayCheckIn}
                  onToggleHabit={handleToggleHabit}
                  onOpenCheckIn={() => setShowCheckIn(true)}
                  onOpenWeeklyReview={() => setShowWeeklyReview(true)}
                  onOpenAddHabit={() => setShowAddHabit(true)}
                  onOpenAddGoal={() => setShowAddGoal(true)}
                  onSwitchTab={setActiveTab}
                />
              )}

              {activeTab === 'habits' && (
                <HabitsTab
                  habits={habits}
                  onToggleHabit={handleToggleHabit}
                  onOpenAddHabit={() => {
                    setEditingHabit(null);
                    setShowAddHabit(true);
                  }}
                  onEditHabit={habit => {
                    setEditingHabit(habit);
                    setShowAddHabit(true);
                  }}
                  onPauseHabit={handlePauseHabit}
                  onDeleteHabit={handleDeleteHabit}
                />
              )}

              {activeTab === 'progress' && (
                <ProgressTab
                  stats={stats}
                  levelInfo={levelInfo}
                  achievements={achievements}
                  goals={goals}
                  arc={activeArc}
                  onToggleGoalTask={handleToggleGoalTask}
                  onOpenAddGoal={() => setShowAddGoal(true)}
                  onDeleteGoal={handleDeleteGoal}
                />
              )}

              {activeTab === 'journal' && (
                <JournalTab
                  entries={journalEntries}
                  onThisDay={onThisDay}
                  onOpenCheckIn={() => setShowCheckIn(true)}
                  onCreateEntry={handleCreateJournalEntry}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileTab
                  user={user}
                  levelInfo={levelInfo}
                  activeArc={activeArc}
                  allArcs={allArcs}
                  achievements={achievements}
                  soundEnabled={soundEnabled}
                  onToggleSound={handleToggleSound}
                  onOpenNotifications={() => setShowNotifications(true)}
                  onOpenAuth={() => setShowAuthModal(true)}
                  onStartNewArc={() => setShowOnboarding(true)}
                  onSwitchArc={handleSwitchArc}
                  onTriggerEndOfArc={() => setShowEndOfArc(true)}
                  onLogout={async () => {
                    api.setToken(null);
                    setUser(null);
                    await loadAppData();
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Tab Navigation */}
        <BottomBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          pendingHabitsCount={pendingHabitsCount}
        />
      </div>

      {/* MODALS */}
      {/* 1. Onboarding & Arc Creator Flow */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onCancel={() => setShowOnboarding(false)}
        />
      )}

      {/* 2. Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={newUser => {
          setUser(newUser);
          loadAppData();
        }}
      />

      {/* 3. ARC AI Coach Modal */}
      <AICoachModal
        isOpen={showAICoach}
        onClose={() => setShowAICoach(false)}
        currentStreak={stats?.currentStreak || 1}
      />

      {/* 4. Daily Check-In Modal */}
      <DailyCheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSubmit={handleSubmitCheckIn}
        alreadyDone={!!todayCheckIn}
      />

      {/* 5. Weekly Review Modal */}
      <WeeklyReviewModal
        isOpen={showWeeklyReview}
        onClose={() => setShowWeeklyReview(false)}
        onSubmit={handleSubmitWeeklyReview}
        previewData={weeklyReviewPreview}
      />

      {/* 6. Add/Edit Habit Modal */}
      <HabitModal
        isOpen={showAddHabit}
        onClose={() => {
          setShowAddHabit(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
      />

      {/* 7. Add Goal Modal */}
      <GoalModal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onSave={handleCreateGoal}
      />

      {/* 8. Notifications Preferences & Alerts Center */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
      />

      {/* 9. End of Arc Reflection & Celebration */}
      <EndOfArcModal
        isOpen={showEndOfArc}
        onClose={() => setShowEndOfArc(false)}
        arc={activeArc}
        stats={stats}
        totalGoalsCompleted={goals.filter(g => g.isCompleted || g.progressPercent === 100).length}
        totalJournalEntries={journalEntries.length}
        onCompleteArc={handleCompleteArc}
        onStartNewArc={() => {
          setShowEndOfArc(false);
          setShowOnboarding(true);
        }}
      />
    </div>
  );
}
