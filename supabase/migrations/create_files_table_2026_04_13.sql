-- Create files table to store course materials metadata
CREATE TABLE IF NOT EXISTS public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  module_id TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by module
CREATE INDEX IF NOT EXISTS idx_files_module_id ON public.files(module_id);
CREATE INDEX IF NOT EXISTS idx_files_upload_date ON public.files(upload_date DESC);

-- Enable Row Level Security
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read files (no authentication required)
CREATE POLICY "Anyone can view files" ON public.files
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert files (admin only)
CREATE POLICY "Authenticated users can insert files" ON public.files
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete files (admin only)
CREATE POLICY "Authenticated users can delete files" ON public.files
  FOR DELETE
  USING (auth.role() = 'authenticated');