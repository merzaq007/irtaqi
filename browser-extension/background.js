// Background Service Worker - Irtaqi Moodle Sync
console.log('🔧 Irtaqi Sync - Background Active');

const SUPABASE_URL = 'https://bdjhurufqkalicjmokbk.supabase.co';

// ===== استقبال الرسائل =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FILES_FOUND') {
    processFiles(message.files);
  } else if (message.type === 'MANUAL_SYNC') {
    processFiles(message.files).then(result => sendResponse(result));
    return true; // async
  } else if (message.type === 'GET_STATS') {
    getStats().then(sendResponse);
    return true;
  }
});

// ===== معالجة الملفات =====
async function processFiles(files) {
  if (!files || files.length === 0) return { synced: 0, skipped: 0 };

  const { supabaseKey } = await chrome.storage.local.get('supabaseKey');
  if (!supabaseKey) {
    console.warn('❌ Supabase key missing');
    return { error: 'no_key' };
  }

  // جلب الملفات الموجودة مسبقاً لتجنب التكرار
  const existingUrls = await getExistingFileUrls(supabaseKey);

  let synced = 0;
  let skipped = 0;

  for (const file of files) {
    const alreadySynced = await isAlreadySynced(file);
    if (alreadySynced || existingUrls.has(file.url)) {
      skipped++;
      continue;
    }

    const success = await uploadFile(file, supabaseKey);
    if (success) {
      await markAsSynced(file);
      synced++;
      await updateStats(synced);
      notify(`✅ تمت المزامنة`, `${file.name}`);
    }
  }

  console.log(`✅ Synced: ${synced}, Skipped: ${skipped}`);
  return { synced, skipped };
}

// ===== جلب الملفات الموجودة في Supabase =====
async function getExistingFileUrls(supabaseKey) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/files?select=file_url`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const data = await res.json();
    return new Set((data || []).map(f => f.file_url));
  } catch { return new Set(); }
}

// ===== رفع ملف =====
async function uploadFile(file, supabaseKey) {
  try {
    // تحميل الملف
    const res = await fetch(file.url);
    if (!res.ok) return false;
    const blob = await res.blob();

    // رفع للـ Storage
    const fileName = `moodle/${Date.now()}_${sanitizeName(file.name)}`;
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/course-files/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': blob.type || 'application/octet-stream'
      },
      body: blob
    });
    if (!uploadRes.ok) return false;

    const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/course-files/${fileName}`;
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    // حفظ في قاعدة البيانات
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        file_name: file.name,
        file_url: fileUrl,
        file_type: ext,
        file_size: blob.size,
        module_id: file.moduleId || 'moodle_auto_sync'
      })
    });

    return dbRes.ok;
  } catch (e) {
    console.error('Upload error:', e);
    return false;
  }
}

// ===== تتبع الملفات المزامنة محلياً =====
async function isAlreadySynced(file) {
  const key = `synced_${btoa(file.url).slice(0, 20)}`;
  const data = await chrome.storage.local.get(key);
  return !!data[key];
}

async function markAsSynced(file) {
  const key = `synced_${btoa(file.url).slice(0, 20)}`;
  await chrome.storage.local.set({ [key]: true });
}

// ===== إحصائيات =====
async function updateStats(newCount) {
  const { totalSynced = 0 } = await chrome.storage.local.get('totalSynced');
  await chrome.storage.local.set({ totalSynced: totalSynced + newCount, lastSync: new Date().toLocaleString('ar') });
}

async function getStats() {
  return await chrome.storage.local.get(['totalSynced', 'lastSync', 'supabaseKey']);
}

// ===== إشعارات =====
function notify(title, message) {
  chrome.notifications.create(`notif_${Date.now()}`, {
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message
  });
}

// ===== مزامنة دورية كل 15 دقيقة =====
chrome.alarms.create('autoSync', { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'autoSync') return;

  // ابحث عن تاب مفتوح على Moodle
  const tabs = await chrome.tabs.query({ url: '*://moodle.univ-tiaret.dz/*' });
  if (tabs.length === 0) return;

  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id, { type: 'AUTO_SCAN' }, (res) => {
      if (chrome.runtime.lastError) return;
      if (res?.files?.length > 0) processFiles(res.files);
    });
  }
});

// ===== مساعدات =====
function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, '_').slice(0, 100);
}
