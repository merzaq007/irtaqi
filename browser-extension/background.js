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
  if (msg.type === 'FULL_SCAN') {
    fullScan().then(sendResponse);
    return true;
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

// ===== مسح شامل لكل المقاييس =====
async function fullScan() {
  const { supabaseKey } = await chrome.storage.local.get('supabaseKey');
  if (!supabaseKey) return { error: 'no_key' };

  // الخطوة 1: مسح الطبقات الثلاث واستخراج كل course IDs
  const courseLinks = await fetchAllCourseLinks();
  if (!courseLinks.length) return { error: 'no_courses' };

  // الخطوة 2: حفظ الـ course IDs في Supabase لاستخدامها بالـ Worker
  await saveCourseIdsToSupabase(supabaseKey, courseLinks);

  let totalSynced = 0;
  const results = [];

  // الخطوة 3: رفع ملفات كل مقياس
  for (const course of courseLinks) {
    try {
      const tab = await chrome.tabs.create({ url: course.url, active: false });
      await waitForTab(tab.id);
      await sleep(2000);

      try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
        await sleep(1000);
      } catch {}

      const res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_FILES' }).catch(() => null);
      chrome.tabs.remove(tab.id);

      if (res?.files?.length) {
        const uploaded = await uploadFiles(res.files, res.moduleId, res.courseName);
        totalSynced += uploaded.synced || 0;
        results.push({ course: res.courseName, synced: uploaded.synced, total: res.files.length });
      }
    } catch (e) {
      results.push({ course: course.url, error: e.message });
    }
  }

  await chrome.storage.local.set({ lastFullScan: new Date().toLocaleString('ar') });
  return { totalSynced, results, coursesFound: courseLinks.length };
}

// ===== حفظ course IDs في Supabase للـ Worker =====
async function saveCourseIdsToSupabase(supabaseKey, courseLinks) {
  for (const course of courseLinks) {
    const courseId = new URL(course.url).searchParams.get('id');
    if (!courseId) continue;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/moodle_courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          course_id: courseId,
          course_name: course.name,
          module_id: course.moduleId || 'moodle_auto_sync',
          last_scanned: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn('saveCourse error:', e.message);
    }
  }
}

// ===== جلب روابط كل المقاييس - مسح الطبقات الثلاث =====
async function fetchAllCourseLinks() {
  // الطبقة 1: categoryid الخاص بتخصص ماستر علم المكتبات
  const CATEGORY_ID = '29773';
  const links = [];

  try {
    // --- الطبقة 1: صفحة التخصص الرئيسية ---
    const tab1 = await chrome.tabs.create({
      url: `${MOODLE_URL}/course/index.php?categoryid=${CATEGORY_ID}`,
      active: false
    });
    await waitForTab(tab1.id);
    await sleep(2000);

    const result1 = await chrome.scripting.executeScript({
      target: { tabId: tab1.id },
      func: () => {
        const directCourses = [];
        const subCats = [];
        document.querySelectorAll('a[href*="course/view.php"]').forEach(a => {
          if (!directCourses.find(l => l.url === a.href))
            directCourses.push({ url: a.href, name: a.textContent.trim() });
        });
        document.querySelectorAll('a[href*="categoryid="]').forEach(a => {
          const id = new URL(a.href).searchParams.get('categoryid');
          if (id) subCats.push({ url: a.href, id });
        });
        return { directCourses, subCats };
      }
    });
    chrome.tabs.remove(tab1.id);

    const { directCourses, subCats } = result1[0].result;
    links.push(...directCourses);

    // --- الطبقة 2: الفصول/السنوات (subcategories) ---
    for (const cat of subCats.slice(0, 15)) {
      const tab2 = await chrome.tabs.create({ url: cat.url, active: false });
      await waitForTab(tab2.id);
      await sleep(1500);

      const result2 = await chrome.scripting.executeScript({
        target: { tabId: tab2.id },
        func: () => {
          const courses = [];
          const subCats2 = [];
          document.querySelectorAll('a[href*="course/view.php"]').forEach(a => {
            if (!courses.find(l => l.url === a.href))
              courses.push({ url: a.href, name: a.textContent.trim() });
          });
          document.querySelectorAll('a[href*="categoryid="]').forEach(a => {
            const id = new URL(a.href).searchParams.get('categoryid');
            if (id) subCats2.push({ url: a.href, id });
          });
          return { courses, subCats2 };
        }
      });
      chrome.tabs.remove(tab2.id);

      const { courses: l2courses, subCats2 } = result2[0].result;
      links.push(...l2courses);

      // --- الطبقة 3: المقاييس داخل الفصل ---
      for (const cat2 of subCats2.slice(0, 15)) {
        const tab3 = await chrome.tabs.create({ url: cat2.url, active: false });
        await waitForTab(tab3.id);
        await sleep(1500);

        const result3 = await chrome.scripting.executeScript({
          target: { tabId: tab3.id },
          func: () => {
            const courses = [];
            document.querySelectorAll('a[href*="course/view.php"]').forEach(a => {
              if (!courses.find(l => l.url === a.href))
                courses.push({ url: a.href, name: a.textContent.trim() });
            });
            return courses;
          }
        });
        chrome.tabs.remove(tab3.id);
        links.push(...(result3[0].result || []));
      }
    }
  } catch (e) {
    console.warn('fetchAllCourseLinks error:', e.message);
  }

  // إزالة التكرار + إضافة moduleId
  const unique = [...new Map(links.map(l => [l.url, l])).values()];
  return unique.map(l => ({ ...l, moduleId: guessModuleIdFromName(l.name) }));
}

function guessModuleIdFromName(name) {
  if (!name) return 'moodle_auto_sync';
  const lower = name.toLowerCase();
  if (lower.includes('ويب') || lower.includes('web')) return 'web-apps';
  if (lower.includes('وثيقة رقمية')) return 'digital-document';
  if (lower.includes('هندسة المعلومات')) return 'info-engineering';
  if (lower.includes('منصات رقمية')) return 'digital-platforms';
  if (lower.includes('منهجية') || lower.includes('بحث علمي')) return 'research-methodology';
  if (lower.includes('بيانات البحث') || lower.includes('إدارة بيانات')) return 'research-data-management';
  if (lower.includes('حوكمة') || lower.includes('سمعة')) return 'governance-e-reputation';
  if (lower.includes('برمجة') || lower.includes('ذكاء')) return 'programming-ai';
  if (lower.includes('مقاولاتية') || lower.includes('ناشئة')) return 'entrepreneurship';
  if (lower.includes('شبكات تواصل')) return 'social-networks';
  if (lower.includes('إنجليزية') || lower.includes('english')) return 'english-language';
  return 'moodle_auto_sync';
}

function waitForTab(tabId) {
  return new Promise(resolve => {
    chrome.tabs.onUpdated.addListener(function listener(id, info) {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
    // timeout بعد 15 ثانية
    setTimeout(resolve, 15000);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===== مراقبة دورية كل 30 دقيقة =====
chrome.alarms.create('monitor', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'monitor') return;
  const tabs = await chrome.tabs.query({ url: '*://moodle.univ-tiaret.dz/course/view.php*' });
  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id, { type: 'SCAN_FOR_NEW' }, () => {});
  }
});
