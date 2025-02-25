import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ihbtfjcrkfszkifefwsm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYnRmamNya2ZzemtpZmVmd3NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDM1NjU0OCwiZXhwIjoyMDU1OTMyNTQ4fQ.g0Hoxww-RuB0NSKWrNrY0QjNeU_YVhVBBtm5cgkOwmo';
export const supabase = createClient(supabaseUrl, supabaseKey);
