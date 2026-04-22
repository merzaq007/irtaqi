-- إنشاء Database Webhook يستدعي Edge Function عند كل INSERT في جدول files
-- يجب تشغيل هذا بعد نشر Edge Function notify-telegram

-- تفعيل pg_net extension (مطلوب للـ webhooks)
create extension if not exists pg_net;

-- إنشاء الـ webhook function
create or replace function notify_telegram_on_new_file()
returns trigger
language plpgsql
security definer
as $$
declare
  supabase_url text := 'https://bdjhurufqkalicjmokbk.supabase.co';
  function_url text;
  service_key  text := current_setting('app.supabase_service_key', true);
begin
  function_url := supabase_url || '/functions/v1/notify-telegram';

  -- استدعاء Edge Function بشكل async
  perform net.http_post(
    url     := function_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body    := jsonb_build_object('record', row_to_json(NEW))
  );

  return NEW;
end;
$$;

-- إنشاء الـ trigger على جدول files
drop trigger if exists on_new_file_notify_telegram on files;

create trigger on_new_file_notify_telegram
  after insert on files
  for each row
  execute function notify_telegram_on_new_file();
