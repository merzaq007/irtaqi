import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bdjhurufqkalicjmokbk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkamh1cnVmcWthbGljam1va2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTg4MzAsImV4cCI6MjA5MTkzNDgzMH0.eL0Np-s9leuOTBBo4OYUteLKwJPngv53TtYDe6Yk538';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DBFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  module_id: string;
  upload_date: string;
}
