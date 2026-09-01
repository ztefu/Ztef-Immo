export function validateEnv() {
  // Check only on the server side to avoid exposing server secrets to the client bundle
  if (typeof window === 'undefined') {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

    if (missing.length > 0) {
      console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
      if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }
    }
  }
}
