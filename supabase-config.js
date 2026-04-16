/*  ╔══════════════════════════════════════════════════════════╗
 *  ║  SUPABASE CONFIG — fill in YOUR project credentials     ║
 *  ║                                                          ║
 *  ║  1. Go to https://supabase.com → New Project             ║
 *  ║  2. Settings → API → copy Project URL + anon key         ║
 *  ║  3. Paste them below                                     ║
 *  ║                                                          ║
 *  ║  Then run this SQL in the Supabase SQL Editor:           ║
 *  ║                                                          ║
 *  ║  CREATE TABLE customers (                                ║
 *  ║    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,        ║
 *  ║    name TEXT NOT NULL,                                   ║
 *  ║    email TEXT NOT NULL,                                  ║
 *  ║    phone TEXT,                                           ║
 *  ║    project_type TEXT NOT NULL,                           ║
 *  ║    status TEXT DEFAULT 'new',                            ║
 *  ║    notes TEXT,                                           ║
 *  ║    payment_status TEXT DEFAULT 'pending',                ║
 *  ║    follow_up_date DATE,                                  ║
 *  ║    created_at TIMESTAMPTZ DEFAULT now()                  ║
 *  ║  );                                                      ║
 *  ║                                                          ║
 *  ║  ALTER TABLE customers ENABLE ROW LEVEL SECURITY;        ║
 *  ║  CREATE POLICY "Allow all" ON customers                  ║
 *  ║    FOR ALL USING (true) WITH CHECK (true);               ║
 *  ╚══════════════════════════════════════════════════════════╝
 */

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Initialize client (available globally)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
