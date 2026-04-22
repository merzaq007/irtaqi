// Background Service Worker - Irtaqi Downloader v2
const SUPABASE_URL = 'https://bdjhurufqkalicjmokbk.supabase.co';
const MOODLE_URL   = 'https://moodle.univ-tiaret.dz';

const MODULE_MAP = {
  'web-apps':                 'تطبيقات الويب',
  'digital-document':         'الوثيقة الرقمية',
  'info-engineering':         'هندسة المعلومات',
  'digital-platforms':        'المنصات الرقمية',
  'research-methodology':     'منهجية البحث',
  'research-data-management': 'إدارة بيانات البحث',
  'governance-e-reputation':  'الحوكمة والسمعة',
  'programming-ai':           'البرمجة والذكاء الاصطناعي',
  'entrepreneurship':         'المقاولاتية',
  'social-networks':          'شبكات التواصل',
  'english-language':         'اللغة الإنجليزية',
};

// ===== استقبال الرسائل =====
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'UPLOAD_FILES') {
    uploadFiles(msg.files, msg.moduleId, msg.courseName).then(sendResponse);
    return true;
  }
  if (msg.type === 'GET_SETTINGS') {
    chrome.storage.local.get(['supabaseKey', 'telegramToken', 'telegramChatId', 'workerUrl', 'totalSynced', 'lastSync'])
      .then(sendResponse);
    return true;
  }
  if (msg.type === 'NEW_FILES_DETECTED') {
    handleNewFiles(msg.files, msg.courseName, msg.moduleId);
  }
});

// ===== رفع الملفات إلى Supabase =====
async function uploadFiles(files, moduleId, courseName) {
  const { supabaseKey } = await chrome.storage.local.get('supabaseKey');
  if (!supabaseKey) return { error: 'no_key', synced: 0 };

  const existingUrls = await getExistingUrls(supabaseKey);
  let synced = 0;

  for (const file of files) {
    if (existingUrls.has(file.url)) continue;

    try {
      const res  = await fetch(file.url, { credentials: 'include' });
      if (!res.ok) continue;
      const blob = await res.blob();

      const safeName = file.name.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, '_').slice(0, 100);
      const path     = `moodle/${moduleId}/${Date.now()}_${safeName}`;

      const up = await fetch(`${SUPABASE_URL}/storage/v1/object/course-files/${path}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': blob.type || 'application/octet-stream' },
        body: blob
      });
      if (!up.ok) continue;

      const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/course-files/${path}`;
      const db = await fetch(`${SUPABASE_URL}/rest/v1/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          file_name:  file.name,
          file_url:   fileUrl,
          file_type:  file.name.split('.').pop()?.toUpperCase() || 'FILE',
          file_size:  blob.size,
          module_id:  moduleId || 'moodle_auto_sync'
        })
      });

      if (db.ok) {
        synced++;
        existingUrls.add(file.url);
      }
    } catch (e) {
      console.warn('Upload error:', file.name, e.message);
    }
  }

  // تحديث الإحصائيات
  if (synced > 0) {
    const { totalSynced = 0 } = await chrome.storage.local.get('totalSynced');
    await chrome.storage.local.set({
      totalSynced: totalSynced + synced,
      lastSync: new Date().toLocaleString('ar')
    });
    // إشعار Telegram
    await sendTelegram(
      `📚 <b>ارتقي - ملفات جديدة!</b>\n\n` +
      `📖 المقياس: <b>${MODULE_MAP[moduleId] || courseName}</b>\n` +
      `📄 عدد الملفات: <b>${synced}</b>\n\n` +
      files.slice(0, 5).map(f => `• ${f.name}`).join('\n') +
      (files.length > 5 ? `\n... و${files.length - 5} ملفات أخرى` : '') +
      `\n\n🔗 <a href="https://irtaqi.pages.dev">افتح المنصة</a>`
    );
  }

  return { synced, total: files.length };
}

// ===== إشعار عند اكتشاف ملفات جديدة (مراقبة) =====
async function handleNewFiles(files, courseName, moduleId) {
  if (!files || files.length === 0) return;

  // إشعار المتصفح
  chrome.notifications.create(`new_${Date.now()}`, {
    type: 'basic',
    iconUrl: 'icon.svg',
    title: `📚 ملفات جديدة - ${MODULE_MAP[moduleId] || courseName}`,
    message: `${files.length} ملف جديد في ${courseName}`
  });

  // رفع تلقائي
  await uploadFiles(files, moduleId, courseName);
}

// ===== إرسال إشعار Telegram =====
async function sendTelegram(text) {
  const { telegramToken, telegramChatId } = await chrome.storage.local.get(['telegramToken', 'telegramChatId']);
  if (!telegramToken || !telegramChatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramChatId, text, parse_mode: 'HTML' })
    });
  } catch (e) { console.warn('Telegram error:', e.message); }
}

// ===== جلب الملفات الموجودة =====
async function getExistingUrls(supabaseKey) {
  try {
    const res  = await fetch(`${SUPABASE_URL}/rest/v1/files?select=file_url`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const data = await res.json();
    return new Set((data || []).map(f => f.file_url));
  } catch { return new Set(); }
}

// ===== مراقبة دورية كل 30 دقيقة =====
chrome.alarms.create('monitor', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'monitor') return;
  const tabs = await chrome.tabs.query({ url: '*://moodle.univ-tiaret.dz/course/view.php*' });
  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id, { type: 'SCAN_FOR_NEW' }, () => {});
  }
});
