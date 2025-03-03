const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    throw new Error('Supabase URL must be provided in .env.local');
}

if (!supabaseAnonKey) {
    throw new Error('Supabase Anon Key must be provided in .env.local');
}

// Rest of your Supabase client initialization