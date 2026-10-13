/**
 * ============================================================================
 * LEVEL UP — Personal Growth System
 * Supabase Client Configuration
 * ============================================================================
 *
 * HOW TO RETRIEVE YOUR CREDENTIALS FROM THE SUPABASE DASHBOARD:
 * 1. Log in to your Supabase Dashboard: https://supabase.com/dashboard
 * 2. Select your project: (e.g. qhfazmaafiegrnkumxlt)
 * 3. In the left navigation, click "Project Settings" (gear icon) -> "API"
 *    (or "Data API" / "API Settings")
 * 4. Under "Project URL", copy the URL and place it in 'url' below.
 * 5. Under "Project API Keys", copy the "anon" (public / publishable) key
 *    and place it in 'anonKey' below.
 *
 * IMPORTANT SECURITY RULES:
 * - Only use your Project URL and anon / publishable key in this file.
 * - NEVER put your "service_role" secret key or database password in this file!
 * - The anon key is safe for client-side frontend code because access is strictly
 *   protected by Row Level Security (RLS) policies in PostgreSQL.
 * ============================================================================
 */

const SUPABASE_CONFIG = {
  // Your Supabase Project URL:
  url: 'https://qhfazmaafiegrnkumxlt.supabase.co',

  // Your Supabase Publishable / Anon Public Key:
  anonKey: 'sb_publishable_GM15ZektZz6UXfRTQheRMA_-UIpeq3X'
};

/**
 * Validates that Supabase credentials have been configured with valid strings
 * @returns {boolean}
 */
function isSupabaseConfigured() {
  if (!SUPABASE_CONFIG || typeof SUPABASE_CONFIG !== 'object') return false;
  const { url, anonKey } = SUPABASE_CONFIG;
  if (!url || typeof url !== 'string' || !url.startsWith('https://')) return false;
  if (url.includes('YOUR_SUPABASE_PROJECT_URL')) return false;
  if (!anonKey || typeof anonKey !== 'string') return false;
  if (anonKey.includes('YOUR_SUPABASE_ANON_KEY')) return false;
  return true;
}

// Attach to window object for browser access
if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.isSupabaseConfigured = isSupabaseConfigured;
}
