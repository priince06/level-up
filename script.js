/**
 * LEVEL UP — Personal Growth System
 * Full Vanilla JavaScript Application Engine
 * 
 * Includes:
 * - Reactive LocalStorage Persistence
 * - Gamified XP & Level Progression Engine with Reversal Safety
 * - Interactive Habit Tracker with Streak Logic
 * - Daily Tasks & Top-3 Priority Matrix
 * - Fitness & Workout Log
 * - Pomodoro Focus Timer with Web Audio Chimes
 * - Guided Daily Reflection Journal
 * - Progress Analytics & Pure SVG Activity Chart
 * - 10-Tier Achievement Badges System
 * - Settings & JSON Data Export/Import
 */

'use strict';

// ============================================================================
// 1. DATA CONSTANTS & STARTER SEEDS
// ============================================================================

const STORAGE_KEY = 'LEVEL_UP_DATA_v1';
const XP_PER_LEVEL = 100;

// Curated motivational quotes
const MOTIVATIONAL_QUOTES = [
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear, Atomic Habits" },
  { text: "Small daily disciplines repeated consistently over time lead to monumental achievements.", author: "John C. Maxwell" },
  { text: "Action creates momentum. Do not wait for inspiration to begin; begin and inspiration will find you.", author: "Marcus Aurelius" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "The secret of getting ahead is getting started. The secret of getting started is breaking complex tasks into small manageable tasks.", author: "Mark Twain" },
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "Focus is a muscle. The more you protect your attention, the more powerful your mind becomes.", author: "Cal Newport, Deep Work" }
];

// Initial starter seeds for first-time visits
const DEFAULT_APP_STATE = {
  user: {
    name: "Champion",
    totalXP: 0,
    level: 1,
    joinedDate: new Date().toISOString().split('T')[0]
  },
  habits: [
    {
      id: "habit_dsa",
      name: "Study DSA & Problem Solving",
      category: "Study",
      description: "Solve 1-2 LeetCode problems or review core algorithmic patterns",
      xpReward: 25,
      history: {},
      createdAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "habit_workout",
      name: "Gym Workout & Physical Training",
      category: "Fitness",
      description: "Strength training, cardio session, or functional mobility",
      xpReward: 30,
      history: {},
      createdAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "habit_read",
      name: "Read 15 Pages of Growth Book",
      category: "Growth",
      description: "Expand knowledge in tech, mindset, or philosophy",
      xpReward: 15,
      history: {},
      createdAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "habit_wake",
      name: "Wake Up on Time & Hydrate",
      category: "Discipline",
      description: "Get up with your morning alarm without hitting snooze",
      xpReward: 20,
      history: {},
      createdAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "habit_journal",
      name: "Evening Daily Reflection Journal",
      category: "Mindset",
      description: "Record wins, learnings, and blueprint tomorrow's objectives",
      xpReward: 15,
      history: {},
      createdAt: new Date().toISOString().split('T')[0]
    }
  ],
  tasks: [
    {
      id: "task_seed_1",
      title: "Set up development workspace & roadmap",
      priority: "High",
      deadline: new Date().toISOString().split('T')[0],
      isTop3: true,
      completed: false,
      completedDate: null,
      xpReward: 20,
      createdAt: new Date().toISOString().split('T')[0]
    },
    {
      id: "task_seed_2",
      title: "Review Array & Two-Pointer patterns",
      priority: "Medium",
      deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      isTop3: true,
      completed: false,
      completedDate: null,
      xpReward: 20,
      createdAt: new Date().toISOString().split('T')[0]
    }
  ],
  goals: [
    {
      id: "goal_seed_1",
      title: "Master Frontend Engineering & Build 5 Showcase Projects",
      category: "Career",
      deadline: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      completed: false,
      completedDate: null,
      xpReward: 100,
      createdAt: new Date().toISOString().split('T')[0]
    }
  ],
  workouts: [],
  focusSessions: [],
  journals: {},
  achievements: [
    { id: "first_habit", title: "First Step", desc: "Complete your very first habit", icon: "🌱", unlocked: false, unlockedAt: null },
    { id: "streak_3", title: "Momentum Spark", desc: "Achieve a 3-day habit streak", icon: "🔥", unlocked: false, unlockedAt: null },
    { id: "streak_7", title: "Unstoppable Force", desc: "Reach a 7-day habit streak", icon: "⚡", unlocked: false, unlockedAt: null },
    { id: "streak_30", title: "Habit Master", desc: "Sustain a 30-day habit streak", icon: "🏆", unlocked: false, unlockedAt: null },
    { id: "first_focus", title: "Deep Work Novice", desc: "Complete your first focus session", icon: "🧠", unlocked: false, unlockedAt: null },
    { id: "focus_10", title: "Focus Machine", desc: "Complete 10 deep work focus sessions", icon: "⏳", unlocked: false, unlockedAt: null },
    { id: "first_workout", title: "Gym Starter", desc: "Log your first fitness workout", icon: "💪", unlocked: false, unlockedAt: null },
    { id: "workout_10", title: "Iron Will", desc: "Record 10 fitness workouts", icon: "🏋️", unlocked: false, unlockedAt: null },
    { id: "journal_5", title: "Self-Reflective", desc: "Write 5 daily journal entries", icon: "📝", unlocked: false, unlockedAt: null },
    { id: "level_5", title: "Level 5 Champion", desc: "Reach Level 5 rank in Level Up", icon: "⭐", unlocked: false, unlockedAt: null }
  ],
  settings: {
    soundEnabled: true
  }
};


// ============================================================================
// 2. AUDIO SYNTHESIZER (WEB AUDIO API - 100% OFFLINE)
// ============================================================================

class SoundFX {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.12, gainLevel = 0.08) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio playback silently fails if autoplay restricted
    }
  }

  // Melodic XP award chime (Major triad chord)
  playXpReward() {
    if (!this.enabled) return;
    this.playTone(523.25, 'sine', 0.1, 0.08); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.08), 80); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.18, 0.09), 160); // G5
  }

  // Level Up Fanfare
  playLevelUp() {
    if (!this.enabled) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.22, 0.12), idx * 120);
    });
  }

  // Timer complete gong / bell
  playTimerComplete() {
    if (!this.enabled) return;
    this.playTone(587.33, 'triangle', 0.4, 0.15);
    setTimeout(() => this.playTone(880, 'sine', 0.6, 0.15), 200);
  }

  // Subtle tap click
  playClick() {
    if (!this.enabled) return;
    this.playTone(400, 'sine', 0.04, 0.03);
  }
}

const sfx = new SoundFX();


// ============================================================================
// 3. MAIN APPLICATION CONTROLLER
// ============================================================================

class LevelUpApplication {
  constructor() {
    this.currentUser = null;
    this.authMode = 'login'; // 'login' | 'signup' | 'forgot'
    this._profileSyncTimeout = null;
    this.pendingLocalMigration = null;

    this.state = this.loadData();
    this.currentView = 'dashboard';
    this.activeHabitFilter = 'all';
    this.activeTaskFilter = 'all';
    this.activeWorkoutFilter = 'all';
    this.activeBadgeFilter = 'all';

    // Focus Timer Properties
    this.timerMode = 'focus'; // 'focus', 'shortBreak', 'longBreak', 'custom'
    this.timerDurations = {
      focus: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60,
      custom: 25 * 60
    };
    this.timerSecondsRemaining = this.timerDurations.focus;
    this.timerInterval = null;
    this.timerIsRunning = false;
    this.timerTotalSeconds = this.timerDurations.focus;

    // Journal active date
    this.activeJournalDate = this.getTodayStr();

    // Pending item for delete confirmation modal
    this.pendingDelete = null;
  }

