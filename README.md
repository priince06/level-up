# LEVEL UP — Personal Growth System with Supabase Cloud Sync

A gamified, responsive personal growth web application with secure cloud synchronization across phone and desktop, built using Vanilla HTML, CSS, JavaScript, and Supabase.

---

## ⚡ Architecture & Features

* **Authentication**: Email/Password Sign Up, Sign In, Persistent Sessions, and Password Reset via Supabase Auth.
* **Cloud Database**: PostgreSQL on Supabase with strict Row Level Security (RLS) on all tables.
* **Multi-Device Synchronization**: Real-time sync for habits, streaks, tasks, milestone goals, fitness logs, Pomodoro study sessions, private reflection journals, and achievements.
* **Offline-Resilient**: Scoped local cache prevents data loss during intermittent network drops; updates sync automatically when reconnected.
* **Safe Local Migration**: Detects pre-existing offline data on first login and prompts to migrate records safely to your cloud account.
* **100% Static**: Pure HTML5, CSS3, and modern Vanilla JS (no Node/build step required). Ready for direct deployment on **GitHub Pages**.

---

## 🚀 Manual Dashboard Setup (Required Before First Use)

Your Supabase project is already created. Follow these **3 quick manual steps** in the Supabase Dashboard before using the website:

### Step 1: Run the Database Schema in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click on your project (`qhfazmaafiegrnkumxlt`).
3. In the left sidebar, click on **SQL Editor** (icon with terminal/SQL sheet).
4. Click **New Query** (or the `+` button).
5. Open the [`supabase-schema.sql`](file:///c:/Users/priin/OneDrive/Desktop/level%20up/supabase-schema.sql) file from this project, copy the entire file contents, paste them into the SQL Editor, and click **Run** (green button).
6. Verify that the query output says: `Success. No rows returned`.

> **What this does:**
> * Creates all 9 application tables: `user_profiles`, `habits`, `habit_completions`, `tasks`, `goals`, `workouts`, `focus_sessions`, `journal_entries`, and `user_achievements`.
> * Enables **Row Level Security (RLS)** on every table so users can only ever view, insert, update, or delete their own data (`auth.uid() = user_id`).
> * Installs performance indexes on `user_id` and date columns.
> * Sets up the `handle_new_user()` trigger to automatically create a profile record whenever an account registers.

---

### Step 2: Configure Authentication Settings in Supabase

1. In your Supabase Dashboard left sidebar, click **Authentication** -> **URL Configuration**.
2. Under **Site URL**, enter your local URL (e.g. `http://localhost:5500` or `http://127.0.0.1:8080`) or your GitHub Pages URL (e.g. `https://yourusername.github.io/level-up/`).
3. Under **Redirect URLs**, click **Add URL** and add your GitHub Pages and local test URLs.
4. *(Optional for Instant Testing)*: In the left sidebar, click **Authentication** -> **Providers** -> **Email**.
   * If **"Confirm email"** is enabled, users will receive a verification link before they can log in.
   * If you prefer immediate signup without waiting for email verification during testing, you can toggle **"Confirm email"** to OFF and click **Save**.

---

### Step 3: Verify Credentials in `supabase-config.js`

Open [`supabase-config.js`](file:///c:/Users/priin/OneDrive/Desktop/level%20up/supabase-config.js) in your editor. Your project credentials are pre-configured:

```javascript
const SUPABASE_CONFIG = {
  url: 'https://qhfazmaafiegrnkumxlt.supabase.co',
  anonKey: 'sb_publishable_GM15ZektZz6UXfRTQheRMA_-UIpeq3X'
};
```

#### Where to find or rotate these keys in Supabase:
1. Go to **Project Settings** (gear icon at bottom-left) -> **API**.
2. **Project URL**: Found under the "Project URL" section.
3. **anon / publishable Key**: Found under "Project API Keys" marked `anon` (public).

> ⚠️ **SECURITY REMINDER**:
> Never place your `service_role` secret key or PostgreSQL database password in frontend source code. Only the public `anon` / `publishable` key is needed because Supabase Row Level Security (RLS) protects the database.

---

## 💻 Running & Testing Locally

You can run the project using any local static web server:

### Option A: Python (Built-in)
```powershell
python -m http.server 8080
```
Then visit `http://localhost:8080` in your desktop browser or phone (using your local IP address).

### Option B: Node.js / npx
```powershell
npx serve .
```

### Option C: VS Code Live Server
Right-click [`index.html`](file:///c:/Users/priin/OneDrive/Desktop/level%20up/index.html) and select **Open with Live Server**.

---

## 🧪 Verification & Testing Checklist

1. **Sign Up**:
   * Open the app. The secure Auth screen will appear.
   * Click **Create Account**, enter your name, email, and a password (min 6 chars), then submit.
2. **Session Persistence**:
   * Once logged in, refresh the page or restart your browser. Your session remains authenticated and loads your cloud data immediately.
3. **Cloud Synchronization**:
   * Add a habit (e.g. "Morning Run"), complete it (+30 XP), or log a workout.
   * Notice the topbar pill displays a green dot: **Cloud Synced**.
4. **Multi-Device Test**:
   * Open the website on your phone and desktop using the same login credentials.
   * Items completed on one device will be visible on the other after refreshing or clicking **Cloud Synced**.
5. **Row Level Security (RLS) Isolation**:
   * Create two separate user accounts with different emails.
   * Verify that User A's private journal entries, habits, and tasks cannot be seen by User B.
6. **Local Data Migration**:
   * If you have older data stored in your browser from before the cloud upgrade, logging in will automatically detect it and ask: *"Migrate Local Growth Data to Cloud?"*.
7. **Password Reset**:
   * On the sign-in tab, click "Forgot password?", enter your email, and receive a secure recovery link.

---

## 🌐 Deploying to GitHub Pages

1. Push your project files to your GitHub repository:
   ```bash
   git add .
   git commit -m "Add Supabase Auth and PostgreSQL cloud synchronization"
   git push origin main
   ```
2. In your GitHub repository:
   * Go to **Settings** -> **Pages**.
   * Under **Build and deployment** -> **Source**, select `Deploy from a branch`.
   * Under **Branch**, select `main` (or `master`) and folder `/(root)`.
   * Click **Save**.
3. In your Supabase Dashboard:
   * Go to **Authentication** -> **URL Configuration**.
   * Add your live GitHub Pages URL (e.g. `https://<username>.github.io/<repo-name>/`) to **Site URL** and **Redirect URLs**.
4. Open the website on your smartphone and desktop to enjoy cross-device sync!
