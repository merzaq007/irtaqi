# دليل ربط Supabase - منصة ارتقي

## 📋 نظرة عامة

هذا الدليل يشرح كيفية ربط منصة ارتقي بـ Supabase لتفعيل وظائف:
- رفع الملفات الحقيقية
- تخزين الملفات في السحابة
- قاعدة بيانات لمعلومات الملفات
- مصادقة المستخدمين (اختياري)

## 🚀 الخطوة 1: إنشاء مشروع Supabase

### 1.1 إنشاء حساب
1. اذهب إلى [supabase.com](https://supabase.com)
2. اضغط على "Start your project"
3. سجل الدخول باستخدام GitHub أو البريد الإلكتروني

### 1.2 إنشاء مشروع جديد
1. اضغط على "New Project"
2. اختر Organization (أو أنشئ واحدة جديدة)
3. املأ البيانات:
   - **Project Name**: `irtaqi-platform`
   - **Database Password**: اختر كلمة مرور قوية (احفظها!)
   - **Region**: اختر أقرب منطقة (مثل: Frankfurt)
   - **Pricing Plan**: Free (للبداية)
4. اضغط على "Create new project"
5. انتظر 2-3 دقائق حتى يتم إنشاء المشروع

## 🔑 الخطوة 2: الحصول على بيانات الاتصال

### 2.1 Project URL و API Keys
1. في لوحة تحكم Supabase، اذهب إلى **Settings** → **API**
2. ستجد:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: مفتاح عام للاستخدام في Frontend
   - **service_role key**: مفتاح خاص (لا تشاركه!)

### 2.2 حفظ البيانات
احفظ هذه البيانات في ملف `.env.local` في جذر المشروع:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ مهم**: لا تضف ملف `.env.local` إلى Git!

## 🗄️ الخطوة 3: إعداد قاعدة البيانات

### 3.1 إنشاء جدول الملفات
1. في لوحة تحكم Supabase، اذهب إلى **SQL Editor**
2. اضغط على "New query"
3. الصق الكود التالي:

```sql
-- إنشاء جدول الملفات
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

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_files_module_id ON public.files(module_id);
CREATE INDEX IF NOT EXISTS idx_files_upload_date ON public.files(upload_date DESC);

-- تفعيل Row Level Security
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- سياسة: الجميع يمكنهم قراءة الملفات
CREATE POLICY "Anyone can view files" ON public.files
  FOR SELECT
  USING (true);

-- سياسة: المستخدمون المصادقون فقط يمكنهم إضافة ملفات
CREATE POLICY "Authenticated users can insert files" ON public.files
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- سياسة: المستخدمون المصادقون فقط يمكنهم حذف ملفات
CREATE POLICY "Authenticated users can delete files" ON public.files
  FOR DELETE
  USING (auth.role() = 'authenticated');
```

4. اضغط على "Run" لتنفيذ الكود

### 3.2 التحقق من الجدول
1. اذهب إلى **Table Editor**
2. يجب أن ترى جدول `files` مع الأعمدة:
   - `id` (UUID)
   - `file_name` (TEXT)
   - `file_url` (TEXT)
   - `file_type` (TEXT)
   - `file_size` (BIGINT)
   - `module_id` (TEXT)
   - `upload_date` (TIMESTAMPTZ)
   - `created_at` (TIMESTAMPTZ)

## 📦 الخطوة 4: إعداد التخزين (Storage)

### 4.1 إنشاء Bucket
1. في لوحة تحكم Supabase، اذهب إلى **Storage**
2. اضغط على "Create a new bucket"
3. املأ البيانات:
   - **Name**: `course-files`
   - **Public bucket**: ✅ (حتى يمكن للطلاب التحميل)
4. اضغط على "Create bucket"

### 4.2 إعداد سياسات التخزين
1. اضغط على bucket `course-files`
2. اذهب إلى **Policies**
3. أضف السياسات التالية:

#### سياسة القراءة (للجميع)
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'course-files' );
```

#### سياسة الرفع (للمصادقين فقط)
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-files' 
  AND auth.role() = 'authenticated'
);
```

#### سياسة الحذف (للمصادقين فقط)
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-files' 
  AND auth.role() = 'authenticated'
);
```

## 💻 الخطوة 5: تحديث الكود

### 5.1 تثبيت Supabase Client
```bash
npm install @supabase/supabase-js
```

### 5.2 إنشاء Supabase Client
أنشئ ملف `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 5.3 تحديث AdminPage.tsx
استبدل وظيفة `handleUpload` بالكود التالي:

