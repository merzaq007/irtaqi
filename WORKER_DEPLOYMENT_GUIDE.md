# دليل نشر Worker المزامنة (irtaqi-moodle-sync)

## 📋 نظرة عامة

Worker المزامنة (`irtaqi-moodle-sync`) هو Worker منفصل عن المنصة الرئيسية. يجب نشره بشكل منفصل.

## ⚠️ مهم جداً

- ✅ **المنصة الرئيسية** (irtaqi.pages.dev) → Cloudflare Pages
- ✅ **Worker المزامنة** (irtaqi-moodle-sync) → Cloudflare Worker منفصل

**لا يجب** أن يكون Worker المزامنة في نفس repository الخاص بالمنصة!

## 🚀 خطوات نشر Worker المزامنة

### الطريقة 1: نشر يدوي من حاسوبك

1. **افتح PowerShell في مجلد المشروع**

2. **اذهب إلى مجلد Worker**
   ```powershell
   cd cloudflare-worker
   ```

3. **سجل دخول إلى Cloudflare**
   ```powershell
   npx wrangler login
   ```

4. **أضف Secrets (بيانات الاعتماد)**
   ```powershell
   npx wrangler secret put MOODLE_USERNAME
   # أدخل username الخاص بك في Moodle
   
   npx wrangler secret put MOODLE_PASSWORD
   # أدخل password الخاص بك في Moodle
   
   npx wrangler secret put TELEGRAM_TOKEN
   # أدخل Telegram Bot Token
   
   npx wrangler secret put TELEGRAM_CHAT_ID
   # أدخل Telegram Chat ID
   
   npx wrangler secret put SUPABASE_KEY
   # أدخل: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkamh1cnVmcWthbGljam1va2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTg4MzAsImV4cCI6MjA5MTkzNDgzMH0.eL0Np-s9leuOTBBo4OYUteLKwJPngv53TtYDe6Yk538
   ```

5. **انشر Worker**
   ```powershell
   npx wrangler deploy
   ```

6. **تحقق من النشر**
   - افتح: https://dash.cloudflare.com
   - اذهب إلى: **Workers & Pages**
   - يجب أن ترى: **irtaqi-moodle-sync**

### الطريقة 2: إنشاء Repository منفصل (الأفضل)

1. **أنشئ repository جديد في GitHub**
   - اسم Repository: `irtaqi-moodle-sync`

2. **انسخ محتويات مجلد `cloudflare-worker/` إلى Repository الجديد**

3. **اربط Repository الجديد بـ Cloudflare Workers**
   - في Cloudflare Dashboard → Workers & Pages
   - اضغط **Create application**
   - اختر **Workers**
   - اربطه بـ GitHub repository الجديد

4. **أضف Secrets في Dashboard**
   - اذهب إلى Worker → Settings → Variables
   - أضف كل Secret من القائمة أعلاه

## 📊 معلومات Worker المزامنة

- **الاسم**: irtaqi-moodle-sync
- **الوظيفة**: مزامنة تلقائية من Moodle إلى Supabase
- **التشغيل**: كل 30 دقيقة (Cron: `*/30 * * * *`)
- **الملف الرئيسي**: `cloudflare-worker/src/index.js`

## 🔐 Secrets المطلوبة

| Secret Name | الوصف | مثال |
|------------|-------|------|
| MOODLE_USERNAME | اسم المستخدم في Moodle | `your_username` |
| MOODLE_PASSWORD | كلمة المرور في Moodle | `your_password` |
| TELEGRAM_TOKEN | Bot Token من @BotFather | `123456:ABC-DEF...` |
| TELEGRAM_CHAT_ID | Chat ID للمجموعة | `-100xxxxxxxxx` |
| SUPABASE_KEY | Supabase Anon Key | `eyJhbGci...` |

## ✅ بعد النشر

Worker سيعمل تلقائياً كل 30 دقيقة ويقوم بـ:
1. تسجيل الدخول إلى Moodle
2. جلب الملفات الجديدة من المقاييس
3. رفعها إلى Supabase
4. إرسال إشعار Telegram

## 🔍 مراقبة Worker

- افتح: https://dash.cloudflare.com
- اذهب إلى: **Workers & Pages** → **irtaqi-moodle-sync**
- اضغط: **Logs** لرؤية السجلات
- اضغط: **Metrics** لرؤية الإحصائيات

## ⚠️ ملاحظات مهمة

1. **Worker المزامنة منفصل تماماً عن المنصة الرئيسية**
2. **لا يجب** أن يكون في نفس repository الخاص بـ Pages
3. **يجب** نشره يدوياً من حاسوبك أو من repository منفصل
4. **Cloudflare Pages** لا يدعم نشر Workers تلقائياً

---

**ملخص**: Worker المزامنة يجب أن يُنشر بشكل منفصل عن المنصة الرئيسية.
