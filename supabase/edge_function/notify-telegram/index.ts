// Supabase Edge Function - notify-telegram
// تُستدعى تلقائياً عند إضافة ملف جديد في جدول files (Database Webhook)

const MODULE_NAMES: Record<string, string> = {
  'web-apps':                 'تطبيقات الويب في أنظمة المعلومات الوثائقية',
  'digital-document':         'الوثيقة الرقمية',
  'info-engineering':         'هندسة المعلومات',
  'digital-platforms':        'المنصات الرقمية الوثائقية',
  'research-methodology':     'منهجية البحث العلمي',
  'research-data-management': 'إدارة بيانات البحث',
  'governance-e-reputation':  'الحوكمة والسمعة الإلكترونية',
  'programming-ai':           'البرمجة والذكاء الاصطناعي',
  'entrepreneurship':         'المقاولاتية والمؤسسات الناشئة',
  'social-networks':          'شبكات التواصل الاجتماعي',
  'english-language':         'اللغة الإنجليزية',
};

const FILE_EMOJI: Record<string, string> = {
  PDF: '📕', DOC: '📘', DOCX: '📘',
  PPT: '📙', PPTX: '📙',
  XLS: '📗', XLSX: '📗',
  ZIP: '🗜️',
};

Deno.serve(async (req) => {
  try {
    const TELEGRAM_TOKEN = Deno.env.get('TELEGRAM_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    const IRTAQI_URL = 'https://irtaqi.pages.dev';

    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
      return new Response('Missing Telegram config', { status: 500 });
    }

    // Supabase يرسل payload عند INSERT في جدول files
    const payload = await req.json();
    const record = payload?.record;

    if (!record) {
      return new Response('No record', { status: 400 });
    }

    const moduleName = MODULE_NAMES[record.module_id] || record.module_id || 'غير محدد';
    const fileType   = record.file_type || 'FILE';
    const emoji      = FILE_EMOJI[fileType] || '📄';
    const fileSize   = record.file_size
      ? record.file_size > 1024 * 1024
        ? `${(record.file_size / 1024 / 1024).toFixed(1)} MB`
        : `${Math.round(record.file_size / 1024)} KB`
      : '';

    const message =
      `📚 <b>منصة ارتقي - درس جديد!</b>\n\n` +
      `${emoji} <b>${record.file_name}</b>\n` +
      `📖 المقياس: <b>${moduleName}</b>\n` +
      (fileSize ? `📦 الحجم: ${fileSize}\n` : '') +
      `\n🔗 <a href="${IRTAQI_URL}">افتح المنصة وحمّل الدرس</a>`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