```typescript
const handleUpload = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedModule || !selectedFile) {
    setMessage({ type: 'error', text: 'يرجى اختيار المادة والملف' });
    return;
  }

  setUploading(true);
  setMessage(null);

  try {
    // 1. رفع الملف إلى Storage
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Date.now()}_${selectedFile.name}`;
    const filePath = `${selectedModule}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course-files')
      .upload(filePath, selectedFile);

    if (uploadError) throw uploadError;

    // 2. الحصول على رابط الملف
    const { data: urlData } = supabase.storage
      .from('course-files')
      .getPublicUrl(filePath);

    // 3. حفظ معلومات الملف في قاعدة البيانات
    const { error: dbError } = await supabase
      .from('files')
      .insert({
        file_name: selectedFile.name,
        file_url: urlData.publicUrl,
        file_type: fileExt,
        file_size: selectedFile.size,
        module_id: selectedModule,
      });

    if (dbError) throw dbError;

    setMessage({ type: 'success', text: `تم رفع الملف "${selectedFile.name}" بنجاح` });
    setSelectedModule('');
    setSelectedFile(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  } catch (error) {
    console.error('Upload error:', error);
    setMessage({ type: 'error', text: 'حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى' });
  } finally {
    setUploading(false);
  }
};
```

### 5.4 تحديث Home.tsx
استبدل `useEffect` بالكود التالي:

```typescript
useEffect(() => {
  const fetchRecentFiles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('upload_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecentFiles(data || []);
    } catch (error) {
      console.error('Error fetching recent files:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchRecentFiles();
}, []);
```

### 5.5 تحديث ModulePage.tsx
استبدل `useEffect` بالكود التالي:

```typescript
useEffect(() => {
  const loadFiles = async () => {
    if (!id) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('module_id', id)
        .order('upload_date', { ascending: false });

      if (error) throw error;

      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  loadFiles();
}, [id]);
```

## 🔐 الخطوة 6: إعداد المصادقة (اختياري)

### 6.1 تفعيل Email Authentication
1. في لوحة تحكم Supabase، اذهب إلى **Authentication** → **Providers**
2. فعّل **Email**
3. احفظ الإعدادات

### 6.2 إنشاء صفحة تسجيل الدخول
أنشئ ملف `src/pages/LoginPage.tsx`:

```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // إعادة التوجيه إلى لوحة التحكم
      window.location.href = '/admin';
    } catch (error) {
      console.error('Login error:', error);
      alert('خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

## ✅ الخطوة 7: الاختبار

### 7.1 اختبار رفع الملفات
1. شغل المشروع: `npm run dev`
2. اذهب إلى `/admin`
3. اختر مقياس وملف
4. اضغط على "رفع الملف"
5. تحقق من رفع الملف في Supabase Storage

### 7.2 اختبار عرض الملفات
1. اذهب إلى الصفحة الرئيسية
2. يجب أن ترى الملفات المرفوعة في "آخر الدروس المضافة"
3. اذهب إلى صفحة المقياس
4. يجب أن ترى جميع ملفات المقياس

### 7.3 اختبار التحميل
1. اضغط على زر "تحميل" لأي ملف
2. يجب أن يتم تحميل الملف مباشرة

## 🐛 حل المشاكل الشائعة

### مشكلة: "Missing Supabase environment variables"
**الحل**: تأكد من وجود ملف `.env.local` مع المتغيرات الصحيحة

### مشكلة: "Row Level Security policy violation"
**الحل**: تحقق من سياسات RLS في قاعدة البيانات

### مشكلة: "Storage bucket not found"
**الحل**: تأكد من إنشاء bucket باسم `course-files`

### مشكلة: "Authentication required"
**الحل**: تأكد من تسجيل الدخول قبل رفع الملفات

## 📚 موارد إضافية

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 تهانينا!

الآن منصة ارتقي متصلة بـ Supabase وجاهزة لرفع وتحميل الملفات الحقيقية! 🚀

---

**ملاحظة**: هذا الدليل يفترض استخدام Free Plan من Supabase. للاستخدام في الإنتاج، قد تحتاج إلى ترقية الخطة.
