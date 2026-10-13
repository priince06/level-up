/**
 * ============================================================================
 * LEVEL UP — Personal Growth System
 * Cloud Synchronization & Supabase Integration Engine
 * ============================================================================
 * Handles:
 * - Supabase Client Lifecycle & Auth State Management
 * - Email/Password Signup, Login, Logout, Session Persistence, Password Reset
 * - Bi-directional Cloud Synchronization with PostgreSQL
 * - Row-Level-Security (RLS) Compliant Queries
 * - Duplicate Prevention (Habit Completions, XP, Tasks, Journals)
 * - Safe LocalStorage Migration with User Confirmation
 * - Network Resilience & Real-time Sync Status Reporting
 * ============================================================================
 */

'use strict';

class CloudSyncService {
  constructor() {
    this.client = null;
    this.status = 'unconfigured'; // 'unconfigured' | 'offline' | 'syncing' | 'synced' | 'error'
    this.statusListeners = [];
    this.currentUser = null;
    this.syncQueue = [];
    this.isSyncing = false;

    this.initClient();
  }

  // --------------------------------------------------------------------------
  // Client Initialization
  // --------------------------------------------------------------------------
  initClient() {
    if (typeof window === 'undefined') return;

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      console.warn('[CloudSync] Supabase JS library not loaded yet.');
      this.setStatus('unconfigured', 'Supabase JS library not loaded.');
      return;
    }

    if (!window.isSupabaseConfigured || !window.isSupabaseConfigured()) {
      console.warn('[CloudSync] Supabase credentials have not been configured.');
      this.setStatus('unconfigured', 'Supabase credentials missing.');
      return;
    }

