# دليل نشر إشعارات Telegram - منصة ارتقي

## 📋 نظرة عامة

تم تطوير نظام إشعارات Telegram الذي يرسل إشعاراً تلقائياً عند نشر أي درس جديد على منصة ارتقي. النظام جاهز للنشر ويحتاج فقط إلى إضافة بيانات اعتماد Telegram.

## ✅ ما تم إنجازه

### 1. **Supabase Edge Function** (`supabase/edge_function/notify-telegram/index.ts`)
- ✅ دالة جاهزة لإرسال إشعارات Telegram
- ✅ تدعم جميع أنواع الملفات (PDF, DOC, PPT, XLS, ZIP)
- ✅ رسائل بالعربية مع emoji مناسب لكل نوع ملف
- ✅ تعرض اسم المقياس، اسم الملف، حجم الملف، ورابط المنصة

### 2. **Database Trigger** (`supabase/migrations/create_telegram_webhook_2026_04_22.sql`)
- ✅ Trigger يُطلق تلقائياً عند إضافة ملف جديد في جدول `files`
- ✅ يستدعي Edge Function تلقائياً

### 3. **Admin Page Integration** (`src/pages/AdminPage.tsx`)
- ✅ صفحة الأدمن تقوم برفع الملفات إلى Supabase Storage
- ✅ تحفظ معلومات الملف في قاعدة البيانات
- ✅ عند الحفظ → يُطلق Trigger → يُرسل إشعار Telegram تلقائياً

## 🔧 خطوات النشر

### الخطوة 1: الحصول على بيانات اعتماد Telegram

#### أ) إنشاء Bot Token
1. افتح Telegram وابحث عن `@BotFather`
2. أرسل الأمر `/newbot`
3. اتبع التعليمات لإنشاء البوت
4. ستحصل على **Bot Token** بهذا الشكل: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. احفظ هذا Token

#### ب) الحصول على Chat ID
1. أنشئ مجموعة (Group) في Telegram للإشعارات
2. أضف البوت الذي أنشأته إلى المجموعة
3. أرسل أي رسالة في المجموعة
4. افتح المتصفح واذهب إلى:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
   (استبدل `<YOUR_BOT_TOKEN>` بالـ Token الذي حصلت عليه)
5. ابحث عن `"chat":{"id":-100xxxxxxxxx}` في النتيجة
6. احفظ هذا الرقم (Chat ID)

### الخطوة 2: نشر Edge Function عبر Supabase Dashboard

#### الطريقة الأولى: عبر Dashboard (الأسهل)

1. **افتح Supabase Dashboard**
   - اذهب إلى: https://supabase.com/dashboard
   - اختر مشروعك: `bdjhurufqkalicjmokbk`

2. **أنشئ Edge Function جديدة**
   - من القائمة الجانبية → **Edge Functions**
   - اضغط **Create a new function**
   - اسم الدالة: `notify-telegram`
   - انسخ محتوى ملف `supabase/edge_function/notify-telegram/index.ts` والصقه في المحرر
   - اضغط **Deploy**

3. **أضف Secrets (بيانات الاعتماد)**
   - في صفحة Edge Functions → **Settings** → **Secrets**
   - أضف Secret جديد:
     - **Name**: `TELEGRAM_TOKEN`
     - **Value**: (Bot Token الذي حصلت عليه)
   - أضف Secret آخر:
     - **Name**: `TELEGRAM_CHAT_ID`
     - **Value**: (Chat ID الذي حصلت عليه)

4. **أنشئ Database Webhook**
   - من القائمة الجانبية → **Database** → **Webhooks**
   - اضغط **Create a new webhook**
   - **Table**: `files`
   - **Events**: اختر `INSERT`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://bdjhurufqkalicjmokbk.supabase.co/functions/v1/notify-telegram`
   - **HTTP Headers**:
     ```json
     {
       "Content-Type": "application/json",
       "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"
     }
     ```
     (استبدل `YOUR_SERVICE_ROLE_KEY` بـ Service Role Key من Settings → API)
   - اضغط **Create webhook**

