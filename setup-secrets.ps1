# سكريبت إعداد Secrets لـ Cloudflare Worker
# شغّله بعد تسجيل الدخول بـ: wrangler login

Write-Host "🔧 إعداد Cloudflare Worker Secrets..." -ForegroundColor Cyan

# اطلب بيانات المودل
$moodleUsername = Read-Host "أدخل اسم المستخدم في المودل"
$moodlePassword = Read-Host "أدخل كلمة المرور في المودل" -AsSecureString
$moodlePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($moodlePassword)
)

# Supabase Key (محدد مسبقاً)
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkamh1cnVmcWthbGljam1va2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTg4MzAsImV4cCI6MjA5MTkzNDgzMH0.eL0Np-s9leuOTBBo4OYUteLKwJPngv53TtYDe6Yk538"

Write-Host "`n📤 إضافة Secrets..." -ForegroundColor Yellow

# إضافة MOODLE_USERNAME
Write-Host $moodleUsername | wrangler secret put MOODLE_USERNAME
Write-Host "✅ MOODLE_USERNAME تم" -ForegroundColor Green

# إضافة MOODLE_PASSWORD
Write-Host $moodlePasswordPlain | wrangler secret put MOODLE_PASSWORD
Write-Host "✅ MOODLE_PASSWORD تم" -ForegroundColor Green

# إضافة SUPABASE_KEY
Write-Host $supabaseKey | wrangler secret put SUPABASE_KEY
Write-Host "✅ SUPABASE_KEY تم" -ForegroundColor Green

Write-Host "`n🚀 نشر Worker..." -ForegroundColor Cyan
wrangler deploy

Write-Host "`n🎉 تم! Worker الآن يعمل على Cloudflare 24/7" -ForegroundColor Green
Write-Host "⏰ سيتم المزامنة تلقائياً كل ساعة" -ForegroundColor Cyan
