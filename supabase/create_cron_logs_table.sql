-- Create the 'cron_logs' table
CREATE TABLE IF NOT EXISTS public.cron_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL, -- 'auto' (cron) or 'manual' (admin dashboard)
  status TEXT NOT NULL,   -- 'success' or 'failure'
  keyword TEXT,           -- Target keyword
  title TEXT,             -- Generated title
  error_message TEXT,     -- Error details if failed
  model_used TEXT,        -- The Gemini model that was used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.cron_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read (for admin dashboard to show history)
CREATE POLICY "Allow public read cron_logs"
  ON public.cron_logs FOR SELECT
  USING (true);

-- Allow anonymous service role to insert (for API routes)
CREATE POLICY "Allow anon insert cron_logs"
  ON public.cron_logs FOR INSERT
  WITH CHECK (true);
