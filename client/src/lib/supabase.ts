import { createClient } from '@supabase/supabase-js';
type Env ={
    NEXT_PUBLIC_SUPABASE_URL: string,
    NEXT_PUBLIC_SUPABASE_KEY:string,
}
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY as string;

if(!supabaseUrl){
    throw new Error('Supabase URL must be provided in .env.local')
}
if(!supabaseKey){
    throw new Error('Supabase Anon Key must be provided in .env.local')
}
export const supabase = createClient(supabaseUrl, supabaseKey);