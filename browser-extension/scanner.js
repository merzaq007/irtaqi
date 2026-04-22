// Scanner - يقرأ الصفحة المفتوحة أمامك مباشرة (لا fetch، لا CORS)
const MOODLE = 'https://moodle.univ-tiaret.dz';
const ROOT_CAT = '29773';

const statusEl  = document.getElementById('status');
const progressEl = document.getElementById('progress');
const resultEl  = document.getElementById('result');
const copyBtn   = document.getElementById('copyBtn');
const syncBtn   = document.getElementById('syncAllBtn');

document.getElementById('scanBtn').addEventListener('click', startScan);

document.getElementById('openMoodleBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://moodle.univ-tiaret.dz/course/index.php?categoryid=29773' });
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(resultEl.textContent);
  copyBtn.textContent = '✅ تم النسخ!';
  setTimeout(() => copyBtn.textContent = '📋 نسخ النتائج', 2000);
});

if (syncBtn) {
  syncBtn.addEventListener('click', async () => {
    const data = await chrome.storage.local.get('allCourses');
    const courses = data.allCourses || {};
    const ids = Object.keys(courses);
    if (ids.length === 0) { statusEl.textContent = '⚠️ امسح أولاً'; return; }

    syncBtn.disabled = true;
    syncBtn.textContent = '⏳ جاري المزامنة...';
    chrome.runtime.sendMessage({ type: 'SYNC_ALL_COURSES', courses }, (res) => {
      syncBtn.disabled = false;
      syncBtn.textContent = `🔄 مزامنة كل الملفات (${ids.length} مقياس)`;
      statusEl.textContent = `✅ تم إرسال ${res?.total || 0} ملف`;
    });
  });
}

async function startScan() {
  document.getElementById('scanBtn').disabled = true;
  statusEl.textContent = '⏳ جاري المسح...';
  resultEl.style.display = 'none';
  copyBtn.style.display = 'none';
  if (syncBtn) syncBtn.style.display = 'none';
  resultEl.textContent = '';
  progressEl.textContent = '';

  // تحقق من أن المستخدم فاتح صفحة Moodle
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!activeTab?.url?.includes('moodle.univ-tiaret.dz')) {
    statusEl.textContent = '❌ افتح صفحة Moodle أولاً';
    progressEl.textContent = '';
    // افتح الرابط تلقائياً
    chrome.tabs.create({ url: `https://moodle.univ-tiaret.dz/course/index.php?categoryid=${ROOT_CAT}` });
    setTimeout(() => {
      statusEl.textContent = '✅ تم فتح الصفحة — اضغط "ابدأ المسح" مجدداً';
    }, 2000);
    document.getElementById('scanBtn').disabled = false;
    return;
  }

  try {
    const allCourses = {};

    // ===== الخطوة 1: اقرأ الصفحة الحالية =====
    progressEl.textContent = '📂 طبقة 1: قراءة الصفحة الحالية...';

    const layer1Result = await injectAndRead(activeTab.id);
    log(`طبقة 1: ${layer1Result.subCats.length} قسم، ${layer1Result.courses.length} مقياس مباشر`);

    for (const c of layer1Result.courses) {
      allCourses[c.id] = { name: c.name, level: 1 };
    }

    // ===== الخطوة 2: افتح كل sub-category في تاب مخفي واقرأها =====
    for (let i = 0; i < layer1Result.subCats.length; i++) {
      const cat2 = layer1Result.subCats[i];
      progressEl.textContent = `📂 طبقة 2: ${i + 1}/${layer1Result.subCats.length} — ${cat2.name.substring(0, 40)}`;

      const layer2Result = await openAndRead(`${MOODLE}/course/index.php?categoryid=${cat2.id}`);
      log(`  └ ${cat2.name}: ${layer2Result.courses.length} مقياس، ${layer2Result.subCats.length} قسم فرعي`);

      for (const c of layer2Result.courses) {
        allCourses[c.id] = { name: c.name, catName: cat2.name, level: 2 };
      }

      // ===== الخطوة 3: طبقة 3 =====
      for (const cat3 of layer2Result.subCats) {
        progressEl.textContent = `📂 طبقة 3: ${cat3.name.substring(0, 40)}`;
        const layer3Result = await openAndRead(`${MOODLE}/course/index.php?categoryid=${cat3.id}`);
        log(`    └ ${cat3.name}: ${layer3Result.courses.length} مقياس`);

        for (const c of layer3Result.courses) {
          allCourses[c.id] = { name: c.name, catName: cat3.name, parentCat: cat2.name, level: 3 };
        }
      }
    }

    // حفظ في storage
    await chrome.storage.local.set({ allCourses });

    const total = Object.keys(allCourses).length;
    progressEl.textContent = '';
    statusEl.textContent = `✅ تم! ${total} مقياس على 3 طبقات`;

    // عرض النتائج
    let output = `إجمالي المقاييس: ${total}\n`;
    output += `─────────────────────────\n`;
    for (const [id, info] of Object.entries(allCourses)) {
      output += `\nID: ${id}\n`;
      output += `  الاسم: ${info.name}\n`;
      if (info.catName) output += `  القسم: ${info.catName}\n`;
      output += `  الطبقة: ${info.level}\n`;
    }

    resultEl.textContent = output;
    resultEl.style.display = 'block';
    copyBtn.style.display = 'block';
    if (syncBtn) {
      syncBtn.textContent = `🔄 مزامنة كل الملفات (${total} مقياس)`;
      syncBtn.style.display = 'block';
    }

  } catch (e) {
    statusEl.textContent = `❌ خطأ: ${e.message}`;
    progressEl.textContent = '';
    console.error(e);
  }

  document.getElementById('scanBtn').disabled = false;
}

