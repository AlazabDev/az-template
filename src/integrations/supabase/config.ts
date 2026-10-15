const env = import.meta.env;

const readEnv = (...names: string[]): string => {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return '';
};

export const supabaseConfig = {
  url: readEnv('VITE_SUPABASE_URL'),
  publishableKey: readEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY'),
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.publishableKey,
);

export const supabaseConfigError = isSupabaseConfigured
  ? null
  : 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY).';

// Keep module initialization safe when a developer runs the app without .env.
// Requests will fail clearly until valid public settings are supplied.
export const supabaseClientConfig = {
  url: supabaseConfig.url || 'https://placeholder.supabase.co',
  publishableKey: supabaseConfig.publishableKey || 'missing-publishable-key',
};
