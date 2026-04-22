# Deploy Edge Function: notify-telegram
# Run once after: npm install -g supabase

$token  = Read-Host "Enter Telegram Bot Token"
$chatId = Read-Host "Enter Telegram Chat ID"

Write-Host "Deploying notify-telegram function..." -ForegroundColor Cyan
supabase functions deploy notify-telegram --project-ref bdjhurufqkalicjmokbk

Write-Host "Setting secrets..." -ForegroundColor Yellow
supabase secrets set TELEGRAM_TOKEN=$token --project-ref bdjhurufqkalicjmokbk
supabase secrets set TELEGRAM_CHAT_ID=$chatId --project-ref bdjhurufqkalicjmokbk

Write-Host "Done! Every new file will trigger a Telegram notification." -ForegroundColor Green