// قراءة التاب الحالي المفتوح
async function injectAndRead(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: extractCategoryData
  });
  return results?.[0]?.result || { subCats: [], courses: [] };
}

// فتح رابط في تاب مخفي، قراءته، ثم إغلاقه
async function openAndRead(url) {
  const tab = await chrome.tabs.create({ url, active: false });
  await waitForLoad(tab.id);
  await sleep(800);

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractCategoryData
  });

  await chrome.tabs.remove(tab.id);
  return results?.[0]?.result || { subCats: [], courses: [] };
}

// الدالة التي تُحقن في الصفحة لاستخراج البيانات
function extractCategoryData() {
  const ROOT = '29773';
  const subCats = [];
  const courses = [];
  const seenCats = new Set();
  const seenCourses = new Set();

  const currentCatId = new URL(window.location.href).searchParams.get('categoryid') || '';

  // Sub-categories
  document.querySelectorAll('a[href*="categoryid="]').forEach(a => {
    const m = a.href.match(/categoryid=(\d+)/);
    if (!m) return;
    const id = m[1];
    if (id === currentCatId || id === ROOT || seenCats.has(id)) return;
    const name = a.textContent.trim().replace(/\s+/g, ' ');
    if (name.length < 2) return;
    seenCats.add(id);
    subCats.push({ id, name });
  });

  // Courses
  document.querySelectorAll('a[href*="course/view.php"]').forEach(a => {
    const m = a.href.match(/course\/view\.php\?id=(\d+)/);
    if (!m || seenCourses.has(m[1])) return;
    let name = a.textContent.trim().replace(/\s+/g, ' ');
    if (!name || name.length < 2) {
      const box = a.closest('.coursebox, .course_title, li, .card');
      if (box) name = box.querySelector('h2,h3,h4,.coursename')?.textContent?.trim() || name;
    }
    seenCourses.add(m[1]);
    courses.push({ id: m[1], name: name.substring(0, 80) });
  });

  // Enrol links
  document.querySelectorAll('a[href*="enrol/index.php"]').forEach(a => {
    const m = a.href.match(/[?&]id=(\d+)/);
    if (!m || seenCourses.has(m[1])) return;
    const name = a.textContent.trim().replace(/\s+/g, ' ');
    seenCourses.add(m[1]);
    courses.push({ id: m[1], name: name.substring(0, 80) });
  });

  return { subCats, courses };
}

function waitForLoad(tabId) {
  return new Promise(resolve => {
    const fn = (id, info) => {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(fn);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(fn);
    setTimeout(resolve, 12000);
  });
}

function log(msg) {
  resultEl.textContent += msg + '\n';
  resultEl.style.display = 'block';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
