import { createClient as createClientJs } from '@supabase/supabase-js';

// Export a function to ensure environment variables are accessed at runtime (especially on server)
export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase Environment Variables');
    }

    return createClientJs(supabaseUrl, supabaseKey);
};
