# نشر Edge Function notify-telegram
# شغّله مرة واحدة فقط

Write-Host "🚀 نشر Edge Function notify-telegram..." -ForegroundColor Cyan

# أدخل بيانات Telegram
$token  = Read-Host "أدخل Telegram Bot Token"
$chatId = Read-Host "أدخل Telegram Chat ID"

# نشر الـ function
Write-Host "`n📤 نشر الـ function..." -ForegroundColor Yellow
supabase functions deploy notify-telegram --project-ref bdjhurufqkalicjmokbk

# إضافة secrets
Write-Host "`n🔑 إضافة Telegram secrets..." -ForegroundColor Yellow
supabase secrets set TELEGRAM_TOKEN=$token --project-ref bdjhurufqkalicjmokbk
supabase secrets set TELEGRAM_CHAT_ID=$chatId --project-ref bdjhurufqkalicjmokbk

Write-Host "`n✅ تم! الآن كل ملف جديد سيرسل إشعار Telegram تلقائياً" -ForegroundColor Green
Write-Host "🔗 اختبر الـ function من Supabase Dashboard > Edge Functions" -ForegroundColor Cyan