#### الطريقة الثانية: عبر SQL Editor (بديلة)

1. افتح **SQL Editor** في Supabase Dashboard
2. انسخ محتوى ملف `supabase/migrations/create_telegram_webhook_2026_04_22.sql`
3. الصقه في المحرر
4. اضغط **Run**

### الخطوة 3: اختبار النظام

1. **افتح منصة ارتقي**
   - اذهب إلى: https://irtaqi.pages.dev/admin
   - كلمة المرور: `admin123`

2. **ارفع ملف تجريبي**
   - اختر أي مقياس
   - ارفع ملف PDF أو Word
   - اضغط "نشر الدرس + إشعار Telegram"

3. **تحقق من Telegram**
   - يجب أن يصل إشعار في المجموعة خلال ثوانٍ
   - الإشعار يحتوي على: اسم الملف، المقياس، الحجم، ورابط المنصة

## 📱 شكل الإشعار

```
📚 منصة ارتقي - درس جديد!

📕 محاضرة_01.pdf
📖 المقياس: المنصات الرقمية الوثائقية
📦 الحجم: 2.5 MB

🔗 افتح المنصة وحمّل الدرس
```

## 🔍 استكشاف الأخطاء

### المشكلة: لا يصل إشعار Telegram

**الحلول:**
1. تحقق من صحة `TELEGRAM_TOKEN` و `TELEGRAM_CHAT_ID` في Secrets
2. تأكد من أن البوت عضو في المجموعة
3. افتح **Edge Functions** → **Logs** لرؤية الأخطاء
4. تأكد من أن Webhook تم إنشاؤه بشكل صحيح

### المشكلة: خطأ في رفع الملف

**الحلول:**
1. تحقق من أن Storage Bucket اسمه `course-files`
2. تأكد من أن Bucket عام (Public)
3. تحقق من صلاحيات جدول `files`

### المشكلة: Edge Function لا تعمل

**الحلول:**
1. تحقق من Logs في Dashboard
2. تأكد من أن الدالة تم نشرها بنجاح
3. جرب إعادة نشر الدالة

## 📊 معلومات المشروع

- **Supabase Project**: `bdjhurufqkalicjmokbk`
- **Supabase URL**: `https://bdjhurufqkalicjmokbk.supabase.co`
- **Platform URL**: `https://irtaqi.pages.dev`
- **Admin Password**: `admin123`
- **Storage Bucket**: `course-files`
- **Database Table**: `files`

## 🎯 الخطوات التالية (اختيارية)

### Cloudflare Worker للمزامنة التلقائية 24/7

إذا أردت مزامنة تلقائية من Moodle حتى عندما يكون الحاسوب مغلقاً:

1. **نشر Cloudflare Worker**
   - الكود جاهز في `cloudflare-worker/src/index.js`
   - يحتاج إلى:
     - `MOODLE_USERNAME`: اسم المستخدم في Moodle
     - `MOODLE_PASSWORD`: كلمة المرور في Moodle
     - `TELEGRAM_TOKEN`: نفس Token البوت
     - `TELEGRAM_CHAT_ID`: نفس Chat ID
     - `SUPABASE_KEY`: موجود في `src/lib/supabase.ts`

2. **إضافة Secrets إلى Cloudflare**
   ```bash
   wrangler secret put MOODLE_USERNAME
   wrangler secret put MOODLE_PASSWORD
   wrangler secret put TELEGRAM_TOKEN
   wrangler secret put TELEGRAM_CHAT_ID
   wrangler secret put SUPABASE_KEY
   ```

3. **نشر Worker**
   ```bash
   cd cloudflare-worker
   wrangler deploy
   ```

## ✅ الخلاصة

النظام جاهز تماماً! فقط:
1. احصل على Bot Token و Chat ID من Telegram
2. أضفهما كـ Secrets في Supabase Dashboard
3. انشر Edge Function
4. أنشئ Webhook
5. جرّب رفع ملف من صفحة الأدمن

**ملاحظة**: لا توجد بيانات اعتماد Telegram في المشروع حالياً. يجب إضافتها يدوياً في Supabase Dashboard.
