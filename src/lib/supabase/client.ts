import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yyiqiihnozvbrwnljiqg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5aXFpaWhub3p2YnJ3bmxqaXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1ODc4MjksImV4cCI6MjEwMjE2MzgyOX0.GQStzexqSNJ6ssgUzBv_5REU-wfIw1-enOYfPr7tQFc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