  // --------------------------------------------------------------------------
  // Data Persistence & Storage (Scoped by Authenticated User)
  // --------------------------------------------------------------------------
  getStorageKey() {
    if (this.currentUser && this.currentUser.id) {
      return `LEVEL_UP_DATA_${this.currentUser.id}`;
    }
    return STORAGE_KEY;
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        // Safe deep merge with defaults to safeguard new schema additions
        return {
          user: { ...DEFAULT_APP_STATE.user, ...(parsed.user || {}) },
          habits: Array.isArray(parsed.habits) ? parsed.habits : DEFAULT_APP_STATE.habits,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : DEFAULT_APP_STATE.tasks,
          goals: Array.isArray(parsed.goals) ? parsed.goals : DEFAULT_APP_STATE.goals,
          workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
          focusSessions: Array.isArray(parsed.focusSessions) ? parsed.focusSessions : [],
          journals: parsed.journals || {},
          achievements: this.mergeAchievements(parsed.achievements),
          settings: { ...DEFAULT_APP_STATE.settings, ...(parsed.settings || {}) }
        };
      }
    } catch (err) {
      console.warn("Could not load stored data, falling back to starter seeds:", err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
  }

  mergeAchievements(savedAchievements) {
    const list = JSON.parse(JSON.stringify(DEFAULT_APP_STATE.achievements));
    if (!Array.isArray(savedAchievements)) return list;

    savedAchievements.forEach(saved => {
      const match = list.find(a => a.id === saved.id);
      if (match) {
        match.unlocked = Boolean(saved.unlocked);
        match.unlockedAt = saved.unlockedAt || null;
      }
    });
    return list;
  }

  saveData() {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.state));
    } catch (e) {
      this.showToast("Storage quota exceeded or private browsing restricted.", "danger");
    }
    this.updateHeaderStats();

    if (this.currentUser && window.cloudSync) {
      this.debounceSyncProfile();
    }
  }

  debounceSyncProfile() {
    clearTimeout(this._profileSyncTimeout);
    this._profileSyncTimeout = setTimeout(() => {
      if (this.currentUser && window.cloudSync) {
        window.cloudSync.syncProfile(this.currentUser.id, {
          name: this.state.user.name,
          totalXP: this.state.user.totalXP,
          level: this.state.user.level,
          soundEnabled: this.state.settings.soundEnabled
        });
      }
    }, 450);
  }

  // --------------------------------------------------------------------------
  // Date Helpers
  // --------------------------------------------------------------------------
  getTodayStr() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatDateNice(dateStr) {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  // --------------------------------------------------------------------------
  // XP & Level Progression System
  // --------------------------------------------------------------------------
  calculateLevelDetails(totalXP) {
    const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
    const currentLevelXP = totalXP % XP_PER_LEVEL;
    const xpNeeded = XP_PER_LEVEL - currentLevelXP;
    const progressPercent = Math.min(100, (currentLevelXP / XP_PER_LEVEL) * 100);

    let rankTitle = "Novice Adventurer";
    if (level >= 15) rankTitle = "Growth Titan";
    else if (level >= 10) rankTitle = "Relentless Achiever";
    else if (level >= 5) rankTitle = "Focus Master";
    else if (level >= 3) rankTitle = "Consistent Striver";

    return { level, currentLevelXP, xpNeeded, progressPercent, rankTitle };
  }

  awardXP(amount, reason = "Activity Completed") {
    if (amount <= 0) return;
    const previousLevel = this.calculateLevelDetails(this.state.user.totalXP).level;

    this.state.user.totalXP += amount;
    const currentDetails = this.calculateLevelDetails(this.state.user.totalXP);
    this.state.user.level = currentDetails.level;

    this.saveData();
    sfx.playXpReward();
    this.showToast(`+${amount} XP: ${reason}`, 'lime');

    // Trigger celebration if leveled up!
    if (currentDetails.level > previousLevel) {
      this.triggerLevelUpCelebration(currentDetails.level, currentDetails.rankTitle);
    }

    this.checkAchievements();
  }

  deductXP(amount, reason = "XP Reversed") {
    if (amount <= 0) return;
    this.state.user.totalXP = Math.max(0, this.state.user.totalXP - amount);
    this.state.user.level = this.calculateLevelDetails(this.state.user.totalXP).level;
    this.saveData();
    this.showToast(`-${amount} XP: ${reason}`, 'danger');
  }

  triggerLevelUpCelebration(newLevel, rankTitle) {
    sfx.playLevelUp();
    const modal = document.getElementById('modal-levelup');
    const titleEl = document.getElementById('levelup-title');
    const subEl = document.getElementById('levelup-subtitle');
    const rewardEl = document.getElementById('levelup-reward-text');

    if (titleEl) titleEl.textContent = `LEVEL ${newLevel} UNLOCKED!`;
    if (subEl) subEl.textContent = `Incredible progress, ${this.state.user.name}! You are now a ${rankTitle}.`;
    if (rewardEl) rewardEl.textContent = `New growth milestone reached at ${this.state.user.totalXP} total XP`;

    if (modal) modal.showModal();
    this.checkAchievements();
  }

  // --------------------------------------------------------------------------
  // Streak Calculation Engine
  // --------------------------------------------------------------------------
  calculateStreaks() {
    const todayStr = this.getTodayStr();
    // Gather all unique dates where at least one habit was completed
    const activeDatesSet = new Set();
    this.state.habits.forEach(h => {
      Object.keys(h.history || {}).forEach(dateStr => {
        if (h.history[dateStr]) activeDatesSet.add(dateStr);
      });
    });

    // Determine current streak
    let currentStreak = 0;
    const oneDayMs = 86400000;
    let checkDate = new Date();

    // Did user complete a habit today?
    const completedToday = activeDatesSet.has(todayStr);

    if (completedToday) {
      currentStreak = 1;
      // Walk backwards starting from yesterday
      let prevDate = new Date(checkDate.getTime() - oneDayMs);
      while (true) {
        const y = prevDate.getFullYear();
        const m = String(prevDate.getMonth() + 1).padStart(2, '0');
        const d = String(prevDate.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;
        if (activeDatesSet.has(dStr)) {
          currentStreak++;
          prevDate = new Date(prevDate.getTime() - oneDayMs);
        } else {
          break;
        }
      }
    } else {
      // Check if user completed yesterday to keep streak alive
      let yesterday = new Date(checkDate.getTime() - oneDayMs);
      const y = yesterday.getFullYear();
      const m = String(yesterday.getMonth() + 1).padStart(2, '0');
      const d = String(yesterday.getDate()).padStart(2, '0');
      const yStr = `${y}-${m}-${d}`;

      if (activeDatesSet.has(yStr)) {
        currentStreak = 1;
        let prevDate = new Date(yesterday.getTime() - oneDayMs);
        while (true) {
          const py = prevDate.getFullYear();
          const pm = String(prevDate.getMonth() + 1).padStart(2, '0');
          const pd = String(prevDate.getDate()).padStart(2, '0');
          const pStr = `${py}-${pm}-${pd}`;
          if (activeDatesSet.has(pStr)) {
            currentStreak++;
            prevDate = new Date(prevDate.getTime() - oneDayMs);
          } else {
            break;
          }
        }
      } else {
        currentStreak = 0;
      }
    }

    // Calculate all-time best streak across entire history
    const sortedDates = Array.from(activeDatesSet).sort();
    let bestStreak = 0;
    let runningChain = 0;
    let lastDateObj = null;

    for (const dStr of sortedDates) {
      const [year, month, day] = dStr.split('-').map(Number);
      const curDateObj = new Date(year, month - 1, day);

      if (!lastDateObj) {
        runningChain = 1;
      } else {
        const diffDays = Math.round((curDateObj - lastDateObj) / oneDayMs);
        if (diffDays === 1) {
          runningChain++;
        } else {
          runningChain = 1;
        }
      }
      if (runningChain > bestStreak) bestStreak = runningChain;
      lastDateObj = curDateObj;
    }

    if (currentStreak > bestStreak) bestStreak = currentStreak;

    return { currentStreak, bestStreak };
  }

  // Calculate streak for an individual habit
  getHabitStreak(habit) {
    const todayStr = this.getTodayStr();
    const history = habit.history || {};
    let streak = 0;
    const oneDayMs = 86400000;
    let checkDate = new Date();

    if (history[todayStr]) {
      streak = 1;
      let prevDate = new Date(checkDate.getTime() - oneDayMs);
      while (true) {
        const y = prevDate.getFullYear();
        const m = String(prevDate.getMonth() + 1).padStart(2, '0');
        const d = String(prevDate.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;
        if (history[dStr]) {
          streak++;
          prevDate = new Date(prevDate.getTime() - oneDayMs);
        } else break;
      }
    } else {
      let yesterday = new Date(checkDate.getTime() - oneDayMs);
      const y = yesterday.getFullYear();
      const m = String(yesterday.getMonth() + 1).padStart(2, '0');
      const d = String(yesterday.getDate()).padStart(2, '0');
      const yStr = `${y}-${m}-${d}`;
      if (history[yStr]) {
        streak = 1;
        let prevDate = new Date(yesterday.getTime() - oneDayMs);
        while (true) {
          const py = prevDate.getFullYear();
          const pm = String(prevDate.getMonth() + 1).padStart(2, '0');
          const pd = String(prevDate.getDate()).padStart(2, '0');
          const pStr = `${py}-${pm}-${pd}`;
          if (history[pStr]) {
            streak++;
            prevDate = new Date(prevDate.getTime() - oneDayMs);
          } else break;
        }
      }
    }
    return streak;
  }

  // --------------------------------------------------------------------------
  // Header & Navigation Rendering
  // --------------------------------------------------------------------------
  updateHeaderStats() {
    const details = this.calculateLevelDetails(this.state.user.totalXP);
    const { currentStreak, bestStreak } = this.calculateStreaks();

    // Welcome greeting & dynamic date
    const welcomeEl = document.getElementById('welcome-heading');
    if (welcomeEl) welcomeEl.textContent = `Welcome back, ${this.state.user.name || 'Champion'}!`;

    const dateTextEl = document.getElementById('date-text');
    if (dateTextEl) {
      dateTextEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }

    // Sidebar user card
    const sbAvatar = document.getElementById('sidebar-user-avatar');
    const sbName = document.getElementById('sidebar-user-name');
    const sbLevel = document.getElementById('sidebar-user-level');
    if (sbAvatar) sbAvatar.textContent = (this.state.user.name || 'C').charAt(0).toUpperCase();
    if (sbName) sbName.textContent = this.state.user.name || 'Champion';
    if (sbLevel) sbLevel.textContent = `Level ${details.level} • ${details.rankTitle}`;

    // Topbar Stats
    const lvlBadge = document.getElementById('header-level-badge');
    const xpBar = document.getElementById('header-xp-bar');
    const xpText = document.getElementById('header-xp-text');
    const xpNeeded = document.getElementById('header-xp-needed');
    const totalXp = document.getElementById('header-total-xp');
    const streakCount = document.getElementById('header-streak-count');

    if (lvlBadge) lvlBadge.textContent = `LVL ${details.level}`;
    if (xpBar) xpBar.style.width = `${details.progressPercent}%`;
    if (xpText) xpText.textContent = `${details.currentLevelXP} / ${XP_PER_LEVEL} XP`;
    if (xpNeeded) xpNeeded.textContent = `${details.xpNeeded} XP to Lvl ${details.level + 1}`;
    if (totalXp) totalXp.textContent = `${this.state.user.totalXP} XP`;
    if (streakCount) streakCount.textContent = `${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`;

    // Sound toggle state
    sfx.enabled = Boolean(this.state.settings.soundEnabled);
    const soundToggle = document.getElementById('settings-sound-toggle');
    if (soundToggle) soundToggle.checked = sfx.enabled;
    const iconOn = document.getElementById('audio-icon-on');
    const iconOff = document.getElementById('audio-icon-off');
    if (iconOn && iconOff) {
      if (sfx.enabled) {
        iconOn.classList.remove('hidden');
        iconOff.classList.add('hidden');
      } else {
        iconOn.classList.add('hidden');
        iconOff.classList.remove('hidden');
      }
    }
  }

  navTo(viewName) {
    sfx.playClick();
    this.currentView = viewName;

    // Toggle panels
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) targetPanel.classList.add('active');

    // Toggle nav items
    document.querySelectorAll('.nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.view === viewName);
    });
    document.querySelectorAll('.mob-nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.view === viewName);
    });

    // Close mobile drawer if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    // Render corresponding view data
    this.renderCurrentView();
  }

  renderCurrentView() {
    switch (this.currentView) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'habits':
        this.renderHabits();
        break;
      case 'tasks':
        this.renderTasks();
        break;
      case 'fitness':
        this.renderFitness();
        break;
      case 'focus':
        this.renderFocus();
        break;
      case 'journal':
        this.renderJournal();
        break;
      case 'progress':
        this.renderProgress();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }
  }

  // --------------------------------------------------------------------------
  // VIEW 1: DASHBOARD
  // --------------------------------------------------------------------------
  renderDashboard() {
    const todayStr = this.getTodayStr();
    const { currentStreak, bestStreak } = this.calculateStreaks();

    // 1. Habit Completion Metric
    const totalHabits = this.state.habits.length;
    const doneHabits = this.state.habits.filter(h => h.history && h.history[todayStr]).length;
    const habitPct = totalHabits > 0 ? Math.round((doneHabits / totalHabits) * 100) : 0;

    const habitPctEl = document.getElementById('dash-habit-pct');
    const habitRatioEl = document.getElementById('dash-habit-ratio');
    const habitBarEl = document.getElementById('dash-habit-bar');
    if (habitPctEl) habitPctEl.textContent = `${habitPct}%`;
    if (habitRatioEl) habitRatioEl.textContent = `${doneHabits} of ${totalHabits} done`;
    if (habitBarEl) habitBarEl.style.width = `${habitPct}%`;

    // 2. Daily Task Completion Metric
    const activeTasks = this.state.tasks;
    const doneTasks = activeTasks.filter(t => t.completed).length;
    const totalTasks = activeTasks.length;
    const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const taskPctEl = document.getElementById('dash-task-pct');
    const taskRatioEl = document.getElementById('dash-task-ratio');
    const taskBarEl = document.getElementById('dash-task-bar');
    if (taskPctEl) taskPctEl.textContent = `${taskPct}%`;
    if (taskRatioEl) taskRatioEl.textContent = `${doneTasks} of ${totalTasks} done`;
    if (taskBarEl) taskBarEl.style.width = `${taskPct}%`;

    // 3. Streak Metric
    const streakEl = document.getElementById('dash-streak-count');
    const bestStreakEl = document.getElementById('dash-best-streak');
    if (streakEl) streakEl.textContent = currentStreak;
    if (bestStreakEl) bestStreakEl.textContent = `${bestStreak} Days`;

    // 4. Focus Time Metric
    const todayFocusSessions = this.state.focusSessions.filter(s => s.date === todayStr);
    const todayFocusMins = todayFocusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const weekFocusMins = this.getWeeklyFocusMinutes();

    const focusMinsEl = document.getElementById('dash-focus-mins');
    const focusWeekEl = document.getElementById('dash-focus-week');
    if (focusMinsEl) focusMinsEl.textContent = `${todayFocusMins}m`;
    if (focusWeekEl) focusWeekEl.textContent = `${(weekFocusMins / 60).toFixed(1)} hrs`;

    // 5. Today's Habits Checklist
    const habitsListEl = document.getElementById('dash-habits-list');
    if (habitsListEl) {
      if (this.state.habits.length === 0) {
        habitsListEl.innerHTML = `
          <div class="empty-state text-center" style="padding: 1.5rem; color: var(--text-muted);">
            <p>No habits created yet. Click "Manage" to add your first habit!</p>
          </div>
        `;
      } else {
        habitsListEl.innerHTML = this.state.habits.map(habit => {
          const isDone = Boolean(habit.history && habit.history[todayStr]);
          const streak = this.getHabitStreak(habit);
          return `
            <div class="habit-check-item ${isDone ? 'completed' : ''}" id="dash-hitem-${habit.id}">
              <div class="habit-item-left">
                <button type="button" class="custom-checkbox-btn ${isDone ? 'checked' : ''}" 
                  onclick="app.toggleHabitCompletion('${habit.id}', '${todayStr}')" 
                  aria-label="Toggle ${habit.name}">
                  ${isDone ? '✓' : ''}
                </button>
                <div class="habit-item-info">
                  <div class="habit-item-title">${this.escapeHTML(habit.name)}</div>
                  <div class="habit-item-meta">
                    <span class="chip chip-${habit.category.toLowerCase()}">${habit.category}</span>
                    <span class="chip-xp">+${habit.xpReward} XP</span>
                    ${streak > 0 ? `<span class="habit-streak-badge">🔥 ${streak}d</span>` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 6. Top 3 Priorities Checklist
    const top3ListEl = document.getElementById('dash-top3-list');
    if (top3ListEl) {
      const top3Tasks = this.state.tasks.filter(t => t.isTop3).slice(0, 3);
      if (top3Tasks.length === 0) {
        top3ListEl.innerHTML = `
          <div class="empty-state text-center" style="padding: 1.5rem; color: var(--text-muted);">
            <p>No Top 3 tasks selected today.</p>
            <button type="button" class="btn btn-secondary btn-sm" style="margin-top: 0.5rem;" onclick="app.navTo('tasks')">Select Top 3</button>
          </div>
        `;
      } else {
        top3ListEl.innerHTML = top3Tasks.map(task => {
          const isOverdue = task.deadline && task.deadline < todayStr && !task.completed;
          return `
            <div class="top3-task-item ${task.completed ? 'completed' : ''}">
              <button type="button" class="custom-checkbox-btn ${task.completed ? 'checked' : ''}"
                onclick="app.toggleTaskCompletion('${task.id}')"
                aria-label="Complete ${task.title}">
                ${task.completed ? '✓' : ''}
              </button>
              <div class="top3-task-info">
                <div class="top3-task-title">${this.escapeHTML(task.title)}</div>
                <div class="top3-task-meta">
                  <span class="chip chip-priority-${task.priority.toLowerCase()}">${task.priority}</span>
                  ${task.deadline ? `<span class="${isOverdue ? 'text-danger font-bold' : ''}">📅 ${task.deadline}</span>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 7. Recent Achievements Showcase
    const recentBadgesEl = document.getElementById('dash-recent-badges');
    if (recentBadgesEl) {
      const unlocked = this.state.achievements.filter(a => a.unlocked).slice(-3);
      if (unlocked.length === 0) {
        const nextTarget = this.state.achievements[0];
        recentBadgesEl.innerHTML = `
          <div class="recent-badge-item">
            <div class="recent-badge-icon">${nextTarget.icon}</div>
            <div class="recent-badge-info">
              <div class="recent-badge-title">${nextTarget.title} (Locked)</div>
              <div class="recent-badge-desc">${nextTarget.desc}</div>
            </div>
          </div>
        `;
      } else {
        recentBadgesEl.innerHTML = unlocked.map(badge => `
          <div class="recent-badge-item unlocked">
            <div class="recent-badge-icon">${badge.icon}</div>
            <div class="recent-badge-info">
              <div class="recent-badge-title">${badge.title}</div>
              <div class="recent-badge-desc">${badge.desc}</div>
            </div>
            <span class="badge-lime">EARNED</span>
          </div>
        `).join('');
      }
    }
  }

  // --------------------------------------------------------------------------
  // VIEW 2: HABIT TRACKER
  // --------------------------------------------------------------------------
  setHabitFilter(filter) {
    this.activeHabitFilter = filter;
    document.querySelectorAll('[data-habit-filter]').forEach(b => {
      b.classList.toggle('active', b.dataset.habitFilter === filter);
    });
    this.renderHabits();
  }

  renderHabits() {
    const todayStr = this.getTodayStr();
    const container = document.getElementById('habits-full-list');
    if (!container) return;

    let habits = this.state.habits;
    if (this.activeHabitFilter !== 'all') {
      habits = habits.filter(h => h.category === this.activeHabitFilter);
    }

    if (habits.length === 0) {
      container.innerHTML = `
        <div class="empty-state card text-center" style="grid-column: 1 / -1; padding: 3rem;">
          <h3 class="text-white" style="margin-bottom: 0.5rem;">No habits found</h3>
          <p class="text-secondary" style="margin-bottom: 1.25rem;">Start building your growth routines by creating a habit.</p>
          <button type="button" class="btn btn-primary" onclick="app.openHabitModal()">Create First Habit</button>
        </div>
      `;
      return;
    }

    // Generate past 7 days dates for mini calendar
    const past7Days = [];
    const oneDayMs = 86400000;
    const nowTime = new Date().getTime();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(nowTime - (i * oneDayMs));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      past7Days.push({
        dateStr: `${y}-${m}-${dateNum}`,
        label: dayLabel,
        isToday: i === 0
      });
    }

    container.innerHTML = habits.map(habit => {
      const isDoneToday = Boolean(habit.history && habit.history[todayStr]);
      const streak = this.getHabitStreak(habit);

      // Render 7-day mini calendar
      const miniCalendarHtml = past7Days.map(slot => {
        const completed = Boolean(habit.history && habit.history[slot.dateStr]);
        return `
          <div class="mini-day-slot" title="${slot.dateStr}">
            <span class="mini-day-label">${slot.label}</span>
            <div class="mini-day-indicator ${completed ? 'done' : ''} ${slot.isToday ? 'is-today' : ''}">
              ${completed ? '✓' : ''}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="habit-card ${isDoneToday ? 'checked-today' : ''}" id="habit-card-${habit.id}">
          <div>
            <div class="habit-card-header">
              <div>
                <div class="habit-card-meta-top">
                  <span class="chip chip-${habit.category.toLowerCase()}">${habit.category}</span>
                  <span class="chip-xp">+${habit.xpReward} XP</span>
                </div>
                <h3 class="habit-card-name">${this.escapeHTML(habit.name)}</h3>
              </div>
              <div class="habit-actions-group">
                <button type="button" class="action-icon-btn" onclick="app.openHabitModal('${habit.id}')" title="Edit Habit" aria-label="Edit ${habit.name}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button type="button" class="action-icon-btn delete-btn" onclick="app.confirmDelete('habit', '${habit.id}')" title="Delete Habit" aria-label="Delete ${habit.name}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>

            <p class="habit-card-desc">${this.escapeHTML(habit.description || 'Consistency beats intensity.')}</p>

            <div class="habit-mini-history">
              ${miniCalendarHtml}
            </div>
          </div>

          <div class="habit-card-footer">
            <div class="habit-streak-badge">
              <span>🔥</span>
              <span>${streak} ${streak === 1 ? 'Day Streak' : 'Days Streak'}</span>
            </div>
            <button type="button" class="habit-toggle-btn ${isDoneToday ? 'completed' : ''}"
              onclick="app.toggleHabitCompletion('${habit.id}', '${todayStr}')">
              <span>${isDoneToday ? '✓ Done Today' : 'Mark Done'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  toggleHabitCompletion(habitId, dateStr) {
    const habit = this.state.habits.find(h => h.id === habitId);
    if (!habit) return;

    if (!habit.history) habit.history = {};

    const wasCompleted = Boolean(habit.history[dateStr]);

    if (!wasCompleted) {
      // Complete habit
      habit.history[dateStr] = true;
      this.awardXP(habit.xpReward, `Habit completed: ${habit.name}`);
    } else {
      // Revert completion
      delete habit.history[dateStr];
      this.deductXP(habit.xpReward, `Habit unchecked: ${habit.name}`);
    }

    this.saveData();

    if (this.currentUser && window.cloudSync) {
      window.cloudSync.syncHabitToggle(
        this.currentUser.id,
        habitId,
        dateStr,
        !wasCompleted,
        this.state.user.totalXP,
        this.state.user.level
      );
    }

    this.renderCurrentView();
  }

  openHabitModal(habitId = null) {
    sfx.playClick();
    const modal = document.getElementById('modal-habit');
    const title = document.getElementById('modal-habit-title');
    const idInput = document.getElementById('habit-modal-id');
    const nameInput = document.getElementById('habit-name');
    const catInput = document.getElementById('habit-category');
    const xpInput = document.getElementById('habit-xp');
    const descInput = document.getElementById('habit-desc');

    if (habitId) {
      const habit = this.state.habits.find(h => h.id === habitId);
      if (!habit) return;
      title.textContent = "Edit Habit";
      idInput.value = habit.id;
      nameInput.value = habit.name;
      catInput.value = habit.category;
      xpInput.value = habit.xpReward;
      descInput.value = habit.description || '';
    } else {
      title.textContent = "Create New Habit";
      idInput.value = "";
      nameInput.value = "";
      catInput.value = "Study";
      xpInput.value = "25";
      descInput.value = "";
    }

    modal.showModal();
  }

  saveHabitFromModal() {
    const id = document.getElementById('habit-modal-id').value.trim();
    const name = document.getElementById('habit-name').value.trim();
    const category = document.getElementById('habit-category').value;
    const xpReward = Math.max(5, parseInt(document.getElementById('habit-xp').value, 10) || 25);
    const description = document.getElementById('habit-desc').value.trim();

    if (!name) {
      this.showToast("Please enter a habit name", "danger");
      return;
    }

    let savedHabit = null;

    if (id) {
      // Edit existing
      const habit = this.state.habits.find(h => h.id === id);
      if (habit) {
        habit.name = name;
        habit.category = category;
        habit.xpReward = xpReward;
        habit.description = description;
        savedHabit = habit;
        this.showToast("Habit updated successfully!", "lime");
      }
    } else {
      // Create new
      const newHabit = {
        id: "habit_" + Date.now(),
        name,
        category,
        xpReward,
        description,
        history: {},
        createdAt: this.getTodayStr()
      };
      this.state.habits.push(newHabit);
      savedHabit = newHabit;
      this.showToast("New habit created!", "lime");
    }

    this.saveData();

    if (this.currentUser && window.cloudSync && savedHabit) {
      window.cloudSync.syncHabitSave(this.currentUser.id, savedHabit);
    }

    this.closeModal('modal-habit');
    this.renderCurrentView();
  }

  // --------------------------------------------------------------------------
  // VIEW 3: GOALS & DAILY TASKS
  // --------------------------------------------------------------------------
  setTaskFilter(filter) {
    this.activeTaskFilter = filter;
    document.querySelectorAll('[data-task-filter]').forEach(b => {
      b.classList.toggle('active', b.dataset.taskFilter === filter);
    });
    this.renderTasks();
  }

  renderTasks() {
    const todayStr = this.getTodayStr();

    // 1. Render Top 3 Spotlight Hero Slots (Exactly 3 slots)
    const top3Spotlight = document.getElementById('tasks-top3-spotlight');
    if (top3Spotlight) {
      const top3Tasks = this.state.tasks.filter(t => t.isTop3).slice(0, 3);
      let slotsHtml = '';

      for (let i = 0; i < 3; i++) {
        const task = top3Tasks[i];
        if (task) {
          const isOverdue = task.deadline && task.deadline < todayStr && !task.completed;
          slotsHtml += `
            <div class="top3-slot filled ${task.completed ? 'completed' : ''}">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                  <span class="tag-accent-top3">PRIORITY ${i + 1}</span>
                  <span class="chip chip-priority-${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
                <div class="top3-slot-title">${this.escapeHTML(task.title)}</div>
                ${task.deadline ? `<span class="task-deadline-tag ${isOverdue ? 'overdue' : ''}">📅 ${task.deadline}</span>` : ''}
              </div>
              <div class="top3-slot-footer">
                <button type="button" class="btn btn-secondary btn-sm" onclick="app.toggleTaskCompletion('${task.id}')">
                  ${task.completed ? '✓ Completed' : 'Mark Done'}
                </button>
                <button type="button" class="top3-star-btn active" onclick="app.toggleTop3Task('${task.id}')" title="Remove from Top 3">★</button>
              </div>
            </div>
          `;
        } else {
          slotsHtml += `
            <div class="top3-slot">
              <div class="top3-slot-empty">
                <div>
                  <span style="font-size: 1.25rem; display: block; margin-bottom: 0.25rem;">⭐</span>
                  Slot ${i + 1} Empty<br>
                  <span style="font-size: 0.72rem;">Star a task below to assign</span>
                </div>
              </div>
            </div>
          `;
        }
      }
      top3Spotlight.innerHTML = slotsHtml;
    }

    // 2. Render Filtered Tasks List
    const tasksContainer = document.getElementById('tasks-full-list');
    if (tasksContainer) {
      let filteredTasks = [...this.state.tasks];

      if (this.activeTaskFilter === 'active') {
        filteredTasks = filteredTasks.filter(t => !t.completed);
      } else if (this.activeTaskFilter === 'completed') {
        filteredTasks = filteredTasks.filter(t => t.completed);
      } else if (this.activeTaskFilter === 'top3') {
        filteredTasks = filteredTasks.filter(t => t.isTop3);
      }

      // Sort
      const sortSelect = document.getElementById('task-sort-select');
      const sortVal = sortSelect ? sortSelect.value : 'priority';

      if (sortVal === 'priority') {
        const weight = { High: 3, Medium: 2, Low: 1 };
        filteredTasks.sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0));
      } else if (sortVal === 'deadline') {
        filteredTasks.sort((a, b) => (a.deadline || '9999') > (b.deadline || '9999') ? 1 : -1);
      } else if (sortVal === 'created') {
        filteredTasks.sort((a, b) => (b.createdAt || '') > (a.createdAt || '') ? 1 : -1);
      }

      if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
          <div class="empty-state card text-center" style="padding: 2.5rem;">
            <p class="text-secondary">No tasks found matching filter.</p>
          </div>
        `;
      } else {
        tasksContainer.innerHTML = filteredTasks.map(task => {
          const isOverdue = task.deadline && task.deadline < todayStr && !task.completed;
          return `
            <div class="task-card-item ${task.completed ? 'completed' : ''}" id="task-row-${task.id}">
              <div class="task-item-left">
                <button type="button" class="custom-checkbox-btn ${task.completed ? 'checked' : ''}"
                  onclick="app.toggleTaskCompletion('${task.id}')"
                  aria-label="Toggle ${task.title}">
                  ${task.completed ? '✓' : ''}
                </button>
                <div class="task-info-content">
                  <span class="task-text-title">${this.escapeHTML(task.title)}</span>
                  <div class="task-meta-tags">
                    <span class="chip chip-priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    <span class="chip-xp">+${task.xpReward} XP</span>
                    ${task.deadline ? `
                      <span class="task-deadline-tag ${isOverdue ? 'overdue' : ''}">
                        📅 ${task.deadline} ${isOverdue ? '(Overdue)' : ''}
                      </span>
                    ` : ''}
                    ${task.isTop3 ? `<span class="badge-lime">Top 3</span>` : ''}
                  </div>
                </div>
              </div>
              <div class="task-item-actions">
                <button type="button" class="top3-star-btn ${task.isTop3 ? 'active' : ''}" 
                  onclick="app.toggleTop3Task('${task.id}')" 
                  title="${task.isTop3 ? 'Remove from Top 3' : 'Set as Top 3 Priority'}">
                  ★
                </button>
                <button type="button" class="action-icon-btn" onclick="app.openTaskModal('${task.id}')" title="Edit Task">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button type="button" class="action-icon-btn delete-btn" onclick="app.confirmDelete('task', '${task.id}')" title="Delete Task">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 3. Render Goals
    this.renderGoals();
  }

  toggleTaskCompletion(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!task.completed) {
      task.completed = true;
      task.completedDate = this.getTodayStr();
      this.awardXP(task.xpReward, `Task completed: ${task.title}`);
    } else {
      task.completed = false;
      task.completedDate = null;
      this.deductXP(task.xpReward, `Task reopened: ${task.title}`);
    }

    this.saveData();

    if (this.currentUser && window.cloudSync) {
      window.cloudSync.syncTaskToggle(
        this.currentUser.id,
        task,
        this.state.user.totalXP,
        this.state.user.level
      );
    }

    this.renderCurrentView();
  }

  toggleTop3Task(taskId) {
    sfx.playClick();
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!task.isTop3) {
      const currentTop3Count = this.state.tasks.filter(t => t.isTop3).length;
      if (currentTop3Count >= 3) {
        this.showToast("You already have 3 priority tasks selected for today!", "danger");
        return;
      }
      task.isTop3 = true;
      this.showToast(`Set as Top 3: "${task.title}"`, "lime");
    } else {
      task.isTop3 = false;
      this.showToast(`Removed from Top 3`, "lime");
    }

    this.saveData();

    if (this.currentUser && window.cloudSync) {
      window.cloudSync.syncTaskSave(this.currentUser.id, task);
    }

    this.renderCurrentView();
  }

  openTaskModal(taskId = null) {
    sfx.playClick();
    const modal = document.getElementById('modal-task');
    const title = document.getElementById('modal-task-title');
    const idInput = document.getElementById('task-modal-id');
    const titleInput = document.getElementById('task-title');
    const priorityInput = document.getElementById('task-priority');
    const deadlineInput = document.getElementById('task-deadline');
    const top3Input = document.getElementById('task-is-top3');

    if (taskId) {
      const task = this.state.tasks.find(t => t.id === taskId);
      if (!task) return;
      title.textContent = "Edit Task";
      idInput.value = task.id;
      titleInput.value = task.title;
      priorityInput.value = task.priority;
      deadlineInput.value = task.deadline || '';
      top3Input.checked = Boolean(task.isTop3);
    } else {
      title.textContent = "Add New Task";
      idInput.value = "";
      titleInput.value = "";
      priorityInput.value = "Medium";
      deadlineInput.value = this.getTodayStr();
      top3Input.checked = false;
    }

    modal.showModal();
  }

  saveTaskFromModal() {
    const id = document.getElementById('task-modal-id').value.trim();
    const title = document.getElementById('task-title').value.trim();
    const priority = document.getElementById('task-priority').value;
    const deadline = document.getElementById('task-deadline').value;
    const isTop3 = document.getElementById('task-is-top3').checked;

    if (!title) {
      this.showToast("Please enter a task title", "danger");
      return;
    }

    // Check top 3 limits if marking as top 3
    if (isTop3) {
      const currentTop3 = this.state.tasks.filter(t => t.isTop3 && t.id !== id).length;
      if (currentTop3 >= 3) {
        this.showToast("Maximum of 3 daily priority tasks allowed.", "danger");
        return;
      }
    }

    let savedTask = null;

    if (id) {
      const task = this.state.tasks.find(t => t.id === id);
      if (task) {
        task.title = title;
        task.priority = priority;
        task.deadline = deadline;
        task.isTop3 = isTop3;
        savedTask = task;
        this.showToast("Task updated!", "lime");
      }
    } else {
      const newTask = {
        id: "task_" + Date.now(),
        title,
        priority,
        deadline,
        isTop3,
        completed: false,
        completedDate: null,
        xpReward: 20,
        createdAt: this.getTodayStr()
      };
      this.state.tasks.unshift(newTask);
      savedTask = newTask;
      this.showToast("New task created!", "lime");
    }

    this.saveData();

    if (this.currentUser && window.cloudSync && savedTask) {
      window.cloudSync.syncTaskSave(this.currentUser.id, savedTask);
    }

    this.closeModal('modal-task');
    this.renderCurrentView();
  }

  renderGoals() {
    const goalsContainer = document.getElementById('goals-full-list');
    if (!goalsContainer) return;

    if (this.state.goals.length === 0) {
      goalsContainer.innerHTML = `
        <div class="empty-state card text-center" style="grid-column: 1 / -1; padding: 2rem;">
          <p class="text-secondary">No milestone goals set yet.</p>
          <button type="button" class="btn btn-secondary btn-sm" style="margin-top: 0.5rem;" onclick="app.openGoalModal()">Set First Goal</button>
        </div>
      `;
      return;
    }

    goalsContainer.innerHTML = this.state.goals.map(goal => `
      <div class="goal-card ${goal.completed ? 'completed' : ''}">
        <div>
          <div class="goal-card-header">
            <span class="chip chip-study">${this.escapeHTML(goal.category || 'Vision')}</span>
            <span class="chip-xp">+${goal.xpReward || 100} XP</span>
          </div>
          <h4 class="goal-title">${this.escapeHTML(goal.title)}</h4>
          ${goal.deadline ? `<span class="text-secondary text-sm" style="display:block; margin-top:0.4rem;">Target: ${goal.deadline}</span>` : ''}
        </div>
        <div class="goal-card-footer">
          <label class="checkbox-label">
            <input type="checkbox" ${goal.completed ? 'checked' : ''} onchange="app.toggleGoalCompletion('${goal.id}')">
            <span class="checkbox-custom"></span>
            <span class="text-sm font-medium ${goal.completed ? 'text-secondary' : 'text-white'}">
              ${goal.completed ? 'Milestone Achieved' : 'Mark Achieved'}
            </span>
          </label>
          <button type="button" class="action-icon-btn delete-btn" onclick="app.confirmDelete('goal', '${goal.id}')" title="Delete Goal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  toggleGoalCompletion(goalId) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (!goal) return;

    if (!goal.completed) {
      goal.completed = true;
      goal.completedDate = this.getTodayStr();
      this.awardXP(goal.xpReward || 100, `Milestone Goal reached: ${goal.title}`);
    } else {
      goal.completed = false;
      goal.completedDate = null;
      this.deductXP(goal.xpReward || 100, `Goal reopened: ${goal.title}`);
    }

    this.saveData();

    if (this.currentUser && window.cloudSync) {
      window.cloudSync.syncGoalToggle(
        this.currentUser.id,
        goal,
        this.state.user.totalXP,
        this.state.user.level
      );
    }

    this.renderCurrentView();
  }

  openGoalModal() {
    sfx.playClick();
    const modal = document.getElementById('modal-goal');
    document.getElementById('goal-title').value = '';
    document.getElementById('goal-category').value = 'Career';
    document.getElementById('goal-deadline').value = '';
    modal.showModal();
  }

  saveGoalFromModal() {
    const title = document.getElementById('goal-title').value.trim();
    const category = document.getElementById('goal-category').value.trim() || 'General';
    const deadline = document.getElementById('goal-deadline').value;

    if (!title) {
      this.showToast("Please enter a goal title", "danger");
      return;
    }

    const newGoal = {
      id: "goal_" + Date.now(),
      title,
      category,
      deadline,
      completed: false,
      completedDate: null,
      xpReward: 100,
      createdAt: this.getTodayStr()
    };

    this.state.goals.push(newGoal);
    this.saveData();

    if (this.currentUser && window.cloudSync) {
      window.cloudSync.syncGoalSave(this.currentUser.id, newGoal);
    }

    this.closeModal('modal-goal');
    this.showToast("New milestone goal added!", "lime");
    this.renderCurrentView();
  }

  // --------------------------------------------------------------------------
  // VIEW 4: FITNESS TRACKER
  // --------------------------------------------------------------------------
  setWorkoutFilter(filter) {
    this.activeWorkoutFilter = filter;
    document.querySelectorAll('[data-workout-filter]').forEach(b => {
      b.classList.toggle('active', b.dataset.workoutFilter === filter);
    });
    this.renderFitness();
  }

  getWeeklyWorkouts() {
    // Current 7-day window
    const oneDayMs = 86400000;
    const nowTime = new Date().getTime();
    const sevenDaysAgoStr = new Date(nowTime - 7 * oneDayMs).toISOString().split('T')[0];
    return this.state.workouts.filter(w => w.date >= sevenDaysAgoStr);
  }

  renderFitness() {
    const weeklyWorkouts = this.getWeeklyWorkouts();
    const totalWeekDuration = weeklyWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0);
    const lifetimeCount = this.state.workouts.length;
    const totalFitnessXP = this.state.workouts.reduce((acc, w) => acc + (w.xpReward || 35), 0);

    const weekCountEl = document.getElementById('fitness-week-count');
    const weekDurEl = document.getElementById('fitness-week-duration');
    const lifetimeEl = document.getElementById('fitness-lifetime-count');
    const totalXpEl = document.getElementById('fitness-total-xp-earned');

    if (weekCountEl) weekCountEl.textContent = weeklyWorkouts.length;
    if (weekDurEl) weekDurEl.textContent = `${totalWeekDuration} min`;
    if (lifetimeEl) lifetimeEl.textContent = lifetimeCount;
    if (totalXpEl) totalXpEl.textContent = `${totalFitnessXP} XP earned from fitness`;

    // Render workout history list
    const container = document.getElementById('workouts-log-container');
    if (!container) return;

    let list = [...this.state.workouts];
    if (this.activeWorkoutFilter !== 'all') {
      list = list.filter(w => w.type === this.activeWorkoutFilter);
    }

    list.sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state text-center" style="padding: 2.5rem; color: var(--text-muted);">
          <p>No workouts logged yet. Stay strong and record your training session!</p>
          <button type="button" class="btn btn-secondary btn-sm" style="margin-top: 0.75rem;" onclick="app.openWorkoutModal()">Log Workout Now</button>
        </div>
      `;
      return;
    }

    const typeIcons = {
      Strength: '🏋️',
      Cardio: '🏃',
      HIIT: '⚡',
      Calisthenics: '🤸',
      Yoga: '🧘',
      Other: '🏅'
    };

    container.innerHTML = list.map(workout => `
      <div class="workout-log-item" id="workout-row-${workout.id}">
        <div class="workout-item-left">
          <div class="workout-icon-badge">
            ${typeIcons[workout.type] || '💪'}
          </div>
          <div class="workout-details">
            <div class="workout-title-row">
              <span class="workout-type-name">${this.escapeHTML(workout.type)}</span>
              <span class="workout-duration-badge">${workout.duration} mins</span>
              <span class="chip-xp">+${workout.xpReward || 35} XP</span>
            </div>
            ${workout.notes ? `<p class="workout-notes-text">${this.escapeHTML(workout.notes)}</p>` : ''}
            <span class="text-secondary text-sm">📅 ${this.formatDateNice(workout.date)}</span>
          </div>
        </div>
        <div class="workout-item-actions">
          <button type="button" class="action-icon-btn" onclick="app.openWorkoutModal('${workout.id}')" title="Edit Workout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button type="button" class="action-icon-btn delete-btn" onclick="app.confirmDelete('workout', '${workout.id}')" title="Delete Workout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  openWorkoutModal(workoutId = null) {
    sfx.playClick();
    const modal = document.getElementById('modal-workout');
    const title = document.getElementById('modal-workout-title');
    const idInput = document.getElementById('workout-modal-id');
    const typeInput = document.getElementById('workout-type');
    const durInput = document.getElementById('workout-duration');
    const dateInput = document.getElementById('workout-date');
    const notesInput = document.getElementById('workout-notes');

    if (workoutId) {
      const workout = this.state.workouts.find(w => w.id === workoutId);
      if (!workout) return;
      title.textContent = "Edit Workout";
      idInput.value = workout.id;
      typeInput.value = workout.type;
      durInput.value = workout.duration;
      dateInput.value = workout.date;
      notesInput.value = workout.notes || '';
    } else {
      title.textContent = "Log Workout";
      idInput.value = "";
      typeInput.value = "Strength";
      durInput.value = 45;
      dateInput.value = this.getTodayStr();
      notesInput.value = "";
    }

    modal.showModal();
  }

  saveWorkoutFromModal() {
    const id = document.getElementById('workout-modal-id').value.trim();
    const type = document.getElementById('workout-type').value;
    const duration = Math.max(5, parseInt(document.getElementById('workout-duration').value, 10) || 45);
    const date = document.getElementById('workout-date').value || this.getTodayStr();
    const notes = document.getElementById('workout-notes').value.trim();

    let savedWorkout = null;

    if (id) {
      const workout = this.state.workouts.find(w => w.id === id);
      if (workout) {
        workout.type = type;
        workout.duration = duration;
        workout.date = date;
        workout.notes = notes;
        savedWorkout = workout;
        this.showToast("Workout updated!", "lime");
      }
    } else {
      const xpReward = 35;
      const newWorkout = {
        id: "workout_" + Date.now(),
        type,
        duration,
        date,
        notes,
        xpReward,
        createdAt: new Date().toISOString()
      };
      this.state.workouts.unshift(newWorkout);
      savedWorkout = newWorkout;
      this.awardXP(xpReward, `Workout Logged: ${type} (${duration}m)`);
    }

    this.saveData();

    if (this.currentUser && window.cloudSync && savedWorkout) {
      window.cloudSync.syncWorkoutSave(
        this.currentUser.id,
        savedWorkout,
        this.state.user.totalXP,
        this.state.user.level
      );
    }

    this.closeModal('modal-workout');
    this.renderCurrentView();
  }

  // --------------------------------------------------------------------------
  // VIEW 5: STUDY & FOCUS TRACKER (POMODORO ENGINE)
  // --------------------------------------------------------------------------
  setTimerMode(mode) {
    if (this.timerIsRunning) {
      if (!confirm("A focus session is currently running. Switch modes and reset timer?")) return;
      this.pauseTimer();
    }
    sfx.playClick();
    this.timerMode = mode;
    this.timerTotalSeconds = this.timerDurations[mode] || 25 * 60;
    this.timerSecondsRemaining = this.timerTotalSeconds;

    document.querySelectorAll('.timer-mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    const statusBadge = document.getElementById('timer-status-badge');
    if (statusBadge) statusBadge.textContent = mode === 'focus' ? 'READY TO FOCUS' : 'BREAK MODE';

    const xpIndicator = document.getElementById('timer-xp-indicator');
    if (xpIndicator) {
      xpIndicator.textContent = mode === 'focus' ? '+25 XP on completion' : 'Rest and recharge';
    }

    this.updateTimerDisplay();
  }

  promptCustomTimer() {
    const minsStr = prompt("Enter focus duration in minutes (5 to 120):", "30");
    if (!minsStr) return;
    const mins = parseInt(minsStr, 10);
    if (isNaN(mins) || mins < 1 || mins > 180) {
      this.showToast("Please enter a valid duration between 1 and 180 minutes.", "danger");
      return;
    }
    this.timerDurations.custom = mins * 60;
    this.setTimerMode('custom');
  }

  toggleTimer() {
    if (this.timerIsRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    sfx.init();
    sfx.playClick();
    this.timerIsRunning = true;

    const playIcon = document.getElementById('timer-play-icon');
    const pauseIcon = document.getElementById('timer-pause-icon');
    const toggleLabel = document.getElementById('timer-toggle-label');
    const statusBadge = document.getElementById('timer-status-badge');

    if (playIcon) playIcon.classList.add('hidden');
    if (pauseIcon) pauseIcon.classList.remove('hidden');
    if (toggleLabel) toggleLabel.textContent = 'Pause';
    if (statusBadge) statusBadge.textContent = this.timerMode === 'focus' ? 'FOCUSING...' : 'ON BREAK';

    this.timerInterval = setInterval(() => {
      this.timerSecondsRemaining--;
      this.updateTimerDisplay();

      if (this.timerSecondsRemaining <= 0) {
        this.timerFinished();
      }
    }, 1000);
  }

  pauseTimer() {
    this.timerIsRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const playIcon = document.getElementById('timer-play-icon');
    const pauseIcon = document.getElementById('timer-pause-icon');
    const toggleLabel = document.getElementById('timer-toggle-label');
    const statusBadge = document.getElementById('timer-status-badge');

    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
    if (toggleLabel) toggleLabel.textContent = 'Resume';
    if (statusBadge) statusBadge.textContent = 'PAUSED';
  }

  resetTimer() {
    sfx.playClick();
    this.pauseTimer();
    this.timerSecondsRemaining = this.timerTotalSeconds;

    const toggleLabel = document.getElementById('timer-toggle-label');
    const statusBadge = document.getElementById('timer-status-badge');
    if (toggleLabel) toggleLabel.textContent = 'Start Focus';
    if (statusBadge) statusBadge.textContent = 'READY';

    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const m = Math.floor(this.timerSecondsRemaining / 60);
    const s = this.timerSecondsRemaining % 60;
    const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    const displayEl = document.getElementById('timer-time-display');
    if (displayEl) displayEl.textContent = timeStr;

    // SVG Circular Ring Offset Calculation
    // Total circumference for r=115 is 2 * PI * 115 ~= 722.56
    const totalCircumference = 722.56;
    const progressFraction = this.timerTotalSeconds > 0
      ? (this.timerTotalSeconds - this.timerSecondsRemaining) / this.timerTotalSeconds
      : 0;
    const offset = totalCircumference * (1 - progressFraction);

    const ringProgress = document.getElementById('timer-ring-progress');
    if (ringProgress) {
      ringProgress.style.strokeDashoffset = offset;
    }

    // Dynamic browser title
    if (this.timerIsRunning) {
      document.title = `(${timeStr}) Level Up Focus`;
    } else {
      document.title = `LEVEL UP — Personal Growth System`;
    }
  }

  timerFinished() {
    this.pauseTimer();
    sfx.playTimerComplete();
    document.title = `Time's Up! — Level Up`;

    if (this.timerMode === 'focus' || this.timerMode === 'custom') {
      const subjectInput = document.getElementById('timer-subject-input');
      const subject = subjectInput ? (subjectInput.value.trim() || 'Deep Work') : 'Deep Work';
      const durationMins = Math.round(this.timerTotalSeconds / 60);

      // Auto save session
      const newSession = {
        id: "focus_" + Date.now(),
        subject,
        duration: durationMins,
        date: this.getTodayStr(),
        notes: `Pomodoro ${durationMins}m session completed`,
        xpReward: 25,
        createdAt: new Date().toISOString()
      };

      this.state.focusSessions.unshift(newSession);
      this.awardXP(25, `Focus Session Completed: ${subject} (${durationMins}m)`);
      this.saveData();

      alert(`🎉 Outstanding! Focus cycle of ${durationMins} minutes complete. +25 XP awarded.`);
    } else {
      alert(`🔔 Break over! Ready to dive back into deep work?`);
    }

    this.resetTimer();
    this.renderCurrentView();
  }

  manualLogSessionModal() {
    sfx.playClick();
    const modal = document.getElementById('modal-focus-log');
    document.getElementById('focus-log-subject').value = 'Algorithm Study';
    document.getElementById('focus-log-duration').value = '25';
    document.getElementById('focus-log-notes').value = '';
    modal.showModal();
  }

  saveFocusSessionFromModal() {
    const subject = document.getElementById('focus-log-subject').value.trim();
    const duration = Math.max(5, parseInt(document.getElementById('focus-log-duration').value, 10) || 25);
    const notes = document.getElementById('focus-log-notes').value.trim();

    if (!subject) {
      this.showToast("Please enter a subject", "danger");
      return;
    }

    const newSession = {
      id: "focus_" + Date.now(),
      subject,
      duration,
      date: this.getTodayStr(),
      notes,
      xpReward: 25,
      createdAt: new Date().toISOString()
    };

    this.state.focusSessions.unshift(newSession);
    this.awardXP(25, `Focus Session: ${subject} (${duration}m)`);
    this.saveData();

    if (this.currentUser && window.cloudSync) {
      window.cloudSync.syncFocusSessionSave(
        this.currentUser.id,
        newSession,
        this.state.user.totalXP,
        this.state.user.level
      );
    }

    this.closeModal('modal-focus-log');
    this.renderCurrentView();
  }

  getWeeklyFocusMinutes() {
    const oneDayMs = 86400000;
    const nowTime = new Date().getTime();
    const sevenDaysAgoStr = new Date(nowTime - 7 * oneDayMs).toISOString().split('T')[0];
    return this.state.focusSessions
      .filter(s => s.date >= sevenDaysAgoStr)
      .reduce((acc, s) => acc + (s.duration || 0), 0);
  }

  renderFocus() {
    const todayStr = this.getTodayStr();
    const todaySessions = this.state.focusSessions.filter(s => s.date === todayStr);
    const todayMins = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const weekMins = this.getWeeklyFocusMinutes();
    const totalSessions = this.state.focusSessions.length;
    const totalFocusXP = this.state.focusSessions.reduce((acc, s) => acc + (s.xpReward || 25), 0);

    const statToday = document.getElementById('focus-stat-today');
    const statWeek = document.getElementById('focus-stat-week');
    const statCount = document.getElementById('focus-stat-count');
    const statXp = document.getElementById('focus-stat-xp');
    const countLabel = document.getElementById('focus-log-count-label');

    if (statToday) statToday.textContent = `${todayMins} mins`;
    if (statWeek) statWeek.textContent = `${weekMins} mins (${(weekMins / 60).toFixed(1)} hrs)`;
    if (statCount) statCount.textContent = totalSessions;
    if (statXp) statXp.textContent = `${totalFocusXP} XP`;
    if (countLabel) countLabel.textContent = `${totalSessions} logged`;

    // Render session log
    const container = document.getElementById('focus-sessions-container');
    if (!container) return;

    if (this.state.focusSessions.length === 0) {
      container.innerHTML = `
        <div class="empty-state text-center" style="padding: 2rem; color: var(--text-muted);">
          <p>No focus sessions recorded yet. Start your first 25m cycle!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.state.focusSessions.slice(0, 15).map(session => `
      <div class="focus-session-item">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <strong class="text-white">${this.escapeHTML(session.subject)}</strong>
            <span class="workout-duration-badge">${session.duration} mins</span>
            <span class="chip-xp">+${session.xpReward || 25} XP</span>
          </div>
          ${session.notes ? `<p class="text-secondary text-sm" style="margin-top: 0.2rem;">${this.escapeHTML(session.notes)}</p>` : ''}
          <span class="text-secondary text-sm" style="display:block; margin-top: 0.2rem;">📅 ${this.formatDateNice(session.date)}</span>
        </div>
        <button type="button" class="action-icon-btn delete-btn" onclick="app.confirmDelete('focus', '${session.id}')" title="Delete Session">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // VIEW 6: DAILY JOURNAL
  // --------------------------------------------------------------------------
  changeJournalDate(offsetDays) {
    sfx.playClick();
    const [y, m, d] = this.activeJournalDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + offsetDays);

    const ny = dateObj.getFullYear();
    const nm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const nd = String(dateObj.getDate()).padStart(2, '0');
    this.loadJournalForDate(`${ny}-${nm}-${nd}`);
  }

  loadJournalForDate(dateStr) {
    if (!dateStr) return;
    this.activeJournalDate = dateStr;

    const dateInput = document.getElementById('journal-date-input');
    if (dateInput) dateInput.value = dateStr;

    const badgeEl = document.getElementById('journal-current-date-badge');
    if (badgeEl) badgeEl.textContent = this.formatDateNice(dateStr);

    const entry = this.state.journals[dateStr] || {};
    document.getElementById('journal-well').value = entry.well || '';
    document.getElementById('journal-improve').value = entry.improve || '';
    document.getElementById('journal-learned').value = entry.learned || '';
    document.getElementById('journal-priorities').value = entry.priorities || '';

    const statusEl = document.getElementById('journal-status-text');
    if (statusEl) {
      statusEl.textContent = entry.updatedAt ? `Saved on ${new Date(entry.updatedAt).toLocaleTimeString()}` : 'Draft ready';
    }

    const feedbackEl = document.getElementById('journal-save-feedback');
    if (feedbackEl) feedbackEl.textContent = '';
  }

  saveJournalEntry() {
    const well = document.getElementById('journal-well').value.trim();
    const improve = document.getElementById('journal-improve').value.trim();
    const learned = document.getElementById('journal-learned').value.trim();
    const priorities = document.getElementById('journal-priorities').value.trim();

    if (!well && !improve && !learned && !priorities) {
      this.showToast("Please write at least one thought before saving.", "danger");
      return;
    }

    const dateStr = this.activeJournalDate;
    const isFirstTimeToday = !this.state.journals[dateStr] && (dateStr === this.getTodayStr());

    this.state.journals[dateStr] = {
      well,
      improve,
      learned,
      priorities,
      updatedAt: new Date().toISOString()
    };

    if (isFirstTimeToday) {
      this.awardXP(15, "Daily Journal Reflection completed");
    } else {
      sfx.playClick();
      this.showToast("Journal entry saved successfully!", "lime");
    }

    this.saveData();

    if (this.currentUser && window.cloudSync) {
      window.cloudSync.syncJournalSave(
        this.currentUser.id,
        dateStr,
        this.state.journals[dateStr],
        this.state.user.totalXP,
        this.state.user.level
      );
    }

    const statusEl = document.getElementById('journal-status-text');
    if (statusEl) statusEl.textContent = `Saved just now`;

    this.renderJournalHistory();
  }

  renderJournal() {
    this.loadJournalForDate(this.activeJournalDate);
    this.renderJournalHistory();
  }

  renderJournalHistory() {
    const container = document.getElementById('journal-history-container');
    const totalCountEl = document.getElementById('journal-total-count');
    if (!container) return;

    const dates = Object.keys(this.state.journals).sort().reverse();
    if (totalCountEl) totalCountEl.textContent = `${dates.length} entries recorded`;

    if (dates.length === 0) {
      container.innerHTML = `
        <div class="empty-state text-center" style="padding: 2rem; color: var(--text-muted);">
          <p>No past journal entries yet. Complete today's reflection to start your archive.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = dates.map(dStr => {
      const entry = this.state.journals[dStr];
      return `
        <div class="journal-archive-card">
          <div class="journal-archive-header">
            <span class="journal-archive-date">📅 ${this.formatDateNice(dStr)}</span>
            <button type="button" class="btn btn-secondary btn-sm" onclick="app.loadJournalForDate('${dStr}')">
              Edit / View
            </button>
          </div>
          <div class="journal-archive-grid">
            ${entry.well ? `
              <div class="journal-mini-section">
                <span class="journal-mini-label">✨ What Went Well:</span>
                <p class="journal-mini-text">${this.escapeHTML(entry.well)}</p>
              </div>
            ` : ''}
            ${entry.improve ? `
              <div class="journal-mini-section">
                <span class="journal-mini-label">🔍 To Improve:</span>
                <p class="journal-mini-text">${this.escapeHTML(entry.improve)}</p>
              </div>
            ` : ''}
            ${entry.learned ? `
              <div class="journal-mini-section">
                <span class="journal-mini-label">💡 Key Learnings:</span>
                <p class="journal-mini-text">${this.escapeHTML(entry.learned)}</p>
              </div>
            ` : ''}
            ${entry.priorities ? `
              <div class="journal-mini-section">
                <span class="journal-mini-label">🎯 Tomorrow's Priorities:</span>
                <p class="journal-mini-text">${this.escapeHTML(entry.priorities)}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // --------------------------------------------------------------------------
  // VIEW 7: PROGRESS & ACHIEVEMENTS
  // --------------------------------------------------------------------------
  setBadgeFilter(filter) {
    this.activeBadgeFilter = filter;
    document.querySelectorAll('[data-badge-filter]').forEach(b => {
      b.classList.toggle('active', b.dataset.badgeFilter === filter);
    });
    this.renderAchievements();
  }

  renderProgress() {
    const details = this.calculateLevelDetails(this.state.user.totalXP);
    const { currentStreak, bestStreak } = this.calculateStreaks();

    const lvlVal = document.getElementById('prog-level-val');
    const lvlTitle = document.getElementById('prog-level-title');
    const xpVal = document.getElementById('prog-xp-val');
    const xpSub = document.getElementById('prog-xp-needed-sub');
    const streakVal = document.getElementById('prog-streak-val');
    const bestStreakSub = document.getElementById('prog-best-streak-sub');

    if (lvlVal) lvlVal.textContent = details.level;
    if (lvlTitle) lvlTitle.textContent = details.rankTitle;
    if (xpVal) xpVal.textContent = `${this.state.user.totalXP} XP`;
    if (xpSub) xpSub.textContent = `${details.xpNeeded} XP to Level ${details.level + 1}`;
    if (streakVal) streakVal.textContent = `${currentStreak} Days`;
    if (bestStreakSub) bestStreakSub.textContent = `All-time best: ${bestStreak} days`;

    // Render Native Pure SVG Chart
    this.renderActivityChart();

    // Render Achievements
    this.renderAchievements();
  }

  renderActivityChart() {
    const wrapper = document.getElementById('activity-chart-wrapper');
    if (!wrapper) return;

    // Last 7 days data
    const daysData = [];
    const oneDayMs = 86400000;
    const nowTime = new Date().getTime();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(nowTime - (i * oneDayMs));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Count habits completed on that day
      const habitsDone = this.state.habits.filter(h => h.history && h.history[dStr]).length;

      // Focus minutes on that day
      const focusMins = this.state.focusSessions
        .filter(s => s.date === dStr)
        .reduce((acc, s) => acc + (s.duration || 0), 0);

      daysData.push({ date: dStr, label: dayName, habits: habitsDone, focus: focusMins });
    }

    // SVG Dimensions
    const svgWidth = 800;
    const svgHeight = 220;
    const padding = { top: 25, right: 30, bottom: 35, left: 45 };
    const chartW = svgWidth - padding.left - padding.right;
    const chartH = svgHeight - padding.top - padding.bottom;

    const maxHabits = Math.max(5, ...daysData.map(d => d.habits));
    const maxFocus = Math.max(60, ...daysData.map(d => d.focus));

    const slotWidth = chartW / daysData.length;
    const barWidth = 18;

    let barsSvg = '';
    let labelsSvg = '';
    let gridLinesSvg = '';

    // Horizontal grid lines (3 levels)
    for (let g = 0; g <= 3; g++) {
      const yPos = padding.top + (chartH / 3) * g;
      gridLinesSvg += `<line x1="${padding.left}" y1="${yPos}" x2="${svgWidth - padding.right}" y2="${yPos}" stroke="#222523" stroke-width="1" stroke-dasharray="4" />`;
    }

    daysData.forEach((day, idx) => {
      const centerX = padding.left + (idx * slotWidth) + (slotWidth / 2);

      // Habit Bar (Lime)
      const habitBarH = Math.max(4, (day.habits / maxHabits) * chartH);
      const habitBarY = padding.top + (chartH - habitBarH);
      const habitX = centerX - barWidth - 2;

      // Focus Bar (Purple)
      const focusBarH = Math.max(4, (day.focus / maxFocus) * chartH);
      const focusBarY = padding.top + (chartH - focusBarH);
      const focusX = centerX + 2;

      barsSvg += `
        <!-- Habit Bar -->
        <rect x="${habitX}" y="${habitBarY}" width="${barWidth}" height="${habitBarH}" rx="4" fill="#A6F000">
          <title>${day.label}: ${day.habits} Habits Completed</title>
        </rect>
        <text x="${habitX + barWidth / 2}" y="${habitBarY - 6}" font-size="10" fill="#A6F000" font-weight="700" text-anchor="middle">${day.habits}</text>

        <!-- Focus Bar -->
        <rect x="${focusX}" y="${focusBarY}" width="${barWidth}" height="${focusBarH}" rx="4" fill="#c084fc">
          <title>${day.label}: ${day.focus} Focus Minutes</title>
        </rect>
        <text x="${focusX + barWidth / 2}" y="${focusBarY - 6}" font-size="10" fill="#c084fc" font-weight="700" text-anchor="middle">${day.focus}m</text>
      `;

      labelsSvg += `
        <text x="${centerX}" y="${svgHeight - 10}" font-size="12" fill="#A0A49F" font-weight="600" text-anchor="middle">${day.label}</text>
      `;
    });

    wrapper.innerHTML = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%" style="overflow: visible;">
        ${gridLinesSvg}
        ${barsSvg}
        ${labelsSvg}
      </svg>
    `;
  }

  checkAchievements() {
    const { bestStreak } = this.calculateStreaks();
    const totalHabitsCompleted = this.state.habits.reduce((acc, h) => {
      return acc + Object.keys(h.history || {}).length;
    }, 0);
    const totalWorkouts = this.state.workouts.length;
    const totalFocus = this.state.focusSessions.length;
    const totalJournals = Object.keys(this.state.journals).length;
    const level = this.state.user.level;

    const conditionMap = {
      first_habit: totalHabitsCompleted >= 1,
      streak_3: bestStreak >= 3,
      streak_7: bestStreak >= 7,
      streak_30: bestStreak >= 30,
      first_focus: totalFocus >= 1,
      focus_10: totalFocus >= 10,
      first_workout: totalWorkouts >= 1,
      workout_10: totalWorkouts >= 10,
      journal_5: totalJournals >= 5,
      level_5: level >= 5
    };

    let newlyUnlocked = false;

    this.state.achievements.forEach(ach => {
      if (!ach.unlocked && conditionMap[ach.id]) {
        ach.unlocked = true;
        ach.unlockedAt = this.getTodayStr();
        newlyUnlocked = true;
        this.showToast(`🏆 Trophy Unlocked: ${ach.title}!`, 'lime');
        if (this.currentUser && window.cloudSync) {
          window.cloudSync.syncAchievementUnlock(this.currentUser.id, ach);
        }
      }
    });

    if (newlyUnlocked) {
      sfx.playLevelUp();
      this.saveData();
    }
  }

  renderAchievements() {
    this.checkAchievements();
    const container = document.getElementById('achievements-container');
    const badgeCountEl = document.getElementById('prog-badge-count');
    const badgePctEl = document.getElementById('prog-badge-pct');
    if (!container) return;

    const unlockedCount = this.state.achievements.filter(a => a.unlocked).length;
    const total = this.state.achievements.length;
    const pct = Math.round((unlockedCount / total) * 100);

    if (badgeCountEl) badgeCountEl.textContent = `${unlockedCount} / ${total}`;
    if (badgePctEl) badgePctEl.textContent = `${pct}% completed`;

    let list = this.state.achievements;
    if (this.activeBadgeFilter === 'unlocked') {
      list = list.filter(a => a.unlocked);
    } else if (this.activeBadgeFilter === 'locked') {
      list = list.filter(a => !a.unlocked);
    }

    container.innerHTML = list.map(ach => `
      <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-badge-icon">${ach.icon}</div>
        <div class="achievement-info">
          <h4 class="achievement-name">${this.escapeHTML(ach.title)}</h4>
          <p class="achievement-desc">${this.escapeHTML(ach.desc)}</p>
          ${ach.unlocked ? `
            <div class="achievement-unlocked-date">Unlocked: ${ach.unlockedAt || 'Earned'}</div>
          ` : `
            <div class="achievement-progress-wrap">
              <span class="text-secondary" style="font-size: 0.7rem; font-weight: 600;">LOCKED</span>
            </div>
          `}
        </div>
      </div>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // VIEW 8: SETTINGS & DATA MANAGEMENT
  // --------------------------------------------------------------------------
  renderSettings() {
    const nameInput = document.getElementById('settings-user-name');
    if (nameInput) nameInput.value = this.state.user.name || 'Champion';

    const soundToggle = document.getElementById('settings-sound-toggle');
    if (soundToggle) soundToggle.checked = Boolean(this.state.settings.soundEnabled);
  }

  saveProfileSettings() {
    const nameInput = document.getElementById('settings-user-name');
    if (!nameInput) return;
    const newName = nameInput.value.trim() || 'Champion';
    this.state.user.name = newName;
    this.saveData();
    this.showToast(`Display name updated to "${newName}"`, 'lime');
  }

  toggleSoundPreference(enabled) {
    this.state.settings.soundEnabled = Boolean(enabled);
    sfx.enabled = Boolean(enabled);
    this.saveData();
    if (enabled) sfx.playXpReward();
    this.showToast(enabled ? "Sound effects enabled" : "Sound effects muted", 'lime');
  }

  exportDataJSON() {
    sfx.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `levelup_backup_${this.getTodayStr()}.json`;
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast("Backup exported successfully!", "lime");
  }

  importDataJSON(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        // Schema Validation
        if (!parsed || typeof parsed !== 'object') {
          throw new Error("Invalid JSON structure");
        }
        if (!parsed.user || !Array.isArray(parsed.habits) || !Array.isArray(parsed.tasks)) {
          throw new Error("JSON file is missing required growth system fields (user, habits, tasks).");
        }

        // Apply imported state cleanly
        this.state = {
          user: { ...DEFAULT_APP_STATE.user, ...(parsed.user || {}) },
          habits: parsed.habits,
          tasks: parsed.tasks,
          goals: Array.isArray(parsed.goals) ? parsed.goals : [],
          workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
          focusSessions: Array.isArray(parsed.focusSessions) ? parsed.focusSessions : [],
          journals: parsed.journals || {},
          achievements: this.mergeAchievements(parsed.achievements),
          settings: { ...DEFAULT_APP_STATE.settings, ...(parsed.settings || {}) }
        };

        this.saveData();
        this.showToast("Growth data imported successfully!", "lime");
        this.renderCurrentView();
      } catch (err) {
        alert("Failed to import data: " + err.message);
      }
    };
    reader.readAsText(file);
    // Reset file input so re-uploading same file triggers change
    event.target.value = '';
  }

  openResetConfirmModal() {
    sfx.playClick();
    const modal = document.getElementById('modal-confirm-reset');
    const input = document.getElementById('reset-confirm-input');
    if (input) input.value = '';
    modal.showModal();
  }

  async executeResetAllData() {
    const input = document.getElementById('reset-confirm-input');
    if (!input || input.value.trim().toUpperCase() !== 'RESET') {
      alert("Please type RESET exactly into the confirmation box to proceed.");
      return;
    }

    this.state = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
    this.saveData();

    if (this.currentUser && window.cloudSync) {
      try {
        await window.cloudSync.uploadEntireState(this.currentUser.id, this.state);
      } catch (e) {
        console.error("Cloud reset error:", e);
      }
    }

    this.closeModal('modal-confirm-reset');
    this.showToast("All data has been reset to defaults.", "lime");
    this.renderCurrentView();
  }

  // --------------------------------------------------------------------------
  // Delete Confirmation Framework
  // --------------------------------------------------------------------------
  confirmDelete(type, id) {
    sfx.playClick();
    this.pendingDelete = { type, id };
    const modal = document.getElementById('modal-confirm-delete');
    const msg = document.getElementById('confirm-delete-msg');

    const typeNames = {
      habit: 'this habit and its completion history',
      task: 'this daily task',
      goal: 'this milestone goal',
      workout: 'this workout log entry',
      focus: 'this focus session log'
    };

    if (msg) msg.textContent = `Are you sure you want to permanently delete ${typeNames[type] || 'this item'}?`;

    const btn = document.getElementById('btn-execute-delete');
    if (btn) {
      btn.onclick = () => this.executeDelete();
    }

    modal.showModal();
  }

  executeDelete() {
    if (!this.pendingDelete) return;
    const { type, id } = this.pendingDelete;
    const todayStr = this.getTodayStr();

    if (type === 'habit') {
      const habit = this.state.habits.find(h => h.id === id);
      if (habit && habit.history && habit.history[todayStr]) {
        // Reverse today's XP if completed today
        this.deductXP(habit.xpReward, "Habit deleted");
      }
      this.state.habits = this.state.habits.filter(h => h.id !== id);
      this.showToast("Habit deleted", "lime");
    } else if (type === 'task') {
      const task = this.state.tasks.find(t => t.id === id);
      if (task && task.completed) {
        this.deductXP(task.xpReward, "Completed task deleted");
      }
      this.state.tasks = this.state.tasks.filter(t => t.id !== id);
      this.showToast("Task deleted", "lime");
    } else if (type === 'goal') {
      const goal = this.state.goals.find(g => g.id === id);
      if (goal && goal.completed) {
        this.deductXP(goal.xpReward || 100, "Completed goal deleted");
      }
      this.state.goals = this.state.goals.filter(g => g.id !== id);
      this.showToast("Goal deleted", "lime");
    } else if (type === 'workout') {
      const workout = this.state.workouts.find(w => w.id === id);
      if (workout) {
        this.deductXP(workout.xpReward || 35, "Workout record removed");
      }
      this.state.workouts = this.state.workouts.filter(w => w.id !== id);
      this.showToast("Workout log deleted", "lime");
    } else if (type === 'focus') {
      const session = this.state.focusSessions.find(s => s.id === id);
      if (session) {
        this.deductXP(session.xpReward || 25, "Focus session removed");
      }
      this.state.focusSessions = this.state.focusSessions.filter(s => s.id !== id);
      this.showToast("Focus session deleted", "lime");
    }

    this.pendingDelete = null;
    this.saveData();

    if (this.currentUser && window.cloudSync) {
      window.cloudSync.syncDelete(
        this.currentUser.id,
        type,
        id,
        this.state.user.totalXP,
        this.state.user.level
      );
    }

    this.closeModal('modal-confirm-delete');
    this.renderCurrentView();
  }

  // --------------------------------------------------------------------------
  // Modals & UI Utilities
  // --------------------------------------------------------------------------
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.close();
  }

  showToast(message, type = 'lime') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'lime' ? '⚡' : '⚠️';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span>${this.escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  refreshQuote() {
    sfx.playClick();
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    const quote = MOTIVATIONAL_QUOTES[idx];
    const textEl = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');
    if (textEl) textEl.textContent = `"${quote.text}"`;
    if (authorEl) authorEl.textContent = `— ${quote.author}`;
  }

  // --------------------------------------------------------------------------
  // Cloud Auth & Session Controller
  // --------------------------------------------------------------------------
  showAuthScreen() {
    this.hideInitialLoader();
    const authScreen = document.getElementById('auth-screen');
    const appLayout = document.getElementById('app-layout');
    if (authScreen) authScreen.classList.remove('hidden');
    if (appLayout) appLayout.classList.add('hidden');
  }

  hideAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    const appLayout = document.getElementById('app-layout');
    if (authScreen) authScreen.classList.add('hidden');
    if (appLayout) appLayout.classList.remove('hidden');
  }

  hideInitialLoader() {
    const loader = document.getElementById('app-initial-loader');
    if (loader) loader.classList.add('hidden');
  }

  switchAuthMode(mode) {
    this.authMode = mode;
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const nameGroup = document.getElementById('group-signup-name');
    const authForm = document.getElementById('auth-form');
    const forgotForm = document.getElementById('auth-forgot-form');
    const submitText = document.getElementById('btn-auth-text');
    const alertBox = document.getElementById('auth-alert');
    if (alertBox) alertBox.classList.add('hidden');

    if (mode === 'forgot') {
      if (authForm) authForm.classList.add('hidden');
      if (forgotForm) forgotForm.classList.remove('hidden');
      return;
    }

    if (authForm) authForm.classList.remove('hidden');
    if (forgotForm) forgotForm.classList.add('hidden');

    if (mode === 'signup') {
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabSignup) tabSignup.classList.add('active');
      if (nameGroup) nameGroup.classList.remove('hidden');
      if (submitText) submitText.textContent = "Create Free Account";
    } else {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabSignup) tabSignup.classList.remove('active');
      if (nameGroup) nameGroup.classList.add('hidden');
      if (submitText) submitText.textContent = "Sign In to Dashboard";
    }
  }

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  showAuthAlert(message, type = 'danger') {
    const alertBox = document.getElementById('auth-alert');
    if (!alertBox) return;
    alertBox.className = `auth-alert ${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
  }

  async handleAuthSubmit() {
    if (!window.cloudSync) return;
    const emailInput = document.getElementById('auth-email');
    const passInput = document.getElementById('auth-password');
    const nameInput = document.getElementById('auth-display-name');
    const submitBtn = document.getElementById('btn-auth-submit');
    const alertBox = document.getElementById('auth-alert');

    const email = emailInput ? emailInput.value : '';
    const password = passInput ? passInput.value : '';
    const name = nameInput ? nameInput.value : 'Champion';

    if (submitBtn) submitBtn.disabled = true;
    if (alertBox) alertBox.classList.add('hidden');

    try {
      if (this.authMode === 'signup') {
        const data = await window.cloudSync.signUp(email, password, name);
        if (data.user && !data.session) {
          this.showAuthAlert("Account created! Please check your email inbox to confirm your address, or sign in.", "info");
        } else if (data.session) {
          this.showToast("Account created successfully! Welcome to LEVEL UP.", "lime");
        }
      } else {
        await window.cloudSync.signIn(email, password);
        this.showToast("Welcome back, Champion!", "lime");
      }
    } catch (err) {
      this.showAuthAlert(err.message || "Authentication error", "danger");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  async handleForgotSubmit() {
    if (!window.cloudSync) return;
    const emailInput = document.getElementById('auth-forgot-email');
    const submitBtn = document.getElementById('btn-forgot-submit');
    const email = emailInput ? emailInput.value : '';

    if (submitBtn) submitBtn.disabled = true;

    try {
      await window.cloudSync.resetPassword(email);
      this.showAuthAlert("Password reset link sent! Check your inbox.", "success");
    } catch (err) {
      this.showAuthAlert(err.message || "Failed to send reset link", "danger");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  async handleUpdatePasswordSubmit() {
    if (!window.cloudSync) return;
    const passInput = document.getElementById('recovery-new-password');
    const btn = document.getElementById('btn-save-new-password');
    const pass = passInput ? passInput.value : '';

    if (btn) btn.disabled = true;

    try {
      await window.cloudSync.updatePassword(pass);
      this.closeModal('modal-update-password');
      this.showToast("Password updated successfully!", "lime");
    } catch (err) {
      alert("Failed to update password: " + err.message);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async signOut() {
    if (window.cloudSync) {
      await window.cloudSync.signOut();
    }
    this.currentUser = null;
    this.state = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
    this.showAuthScreen();
    this.showToast("Signed out of LEVEL UP", "lime");
  }

  // --------------------------------------------------------------------------
  // Cloud Sync Status & User Session Lifecycle
  // --------------------------------------------------------------------------
  async onUserAuthenticated(user) {
    this.currentUser = user;
    this.hideInitialLoader();
    this.hideAuthScreen();

    const sidebarAvatar = document.getElementById('sidebar-user-avatar');
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarEmail = document.getElementById('sidebar-user-email');
    const welcomeHeading = document.getElementById('welcome-heading');
    const settingsEmail = document.getElementById('settings-account-email');

    const email = user.email || '';
    const fullName = user.user_metadata?.full_name || email.split('@')[0] || 'Champion';

    if (sidebarAvatar) sidebarAvatar.textContent = (fullName[0] || 'C').toUpperCase();
    if (sidebarName) sidebarName.textContent = fullName;
    if (sidebarEmail) sidebarEmail.textContent = email;
    if (welcomeHeading) welcomeHeading.textContent = `Welcome back, ${fullName}!`;
    if (settingsEmail) settingsEmail.textContent = email;

    // Load cloud data from Supabase
    try {
      if (window.cloudSync) {
        const result = await window.cloudSync.loadUserData(user.id);
        if (result && result.hasData) {
          this.state = {
            user: { ...DEFAULT_APP_STATE.user, ...result.state.user },
            habits: result.state.habits,
            tasks: result.state.tasks,
            goals: result.state.goals,
            workouts: result.state.workouts,
            focusSessions: result.state.focusSessions,
            journals: result.state.journals,
            achievements: this.applyAchievementsMap(result.state.achievementsMap),
            settings: { ...DEFAULT_APP_STATE.settings, ...result.state.settings }
          };
          localStorage.setItem(this.getStorageKey(), JSON.stringify(this.state));
        } else {
          // Check if local legacy data exists to prompt for migration
          const legacyData = this.checkLegacyLocalData();
          if (legacyData) {
            this.pendingLocalMigration = legacyData;
            this.openMigrationModal();
          } else {
            // First time cloud user: initialize with defaults under user ownership
            this.state = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
            this.state.user.name = fullName;
            await window.cloudSync.uploadEntireState(user.id, this.state);
            localStorage.setItem(this.getStorageKey(), JSON.stringify(this.state));
          }
        }
      }
    } catch (err) {
      console.warn('[LevelUp] Cloud load fallback to local cache:', err);
      this.state = this.loadData();
      this.showToast("Loaded from local offline cache", "info");
    }

    this.updateHeaderStats();
    this.updateTimerDisplay();
    this.renderCurrentView();
  }

  applyAchievementsMap(map) {
    const list = JSON.parse(JSON.stringify(DEFAULT_APP_STATE.achievements));
    if (!map || typeof map !== 'object') return list;

    list.forEach(a => {
      if (map[a.id]) {
        a.unlocked = Boolean(map[a.id].unlocked);
        a.unlockedAt = map[a.id].unlockedAt || null;
      }
    });
    return list;
  }

  checkLegacyLocalData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const hasCustomHabits = Array.isArray(parsed.habits) && parsed.habits.some(h => Object.keys(h.history || {}).length > 0 || !h.id.startsWith('habit_'));
      const hasCustomTasks = Array.isArray(parsed.tasks) && (parsed.tasks.length > 2 || parsed.tasks.some(t => t.completed));
      const hasWorkouts = Array.isArray(parsed.workouts) && parsed.workouts.length > 0;
      const hasFocus = Array.isArray(parsed.focusSessions) && parsed.focusSessions.length > 0;
      const hasJournals = parsed.journals && Object.keys(parsed.journals).length > 0;
      const hasXP = parsed.user && parsed.user.totalXP > 0;

      if (hasCustomHabits || hasCustomTasks || hasWorkouts || hasFocus || hasJournals || hasXP) {
        return parsed;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  openMigrationModal() {
    const modal = document.getElementById('modal-migrate-local-data');
    if (modal) modal.showModal();
  }

  async executeLocalDataMigration() {
    if (!this.currentUser || !window.cloudSync) return;
    const btn = document.getElementById('btn-confirm-migrate');
    if (btn) btn.disabled = true;

    try {
      const dataToMigrate = this.pendingLocalMigration || this.loadData();
      await window.cloudSync.uploadEntireState(this.currentUser.id, dataToMigrate);
      this.state = dataToMigrate;
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.state));
      localStorage.setItem(`${STORAGE_KEY}_backup_${Date.now()}`, localStorage.getItem(STORAGE_KEY));
      this.showToast("Local data successfully migrated to your cloud account!", "lime");
      this.closeModal('modal-migrate-local-data');
      this.renderCurrentView();
    } catch (err) {
      alert("Migration failed: " + err.message);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  declineLocalDataMigration() {
    this.closeModal('modal-migrate-local-data');
    this.showToast("Using fresh cloud profile.", "info");
  }

  async triggerManualSync() {
    if (!this.currentUser || !window.cloudSync) {
      this.showToast("You are currently offline or not logged in.", "danger");
      return;
    }
    this.showToast("Syncing with Supabase cloud...", "info");
    try {
      const result = await window.cloudSync.loadUserData(this.currentUser.id);
      if (result && result.hasData) {
        this.state = {
          user: { ...DEFAULT_APP_STATE.user, ...result.state.user },
          habits: result.state.habits,
          tasks: result.state.tasks,
          goals: result.state.goals,
          workouts: result.state.workouts,
          focusSessions: result.state.focusSessions,
          journals: result.state.journals,
          achievements: this.applyAchievementsMap(result.state.achievementsMap),
          settings: { ...DEFAULT_APP_STATE.settings, ...result.state.settings }
        };
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.state));
        this.updateHeaderStats();
        this.renderCurrentView();
        this.showToast("Cloud synchronization complete!", "lime");
      }
    } catch (err) {
      this.showToast("Sync failed: " + err.message, "danger");
    }
  }

  updateSyncUI(status, message) {
    const dot = document.getElementById('header-sync-dot');
    const text = document.getElementById('header-sync-text');
    const badge = document.getElementById('settings-sync-badge');
    const statusText = document.getElementById('settings-sync-status-text');

    if (!dot || !text) return;

    dot.className = 'sync-dot';

    switch (status) {
      case 'synced':
        dot.classList.remove('syncing', 'error', 'offline');
        text.textContent = 'Cloud Synced';
        if (badge) { badge.className = 'badge-lime'; badge.textContent = 'CONNECTED'; }
        if (statusText) { statusText.className = 'text-lime font-medium'; statusText.textContent = 'Synced'; }
        break;
      case 'syncing':
        dot.classList.add('syncing');
        text.textContent = 'Syncing...';
        if (badge) { badge.className = 'badge-lime'; badge.textContent = 'SYNCING'; }
        if (statusText) { statusText.className = 'text-secondary font-medium'; statusText.textContent = 'Syncing...'; }
        break;
      case 'offline':
        dot.classList.add('offline');
        text.textContent = 'Offline';
        if (badge) { badge.className = 'badge-lime'; badge.textContent = 'OFFLINE'; }
        if (statusText) { statusText.className = 'text-muted font-medium'; statusText.textContent = 'Offline (Saved locally)'; }
        break;
      case 'error':
        dot.classList.add('error');
        text.textContent = 'Sync Error';
        if (badge) { badge.className = 'badge-lime'; badge.textContent = 'ERROR'; }
        if (statusText) { statusText.className = 'text-danger font-medium'; statusText.textContent = message || 'Sync Error'; }
        break;
      case 'unconfigured':
        dot.classList.add('offline');
        text.textContent = 'Setup Needed';
        if (badge) { badge.className = 'badge-lime'; badge.textContent = 'UNCONFIGURED'; }
        if (statusText) { statusText.className = 'text-secondary font-medium'; statusText.textContent = 'Setup required in supabase-config.js'; }
        break;
    }
  }

  setupEventListeners() {
    // Nav Button listeners
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view) this.navTo(view);
      });
    });

    // Mobile Hamburger
    const menuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Audio button in header
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        this.toggleSoundPreference(!this.state.settings.soundEnabled);
      });
    }

    // Refresh quote button
    const quoteBtn = document.getElementById('refresh-quote-btn');
    if (quoteBtn) {
      quoteBtn.addEventListener('click', () => this.refreshQuote());
    }

    // Close dialog when clicking backdrop
    document.querySelectorAll('.app-dialog').forEach(dialog => {
      dialog.addEventListener('click', (e) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          dialog.close();
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Initializer
  // --------------------------------------------------------------------------
  async init() {
    // 1. Check if Supabase configuration is present
    if (window.isSupabaseConfigured && !window.isSupabaseConfigured()) {
      const banner = document.getElementById('auth-config-warning');
      if (banner) banner.classList.remove('hidden');
    }

    // 2. Attach Cloud Sync status listener
    if (window.cloudSync) {
      window.cloudSync.onStatusChange((status, message) => {
        this.updateSyncUI(status, message);
      });
    }

    // 3. UI Event Listeners
    this.setupEventListeners();

    // 4. Initial session check and authentication state subscription
    if (window.cloudSync && window.cloudSync.client) {
      // Check existing session
      const { session } = await window.cloudSync.getSession();
      if (session && session.user) {
        await this.onUserAuthenticated(session.user);
      } else {
        this.showAuthScreen();
      }

      // Listen for auth state changes
      window.cloudSync.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          const passModal = document.getElementById('modal-update-password');
          if (passModal) passModal.showModal();
        }

        if (session && session.user) {
          if (!this.currentUser || this.currentUser.id !== session.user.id) {
            await this.onUserAuthenticated(session.user);
          }
        } else {
          this.currentUser = null;
          this.showAuthScreen();
        }
      });
    } else {
      this.hideInitialLoader();
      this.showAuthScreen();
    }
  }
}

// Global App Instance
const app = new LevelUpApplication();

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