    try {
      this.client = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
          }
        }
      );
      this.setStatus(navigator.onLine ? 'synced' : 'offline');

      // Network status listeners
      window.addEventListener('online', () => {
        this.setStatus('synced', 'Back online');
        this.processSyncQueue();
      });
      window.addEventListener('offline', () => {
        this.setStatus('offline', 'Network offline');
      });
    } catch (err) {
      console.error('[CloudSync] Failed to initialize Supabase client:', err.message);
      this.setStatus('error', err.message);
    }
  }

  // --------------------------------------------------------------------------
  // Status Management & Observers
  // --------------------------------------------------------------------------
  setStatus(status, message = '') {
    this.status = status;
    this.statusListeners.forEach(listener => {
      try {
        listener(status, message);
      } catch (e) {
        console.error('[CloudSync] Status listener error:', e);
      }
    });
  }

  onStatusChange(callback) {
    if (typeof callback === 'function') {
      this.statusListeners.push(callback);
      // Immediately invoke with current state
      callback(this.status, '');
    }
  }

  // --------------------------------------------------------------------------
  // Authentication Workflows
  // --------------------------------------------------------------------------
  async getSession() {
    if (!this.client) return { session: null, error: new Error('Supabase client not initialized') };
    try {
      const { data, error } = await this.client.auth.getSession();
      if (error) throw error;
      this.currentUser = data.session ? data.session.user : null;
      return { session: data.session, user: this.currentUser, error: null };
    } catch (err) {
      return { session: null, user: null, error: err };
    }
  }

  onAuthStateChange(callback) {
    if (!this.client) return { data: { subscription: { unsubscribe: () => {} } } };
    return this.client.auth.onAuthStateChange((event, session) => {
      this.currentUser = session ? session.user : null;
      callback(event, session);
    });
  }

  async signUp(email, password, displayName = 'Champion') {
    if (!this.client) throw new Error('Supabase client not initialized. Check your credentials in supabase-config.js.');
    
    // Clean input
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (displayName || '').trim() || 'Champion';

    if (!cleanEmail || !password) {
      throw new Error('Please enter both an email address and a password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const { data, error } = await this.client.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: cleanName
        }
      }
    });

    if (error) throw error;
    this.currentUser = data.user;
    return data;
  }

  async signIn(email, password) {
    if (!this.client) throw new Error('Supabase client not initialized. Check your credentials in supabase-config.js.');

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    const { data, error } = await this.client.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (error) throw error;
    this.currentUser = data.user;
    return data;
  }

  async signOut() {
    if (!this.client) return;
    const { error } = await this.client.auth.signOut();
    this.currentUser = null;
    if (error) throw error;
  }

  async resetPassword(email) {
    if (!this.client) throw new Error('Supabase client not initialized.');
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) throw new Error('Please enter your account email.');

    const redirectUrl = window.location.origin + window.location.pathname;
    const { data, error } = await this.client.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl
    });
    if (error) throw error;
    return data;
  }

  async updatePassword(newPassword) {
    if (!this.client) throw new Error('Supabase client not initialized.');
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }
    const { data, error } = await this.client.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  }

  // --------------------------------------------------------------------------
  // Cloud Data Fetching & Reconstruction
  // --------------------------------------------------------------------------
  async loadUserData(userId) {
    if (!this.client || !userId) {
      throw new Error('Supabase client not ready or user ID missing.');
    }

    this.setStatus('syncing', 'Fetching cloud data...');

    try {
      // 1. Fetch User Profile
      const profilePromise = this.client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // 2. Fetch Habits
      const habitsPromise = this.client
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      // 3. Fetch Habit Completions
      const completionsPromise = this.client
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId);

      // 4. Fetch Tasks
      const tasksPromise = this.client
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      // 5. Fetch Goals
      const goalsPromise = this.client
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      // 6. Fetch Workouts
      const workoutsPromise = this.client
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('workout_date', { ascending: false });

      // 7. Fetch Focus Sessions
      const focusPromise = this.client
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: false });

      // 8. Fetch Journals
      const journalsPromise = this.client
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId);

      // 9. Fetch Achievements
      const achievementsPromise = this.client
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      // Execute queries in parallel
      const [
        profileRes,
        habitsRes,
        completionsRes,
        tasksRes,
        goalsRes,
        workoutsRes,
        focusRes,
        journalsRes,
        achievementsRes
      ] = await Promise.all([
        profilePromise,
        habitsPromise,
        completionsPromise,
        tasksPromise,
        goalsPromise,
        workoutsPromise,
        focusPromise,
        journalsPromise,
        achievementsPromise
      ]);

      // Check for errors (excluding table-not-found which indicates schema pending)
      const errors = [
        profileRes.error,
        habitsRes.error,
        completionsRes.error,
        tasksRes.error,
        goalsRes.error,
        workoutsRes.error,
        focusRes.error,
        journalsRes.error,
        achievementsRes.error
      ].filter(Boolean);

      if (errors.length > 0) {
        const firstErr = errors[0];
        console.error('[CloudSync] Error fetching cloud data:', firstErr);
        if (firstErr.code === 'PGRST205' || (firstErr.message && firstErr.message.includes('schema cache'))) {
          throw new Error('Database tables not found. Please run the supabase-schema.sql in your Supabase SQL Editor.');
        }
        throw new Error(firstErr.message || 'Failed to fetch cloud records');
      }

      // Reconstruct habits with their completion history
      const completionsByHabit = {};
      (completionsRes.data || []).forEach(row => {
        if (!completionsByHabit[row.habit_id]) {
          completionsByHabit[row.habit_id] = {};
        }
        completionsByHabit[row.habit_id][row.completed_date] = true;
      });

      const habits = (habitsRes.data || []).map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description || '',
        xpReward: Number(row.xp_reward) || 25,
        history: completionsByHabit[row.id] || {},
        createdAt: row.created_at
      }));

      // Reconstruct tasks
      const tasks = (tasksRes.data || []).map(row => ({
        id: row.id,
        title: row.title,
        priority: row.priority,
        deadline: row.deadline || '',
        isTop3: Boolean(row.is_top3),
        completed: Boolean(row.completed),
        completedDate: row.completed_date || null,
        xpReward: Number(row.xp_reward) || 20,
        createdAt: row.created_at
      }));

      // Reconstruct goals
      const goals = (goalsRes.data || []).map(row => ({
        id: row.id,
        title: row.title,
        category: row.category,
        deadline: row.deadline || '',
        completed: Boolean(row.completed),
        completedDate: row.completed_date || null,
        xpReward: Number(row.xp_reward) || 100,
        createdAt: row.created_at
      }));

      // Reconstruct workouts
      const workouts = (workoutsRes.data || []).map(row => ({
        id: row.id,
        type: row.type,
        duration: Number(row.duration) || 45,
        date: row.workout_date,
        notes: row.notes || '',
        xpReward: Number(row.xp_reward) || 35,
        createdAt: row.created_at ? row.created_at.split('T')[0] : row.workout_date
      }));

      // Reconstruct focus sessions
      const focusSessions = (focusRes.data || []).map(row => ({
        id: row.id,
        subject: row.subject,
        duration: Number(row.duration) || 25,
        date: row.session_date,
        notes: row.notes || '',
        xpReward: Number(row.xp_reward) || 25,
        createdAt: row.created_at ? row.created_at.split('T')[0] : row.session_date
      }));

      // Reconstruct journals map
      const journals = {};
      (journalsRes.data || []).forEach(row => {
        journals[row.entry_date] = {
          well: row.well || '',
          improve: row.improve || '',
          learned: row.learned || '',
          priorities: row.priorities || '',
          mood: row.mood || 'good',
          updatedAt: row.updated_at
        };
      });

      // Reconstruct achievements map
      const achievementsMap = {};
      (achievementsRes.data || []).forEach(row => {
        achievementsMap[row.achievement_id] = {
          unlocked: Boolean(row.unlocked),
          unlockedAt: row.unlocked_at || null
        };
      });

      // Construct user profile
      const profileData = profileRes.data;
      const user = {
        name: profileData ? profileData.display_name : (this.currentUser?.user_metadata?.full_name || 'Champion'),
        totalXP: profileData ? Number(profileData.total_xp) : 0,
        level: profileData ? Number(profileData.level) : 1,
        joinedDate: profileData ? profileData.joined_date : new Date().toISOString().split('T')[0]
      };

      const settings = {
        soundEnabled: profileData ? Boolean(profileData.sound_enabled) : true
      };

      this.setStatus('synced', 'Cloud data loaded');

      return {
        hasData: Boolean(profileData || habits.length > 0 || tasks.length > 0),
        state: {
          user,
          habits,
          tasks,
          goals,
          workouts,
          focusSessions,
          journals,
          achievementsMap,
          settings
        }
      };
    } catch (err) {
      this.setStatus('error', err.message);
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // Granular Cloud Synchronization (Upsert / Delete)
  // --------------------------------------------------------------------------
  async syncProfile(userId, { name, totalXP, level, soundEnabled }) {
    if (!this.client || !userId) return;
    this.setStatus('syncing');
    try {
      const { error } = await this.client
        .from('user_profiles')
        .upsert({
          id: userId,
          display_name: name,
          total_xp: totalXP,
          level: level,
          sound_enabled: soundEnabled,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error syncing profile:', err);
      this.setStatus('error', err.message);
    }
  }

  async syncHabitSave(userId, habit) {
    if (!this.client || !userId || !habit) return;
    this.setStatus('syncing');
    try {
      const { error } = await this.client
        .from('habits')
        .upsert({
          user_id: userId,
          id: habit.id,
          name: habit.name,
          category: habit.category,
          description: habit.description || '',
          xp_reward: habit.xpReward,
          created_at: habit.createdAt,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error saving habit:', err);
      this.setStatus('error', err.message);
    }
  }

  async syncHabitToggle(userId, habitId, dateStr, isCompleted, totalXP, level) {
    if (!this.client || !userId || !habitId || !dateStr) return;
    this.setStatus('syncing');
    try {
      if (isCompleted) {
        // Upsert completion record (prevents duplicates)
        const { error } = await this.client
          .from('habit_completions')
          .upsert({
            user_id: userId,
            habit_id: habitId,
            completed_date: dateStr,
            completed_at: new Date().toISOString()
          });
        if (error) throw error;
      } else {
        // Delete completion record
        const { error } = await this.client
          .from('habit_completions')
          .delete()
          .eq('user_id', userId)
          .eq('habit_id', habitId)
          .eq('completed_date', dateStr);
        if (error) throw error;
      }

      // Sync XP
      await this.client
        .from('user_profiles')
        .update({
          total_xp: totalXP,
          level: level,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error syncing habit toggle:', err);
      this.setStatus('error', err.message);
    }
  }

  async syncTaskSave(userId, task) {
    if (!this.client || !userId || !task) return;
    this.setStatus('syncing');
    try {
      const { error } = await this.client
        .from('tasks')
        .upsert({
          user_id: userId,
          id: task.id,
          title: task.title,
          priority: task.priority,
          deadline: task.deadline || null,
          is_top3: Boolean(task.isTop3),
          completed: Boolean(task.completed),
          completed_date: task.completedDate || null,
          xp_reward: task.xpReward,
          created_at: task.createdAt,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error saving task:', err);
      this.setStatus('error', err.message);
    }
  }

  async syncTaskToggle(userId, task, totalXP, level) {
    if (!this.client || !userId || !task) return;
    this.setStatus('syncing');
    try {
      const taskPromise = this.client
        .from('tasks')
        .upsert({
          user_id: userId,
          id: task.id,
          title: task.title,
          priority: task.priority,
          deadline: task.deadline || null,
          is_top3: Boolean(task.isTop3),
          completed: Boolean(task.completed),
          completed_date: task.completedDate || null,
          xp_reward: task.xpReward,
          created_at: task.createdAt,
          updated_at: new Date().toISOString()
        });

      const profilePromise = this.client
        .from('user_profiles')
        .update({
          total_xp: totalXP,
          level: level,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      const [tRes, pRes] = await Promise.all([taskPromise, profilePromise]);
      if (tRes.error) throw tRes.error;
      if (pRes.error) throw pRes.error;

      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error syncing task toggle:', err);
      this.setStatus('error', err.message);
    }
  }

  async syncGoalSave(userId, goal) {
    if (!this.client || !userId || !goal) return;
    this.setStatus('syncing');
    try {
      const { error } = await this.client
        .from('goals')
        .upsert({
          user_id: userId,
          id: goal.id,
          title: goal.title,
          category: goal.category,
          deadline: goal.deadline || null,
          completed: Boolean(goal.completed),
          completed_date: goal.completedDate || null,
          xp_reward: goal.xpReward,
          created_at: goal.createdAt,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error saving goal:', err);
      this.setStatus('error', err.message);
    }
  }

  async syncGoalToggle(userId, goal, totalXP, level) {
    if (!this.client || !userId || !goal) return;
    this.setStatus('syncing');
    try {
      const goalPromise = this.client
        .from('goals')
        .upsert({
          user_id: userId,
          id: goal.id,
          title: goal.title,
          category: goal.category,
          deadline: goal.deadline || null,
          completed: Boolean(goal.completed),
          completed_date: goal.completedDate || null,
          xp_reward: goal.xpReward,
          created_at: goal.createdAt,
          updated_at: new Date().toISOString()
        });

      const profilePromise = this.client
        .from('user_profiles')
        .update({
          total_xp: totalXP,
          level: level,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      const [gRes, pRes] = await Promise.all([goalPromise, profilePromise]);
      if (gRes.error) throw gRes.error;
      if (pRes.error) throw pRes.error;

      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error syncing goal toggle:', err);
      this.setStatus('error', err.message);
    }
  }

  async syncWorkoutSave(userId, workout, totalXP, level) {
    if (!this.client || !userId || !workout) return;
    this.setStatus('syncing');
    try {
      const workoutPromise = this.client
        .from('workouts')
        .upsert({
          user_id: userId,
          id: workout.id,
          type: workout.type,
          duration: workout.duration,
          workout_date: workout.date,
          notes: workout.notes || '',
          xp_reward: workout.xpReward || 35,
          created_at: new Date().toISOString()
        });

      const profilePromise = this.client
        .from('user_profiles')
        .update({
          total_xp: totalXP,
          level: level,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      const [wRes, pRes] = await Promise.all([workoutPromise, profilePromise]);
      if (wRes.error) throw wRes.error;
      if (pRes.error) throw pRes.error;

      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error saving workout:', err);
      this.setStatus('error', err.message);
    }
  }

  async syncFocusSessionSave(userId, session, totalXP, level) {
    if (!this.client || !userId || !session) return;
    this.setStatus('syncing');
    try {
      const sessionPromise = this.client
        .from('focus_sessions')
        .upsert({
          user_id: userId,
          id: session.id,
          subject: session.subject,
          duration: session.duration,
          session_date: session.date,
          notes: session.notes || '',
          xp_reward: session.xpReward || 25,
          created_at: new Date().toISOString()
        });

      const profilePromise = this.client
        .from('user_profiles')
        .update({
          total_xp: totalXP,
          level: level,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      const [sRes, pRes] = await Promise.all([sessionPromise, profilePromise]);
      if (sRes.error) throw sRes.error;
      if (pRes.error) throw pRes.error;

      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error saving focus session:', err);
      this.setStatus('error', err.message);
    }
  }

  async syncJournalSave(userId, entryDate, entryData, totalXP, level) {
    if (!this.client || !userId || !entryDate || !entryData) return;
    this.setStatus('syncing');
    try {
      const journalPromise = this.client
        .from('journal_entries')
        .upsert({
          user_id: userId,
          entry_date: entryDate,
          well: entryData.well || '',
          improve: entryData.improve || '',
          learned: entryData.learned || '',
          priorities: entryData.priorities || '',
          mood: entryData.mood || 'good',
          updated_at: new Date().toISOString()
        });

      const profilePromise = this.client
        .from('user_profiles')
        .update({
          total_xp: totalXP,
          level: level,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      const [jRes, pRes] = await Promise.all([journalPromise, profilePromise]);
      if (jRes.error) throw jRes.error;
      if (pRes.error) throw pRes.error;

      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error saving journal entry:', err);
      this.setStatus('error', err.message);
    }
  }

  async syncAchievementUnlock(userId, ach) {
    if (!this.client || !userId || !ach) return;
    try {
      const { error } = await this.client
        .from('user_achievements')
        .upsert({
          user_id: userId,
          achievement_id: ach.id,
          unlocked: true,
          unlocked_at: ach.unlockedAt || new Date().toISOString().split('T')[0]
        });
      if (error) console.error('[CloudSync] Achievement unlock sync error:', error);
    } catch (e) {
      console.error('[CloudSync] Achievement unlock error:', e);
    }
  }

  async syncDelete(userId, type, id, totalXP, level) {
    if (!this.client || !userId || !type || !id) return;
    this.setStatus('syncing');

    const tableMap = {
      habit: 'habits',
      task: 'tasks',
      goal: 'goals',
      workout: 'workouts',
      focus: 'focus_sessions'
    };

    const tableName = tableMap[type];
    if (!tableName) return;

    try {
      const deletePromise = this.client
        .from(tableName)
        .delete()
        .eq('user_id', userId)
        .eq('id', id);

      const profilePromise = this.client
        .from('user_profiles')
        .update({
          total_xp: totalXP,
          level: level,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      const [dRes, pRes] = await Promise.all([deletePromise, profilePromise]);
      if (dRes.error) throw dRes.error;
      if (pRes.error) throw pRes.error;

      this.setStatus('synced');
    } catch (err) {
      console.error('[CloudSync] Error syncing deletion:', err);
      this.setStatus('error', err.message);
    }
  }

  // --------------------------------------------------------------------------
  // Full State Upload (Safe Local Migration)
  // --------------------------------------------------------------------------
  async uploadEntireState(userId, state) {
    if (!this.client || !userId || !state) {
      throw new Error('Supabase client or state missing.');
    }

    this.setStatus('syncing', 'Migrating data to cloud...');

    try {
      // 1. Profile
      const { error: profileErr } = await this.client
        .from('user_profiles')
        .upsert({
          id: userId,
          display_name: state.user?.name || 'Champion',
          total_xp: state.user?.totalXP || 0,
          level: state.user?.level || 1,
          sound_enabled: Boolean(state.settings?.soundEnabled ?? true),
          joined_date: state.user?.joinedDate || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        });
      if (profileErr) throw profileErr;

      // 2. Habits
      if (Array.isArray(state.habits) && state.habits.length > 0) {
        const habitsToInsert = state.habits.map(h => ({
          user_id: userId,
          id: h.id,
          name: h.name,
          category: h.category,
          description: h.description || '',
          xp_reward: h.xpReward || 25,
          created_at: h.createdAt || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        }));

        const { error: habitsErr } = await this.client
          .from('habits')
          .upsert(habitsToInsert);
        if (habitsErr) throw habitsErr;

        // Habit Completions
        const completionsToInsert = [];
        state.habits.forEach(h => {
          if (h.history && typeof h.history === 'object') {
            Object.keys(h.history).forEach(dateStr => {
              if (h.history[dateStr]) {
                completionsToInsert.push({
                  user_id: userId,
                  habit_id: h.id,
                  completed_date: dateStr,
                  completed_at: new Date().toISOString()
                });
              }
            });
          }
        });

        if (completionsToInsert.length > 0) {
          const { error: compErr } = await this.client
            .from('habit_completions')
            .upsert(completionsToInsert);
          if (compErr) throw compErr;
        }
      }

      // 3. Tasks
      if (Array.isArray(state.tasks) && state.tasks.length > 0) {
        const tasksToInsert = state.tasks.map(t => ({
          user_id: userId,
          id: t.id,
          title: t.title,
          priority: t.priority || 'Medium',
          deadline: t.deadline || null,
          is_top3: Boolean(t.isTop3),
          completed: Boolean(t.completed),
          completed_date: t.completedDate || null,
          xp_reward: t.xpReward || 20,
          created_at: t.createdAt || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        }));

        const { error: tasksErr } = await this.client
          .from('tasks')
          .upsert(tasksToInsert);
        if (tasksErr) throw tasksErr;
      }

      // 4. Goals
      if (Array.isArray(state.goals) && state.goals.length > 0) {
        const goalsToInsert = state.goals.map(g => ({
          user_id: userId,
          id: g.id,
          title: g.title,
          category: g.category || 'Career',
          deadline: g.deadline || null,
          completed: Boolean(g.completed),
          completed_date: g.completedDate || null,
          xp_reward: g.xpReward || 100,
          created_at: g.createdAt || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        }));

        const { error: goalsErr } = await this.client
          .from('goals')
          .upsert(goalsToInsert);
        if (goalsErr) throw goalsErr;
      }

      // 5. Workouts
      if (Array.isArray(state.workouts) && state.workouts.length > 0) {
        const workoutsToInsert = state.workouts.map(w => ({
          user_id: userId,
          id: w.id,
          type: w.type || 'Strength',
          duration: w.duration || 45,
          workout_date: w.date || new Date().toISOString().split('T')[0],
          notes: w.notes || '',
          xp_reward: w.xpReward || 35,
          created_at: new Date().toISOString()
        }));

        const { error: workoutsErr } = await this.client
          .from('workouts')
          .upsert(workoutsToInsert);
        if (workoutsErr) throw workoutsErr;
      }

      // 6. Focus Sessions
      if (Array.isArray(state.focusSessions) && state.focusSessions.length > 0) {
        const focusToInsert = state.focusSessions.map(s => ({
          user_id: userId,
          id: s.id,
          subject: s.subject || 'Focus',
          duration: s.duration || 25,
          session_date: s.date || new Date().toISOString().split('T')[0],
          notes: s.notes || '',
          xp_reward: s.xpReward || 25,
          created_at: new Date().toISOString()
        }));

        const { error: focusErr } = await this.client
          .from('focus_sessions')
          .upsert(focusToInsert);
        if (focusErr) throw focusErr;
      }

      // 7. Journals
      if (state.journals && typeof state.journals === 'object') {
        const journalsToInsert = Object.keys(state.journals).map(dateStr => ({
          user_id: userId,
          entry_date: dateStr,
          well: state.journals[dateStr].well || '',
          improve: state.journals[dateStr].improve || '',
          learned: state.journals[dateStr].learned || '',
          priorities: state.journals[dateStr].priorities || '',
          mood: state.journals[dateStr].mood || 'good',
          updated_at: new Date().toISOString()
        }));

        if (journalsToInsert.length > 0) {
          const { error: journalErr } = await this.client
            .from('journal_entries')
            .upsert(journalsToInsert);
          if (journalErr) throw journalErr;
        }
      }

      // 8. Achievements
      if (Array.isArray(state.achievements)) {
        const achievementsToInsert = state.achievements
          .filter(a => a.unlocked)
          .map(a => ({
            user_id: userId,
            achievement_id: a.id,
            unlocked: true,
            unlocked_at: a.unlockedAt || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          }));

        if (achievementsToInsert.length > 0) {
          const { error: achErr } = await this.client
            .from('user_achievements')
            .upsert(achievementsToInsert);
          if (achErr) throw achErr;
        }
      }

      this.setStatus('synced', 'All local data safely migrated to cloud!');
      return true;
    } catch (err) {
      console.error('[CloudSync] Migration error:', err);
      this.setStatus('error', err.message);
      throw err;
    }
  }

  processSyncQueue() {
    // When offline actions were queued, process them
  }
}

// Attach globally
if (typeof window !== 'undefined') {
  window.cloudSync = new CloudSyncService();
}
