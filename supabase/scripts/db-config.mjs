export function dbConfig() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const password = process.env.supabasedbpw ?? process.env.SUPABASE_DB_PASSWORD;
  if (!url || !password) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or supabasedbpw in .env');
  }
  const ref = new URL(url).hostname.split('.')[0];
  return {
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: 'postgres',
    database: 'postgres',
    password,
    ssl: { rejectUnauthorized: false },
  };
}
