# سكريبت نشر إشعارات Telegram لمنصة ارتقي
# Telegram Notification Deployment Script for Irtaqi Platform

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  نشر إشعارات Telegram - منصة ارتقي" -ForegroundColor Cyan
Write-Host "  Telegram Notification Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# معلومات المشروع
$SUPABASE_PROJECT = "bdjhurufqkalicjmokbk"
$SUPABASE_URL = "https://bdjhurufqkalicjmokbk.supabase.co"
$FUNCTION_NAME = "notify-telegram"

Write-Host "معلومات المشروع:" -ForegroundColor Yellow
Write-Host "  Supabase Project: $SUPABASE_PROJECT"
Write-Host "  Supabase URL: $SUPABASE_URL"
Write-Host "  Function Name: $FUNCTION_NAME"
Write-Host ""

# التحقق من وجود Supabase CLI
Write-Host "التحقق من Supabase CLI..." -ForegroundColor Yellow
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI غير مثبت" -ForegroundColor Red
    Write-Host ""
    Write-Host "يرجى تثبيت Supabase CLI أولاً:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "أو استخدم Supabase Dashboard للنشر اليدوي:" -ForegroundColor Yellow
    Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT/functions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "راجع ملف TELEGRAM_DEPLOYMENT_GUIDE.md للتعليمات الكاملة" -ForegroundColor Green
    exit 1
}

Write-Host "✅ Supabase CLI مثبت" -ForegroundColor Green
Write-Host ""

# طلب بيانات الاعتماد
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  بيانات اعتماد Telegram" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "للحصول على Bot Token:" -ForegroundColor Yellow
Write-Host "  1. ابحث عن @BotFather في Telegram"
Write-Host "  2. أرسل /newbot واتبع التعليمات"
Write-Host "  3. انسخ Token الذي يظهر"
Write-Host ""

$TELEGRAM_TOKEN = Read-Host "أدخل Telegram Bot Token"

Write-Host ""
Write-Host "للحصول على Chat ID:" -ForegroundColor Yellow
Write-Host "  1. أنشئ مجموعة في Telegram"
Write-Host "  2. أضف البوت إلى المجموعة"
Write-Host "  3. أرسل رسالة في المجموعة"
Write-Host "  4. افتح: https://api.telegram.org/bot$TELEGRAM_TOKEN/getUpdates"
Write-Host "  5. ابحث عن chat.id في النتيجة"
Write-Host ""

$TELEGRAM_CHAT_ID = Read-Host "أدخل Telegram Chat ID"

if ([string]::IsNullOrWhiteSpace($TELEGRAM_TOKEN) -or [string]::IsNullOrWhiteSpace($TELEGRAM_CHAT_ID)) {
    Write-Host ""
    Write-Host "❌ يجب إدخال Bot Token و Chat ID" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  النشر" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  ملاحظة: يجب أن تكون مسجل دخول في Supabase CLI" -ForegroundColor Yellow
Write-Host "إذا لم تكن مسجلاً، قم بتشغيل: supabase login" -ForegroundColor Cyan
Write-Host ""

$continue = Read-Host "هل تريد المتابعة؟ (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "تم الإلغاء" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "جاري النشر..." -ForegroundColor Yellow
Write-Host ""

# نشر Edge Function
Write-Host "1. نشر Edge Function..." -ForegroundColor Cyan
try {
    supabase functions deploy $FUNCTION_NAME --project-ref $SUPABASE_PROJECT
    Write-Host "✅ تم نشر Edge Function بنجاح" -ForegroundColor Green
} catch {
    Write-Host "❌ فشل نشر Edge Function" -ForegroundColor Red
    Write-Host "الخطأ: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "يرجى النشر يدوياً عبر Dashboard:" -ForegroundColor Yellow
    Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT/functions" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# إضافة Secrets
Write-Host "2. إضافة Secrets..." -ForegroundColor Cyan

try {
    Write-Host "  - إضافة TELEGRAM_TOKEN..." -ForegroundColor Gray
    $env:TELEGRAM_TOKEN = $TELEGRAM_TOKEN
    supabase secrets set TELEGRAM_TOKEN=$TELEGRAM_TOKEN --project-ref $SUPABASE_PROJECT
    
    Write-Host "  - إضافة TELEGRAM_CHAT_ID..." -ForegroundColor Gray
    $env:TELEGRAM_CHAT_ID = $TELEGRAM_CHAT_ID
    supabase secrets set TELEGRAM_CHAT_ID=$TELEGRAM_CHAT_ID --project-ref $SUPABASE_PROJECT
    
    Write-Host "✅ تم إضافة Secrets بنجاح" -ForegroundColor Green
} catch {
    Write-Host "❌ فشل إضافة Secrets" -ForegroundColor Red
    Write-Host "الخطأ: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "يرجى إضافة Secrets يدوياً عبر Dashboard:" -ForegroundColor Yellow
    Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT/settings/functions" -ForegroundColor Cyan
    Write-Host "  TELEGRAM_TOKEN = $TELEGRAM_TOKEN"
    Write-Host "  TELEGRAM_CHAT_ID = $TELEGRAM_CHAT_ID"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  الخطوات المتبقية" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "يجب إنشاء Database Webhook يدوياً:" -ForegroundColor Yellow
Write-Host ""
Write-Host "الطريقة 1: عبر SQL Editor" -ForegroundColor Cyan
Write-Host "  1. افتح: https://supabase.com/dashboard/project/$SUPABASE_PROJECT/sql/new"
Write-Host "  2. انسخ محتوى ملف: supabase/migrations/create_telegram_webhook_2026_04_22.sql"
Write-Host "  3. الصقه في المحرر واضغط Run"
Write-Host ""

Write-Host "الطريقة 2: عبر Webhooks UI" -ForegroundColor Cyan
Write-Host "  1. افتح: https://supabase.com/dashboard/project/$SUPABASE_PROJECT/database/hooks"
Write-Host "  2. اضغط Create a new webhook"
Write-Host "  3. Table: files"
Write-Host "  4. Events: INSERT"
Write-Host "  5. URL: $SUPABASE_URL/functions/v1/$FUNCTION_NAME"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  اختبار النظام" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "لاختبار النظام:" -ForegroundColor Yellow
Write-Host "  1. افتح: https://irtaqi.pages.dev/admin"
Write-Host "  2. كلمة المرور: admin123"
Write-Host "  3. ارفع ملف تجريبي"
Write-Host "  4. تحقق من وصول الإشعار في Telegram"
Write-Host ""

Write-Host "✅ تم الانتهاء!" -ForegroundColor Green
Write-Host ""
Write-Host "راجع ملف TELEGRAM_DEPLOYMENT_GUIDE.md للمزيد من التفاصيل" -ForegroundColor Cyan
