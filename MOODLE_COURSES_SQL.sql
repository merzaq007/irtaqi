-- تشغيل هذا في Supabase SQL Editor
-- جدول لحفظ المقاييس التي تمسحها الـ extension

CREATE TABLE IF NOT EXISTS moodle_courses (
  id SERIAL PRIMARY KEY,
  course_id TEXT UNIQUE NOT NULL,
  course_name TEXT,
  module_id TEXT DEFAULT 'moodle_auto_sync',
  last_scanned TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- السماح للـ anon key بالقراءة والكتابة
ALTER TABLE moodle_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON moodle_courses FOR ALL USING (true) WITH CHECK (true);

-- جدول اشتراكات Push Notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  subscription TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);
