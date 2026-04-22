// Background Service Worker - Irtaqi Moodle Sync
console.log('🔧 Irtaqi Sync - Background Active');

const SUPABASE_URL = 'https://bdjhurufqkalicjmokbk.supabase.co';

// ===== استقبال الرسائل =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === 'FILES_FOUND') {
    processFiles(message.files);
  }

  else if (message.type === 'MANUAL_SYNC') {
    processFiles(message.files).then(result => sendResponse(result));
    return true;
  }

  else if (message.type === 'GET_STATS') {
    getStats().then(sendResponse);
    return true;
  }

  // مزامنة كل المقاييس من نتائج الـ scanner
  else if (message.type === 'SYNC_ALL_COURSES') {
    syncAllCourses(message.courses).then(sendResponse);
    return true;
  }
});

// ===== مزامنة كل المقاييس (3 طبقات) =====
async function syncAllCourses(courses) {
  const courseIds = Object.keys(courses);
  if (courseIds.length === 0) return { total: 0 };

  const { supabaseKey } = await chrome.storage.local.get('supabaseKey');
  if (!supabaseKey) return { error: 'no_key' };

  let totalFiles = 0;

  for (const courseId of courseIds) {
    const info = courses[courseId];

    // افتح تاب للـ course
    const tab = await chrome.tabs.create({
      url: `https://moodle.univ-tiaret.dz/course/view.php?id=${courseId}`,
      active: false
    });

    // انتظر تحميل الصفحة
    await waitForTabLoad(tab.id);
    await sleep(1500);

    // احفظ الـ moduleId لهذا الـ course
    const moduleId = info.moduleId || guessModuleId(info.catName || '') || 'moodle_auto_sync';
    await chrome.storage.local.set({ [`course_${courseId}`]: moduleId });

    // اجلب الملفات من الصفحة
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractFilesFromPage
      });

      const files = results?.[0]?.result || [];
      const taggedFiles = files.map(f => ({ ...f, moduleId }));

      if (taggedFiles.length > 0) {
        await processFiles(taggedFiles);
        totalFiles += taggedFiles.length;
        console.log(`📤 Course ${courseId}: ${taggedFiles.length} files`);
      }
    } catch (e) {
      console.warn(`⚠️ Course ${courseId} error:`, e.message);
    }

    // أغلق التاب
    await chrome.tabs.remove(tab.id);
    await sleep(500);
  }

  return { total: totalFiles };
}

// دالة تُحقن في صفحة الـ course لاستخراج الملفات
function extractFilesFromPage() {
  const files = [];
  const seen = new Set();
  const allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip'];

  document.querySelectorAll('a[href*="pluginfile.php"], a[href*="mod/resource"]').forEach(link => {
    const url = link.href;
    if (!url || seen.has(url)) return;

    const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext) && !url.includes('mod/resource')) return;

    seen.add(url);

    let name = link.querySelector('.instancename')?.textContent?.trim()
      || link.textContent.trim()
      || decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'file');
    name = name.replace(/\s+/g, ' ').trim();

    files.push({ name, url });
  });

  return files;
}

// انتظار تحميل تاب
function waitForTabLoad(tabId) {
  return new Promise(resolve => {
    const listener = (id, info) => {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    // timeout بعد 15 ثانية
    setTimeout(resolve, 15000);
  });
}

// تخمين moduleId من اسم القسم
function guessModuleId(catName) {
  const name = catName.toLowerCase();
  if (name.includes('ويب') || name.includes('web')) return 'web-apps';
  if (name.includes('وثيق') || name.includes('document')) return 'digital-document';
  if (name.includes('هندس') || name.includes('engineer')) return 'info-engineering';
  if (name.includes('منص') || name.includes('platform')) return 'digital-platforms';
  if (name.includes('منهج') || name.includes('research')) return 'research-methodology';
  if (name.includes('بيان') || name.includes('data')) return 'research-data-management';
  if (name.includes('حوكم') || name.includes('سمع')) return 'governance-e-reputation';
  if (name.includes('برمج') || name.includes('ذكاء') || name.includes('ai')) return 'programming-ai';
  if (name.includes('مقاول') || name.includes('entrepren')) return 'entrepreneurship';
  if (name.includes('شبك') || name.includes('social')) return 'social-networks';
  if (name.includes('إنجليز') || name.includes('english')) return 'english-language';
  return null;
}

// ===== معالجة الملفات ورفعها =====
async function processFiles(files) {
  if (!files || files.length === 0) return { synced: 0, skipped: 0 };

  const { supabaseKey } = await chrome.storage.local.get('supabaseKey');
  if (!supabaseKey) {
    console.warn('❌ Supabase key missing');
    return { error: 'no_key' };
  }

  const existingUrls = await getExistingFileUrls(supabaseKey);
  let synced = 0, skipped = 0;

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
      await updateStats(1);
      notify(`✅ تمت المزامنة`, file.name);
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
    const res = await fetch(file.url, { credentials: 'include' });
    if (!res.ok) return false;
    const blob = await res.blob();

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
async function updateStats(count) {
  const { totalSynced = 0 } = await chrome.storage.local.get('totalSynced');
  await chrome.storage.local.set({
    totalSynced: totalSynced + count,
    lastSync: new Date().toLocaleString('ar')
  });
}

async function getStats() {
  return await chrome.storage.local.get(['totalSynced', 'lastSync', 'supabaseKey']);
}

// ===== إشعارات =====
function notify(title, message) {
  chrome.notifications.create(`notif_${Date.now()}`, {
    type: 'basic',
    iconUrl: 'icon.svg',
    title,
    message
  });
}

// ===== مزامنة دورية كل 30 دقيقة =====
chrome.alarms.create('autoSync', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'autoSync') return;

  // إذا في تابات مفتوحة على Moodle، امسح منها
  const tabs = await chrome.tabs.query({ url: '*://moodle.univ-tiaret.dz/*' });
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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
