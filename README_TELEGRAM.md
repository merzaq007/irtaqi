# 🤖 نظام إشعارات Telegram - منصة ارتقي

## ✅ الحالة: جاهز للنشر

تم تطوير نظام إشعارات Telegram بالكامل وهو جاهز للعمل. النظام يرسل إشعاراً تلقائياً في Telegram كل مرة تنشر فيها درساً جديداً على منصة ارتقي.

## 📁 الملفات المتوفرة

### 1. **دليل النشر الكامل**
📄 `TELEGRAM_DEPLOYMENT_GUIDE.md`
- شرح مفصل لكل خطوة
- طرق متعددة للنشر
- حل المشاكل الشائعة
- معلومات المشروع الكاملة

### 2. **سكريبت النشر التلقائي**
📄 `deploy-telegram.ps1`
- سكريبت PowerShell للنشر السريع
- يطلب منك Bot Token و Chat ID
- ينشر Edge Function تلقائياً
- يضيف Secrets إلى Supabase

### 3. **صفحة إعداد تفاعلية**
📄 `telegram-setup.html`
- واجهة ويب سهلة الاستخدام
- تساعدك في الحصول على Bot Token
- تحصل على Chat ID تلقائياً
- تختبر الإشعارات مباشرة
- **افتحها في المتصفح للبدء!**

### 4. **الكود الجاهز**
✅ `supabase/edge_function/notify-telegram/index.ts` - Edge Function
✅ `supabase/migrations/create_telegram_webhook_2026_04_22.sql` - Database Trigger
✅ `src/pages/AdminPage.tsx` - صفحة الأدمن مع الرفع التلقائي

## 🚀 البدء السريع

### الطريقة الأسهل: استخدم صفحة الإعداد

1. **افتح ملف `telegram-setup.html` في المتصفح**
2. **اتبع الخطوات الموجودة في الصفحة:**
   - إنشاء Bot في Telegram
   - إنشاء مجموعة وإضافة البوت
   - الحصول على Chat ID تلقائياً
   - اختبار الإشعار
   - نسخ المعلومات للنشر

3. **انشر على Supabase Dashboard:**
   - افتح: https://supabase.com/dashboard/project/bdjhurufqkalicjmokbk/functions
   - أنشئ Edge Function جديدة
   - أضف Secrets من صفحة الإعداد
   - أنشئ Webhook

### الطريقة البديلة: استخدم السكريبت

```powershell
# في PowerShell
.\deploy-telegram.ps1
```

السكريبت سيطلب منك:
- Bot Token
- Chat ID
- ثم ينشر كل شيء تلقائياً

## 📱 كيف يعمل النظام؟

```
1. تفتح صفحة الأدمن: https://irtaqi.pages.dev/admin
2. تختار المقياس وترفع ملف
3. تضغط "نشر الدرس + إشعار Telegram"
   ↓
4. الملف يُرفع إلى Supabase Storage
   ↓
5. المعلومات تُحفظ في قاعدة البيانات
   ↓
6. Database Trigger يُطلق تلقائياً
   ↓
7. Edge Function ترسل إشعار Telegram
   ↓
8. ✅ يصل الإشعار في المجموعة خلال ثوانٍ!
```

## 📋 شكل الإشعار

```
📚 منصة ارتقي - درس جديد!

📕 محاضرة_01.pdf
📖 المقياس: المنصات الرقمية الوثائقية
📦 الحجم: 2.5 MB

🔗 افتح المنصة وحمّل الدرس
```

## ⚙️ المعلومات التقنية

- **Supabase Project**: `bdjhurufqkalicjmokbk`
- **Platform URL**: https://irtaqi.pages.dev
- **Admin Password**: `admin123`
- **Edge Function**: `notify-telegram`
- **Database Table**: `files`
- **Storage Bucket**: `course-files`

## 🔐 المطلوب منك

لتشغيل النظام، تحتاج فقط إلى:

1. **TELEGRAM_TOKEN** - من @BotFather في Telegram
2. **TELEGRAM_CHAT_ID** - من مجموعة Telegram

**ملاحظة**: هذه المعلومات غير موجودة في المشروع لأسباب أمنية. يجب إضافتها يدوياً في Supabase Dashboard.

## 📚 الملفات للقراءة

- **للشرح الكامل**: اقرأ `TELEGRAM_DEPLOYMENT_GUIDE.md`
- **للبدء السريع**: افتح `telegram-setup.html` في المتصفح
- **للنشر التلقائي**: شغّل `deploy-telegram.ps1`

## 🎯 الخطوات التالية

1. ✅ افتح `telegram-setup.html` في المتصفح
2. ✅ احصل على Bot Token و Chat ID
3. ✅ اختبر الإشعار من الصفحة
4. ✅ انشر على Supabase Dashboard
5. ✅ جرّب رفع ملف من صفحة الأدمن
6. ✅ استمتع بالإشعارات التلقائية! 🎉

## ❓ مشاكل؟

راجع قسم "استكشاف الأخطاء" في `TELEGRAM_DEPLOYMENT_GUIDE.md`

---

**تم التطوير بواسطة**: Kiro AI Assistant  
**التاريخ**: 22 أبريل 2026  
**الحالة**: ✅ جاهز للنشر
