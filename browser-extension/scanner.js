// Scanner - يمشي على 3 طبقات من categoryid=29773 ويجمع كل course IDs
const MOODLE = 'https://moodle.univ-tiaret.dz';
const ROOT_CAT = '29773'; // السداسي الثاني - تخصصك

const statusEl  = document.getElementById('status');
const progressEl = document.getElementById('progress');
const resultEl  = document.getElementById('result');
const copyBtn   = document.getElementById('copyBtn');
const syncBtn   = document.getElementById('syncAllBtn');

document.getElementById('scanBtn').addEventListener('click', startScan);

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(resultEl.textContent);
  copyBtn.textContent = '✅ تم النسخ!';
  setTimeout(() => copyBtn.textContent = '📋 نسخ النتائج', 2000);
});

// زر مزامنة كل الملفات بعد المسح
if (syncBtn) {
  syncBtn.addEventListener('click', async () => {
    const data = await chrome.storage.local.get('allCourses');
    const courses = data.allCourses || {};
    const ids = Object.keys(courses);
    if (ids.length === 0) {
      statusEl.textContent = '⚠️ امسح أولاً ثم زامن';
      return;
    }
    syncBtn.disabled = true;
    syncBtn.textContent = '⏳ جاري فتح المقاييس...';

    // أرسل للـ background ليزور كل course ويجلب ملفاتها
    chrome.runtime.sendMessage({ type: 'SYNC_ALL_COURSES', courses }, (res) => {
      syncBtn.disabled = false;
      syncBtn.textContent = '🔄 مزامنة كل الملفات';
      statusEl.textContent = `✅ تم إرسال ${res?.total || 0} ملف للمزامنة`;
    });
  });
}

async function startScan() {
  document.getElementById('scanBtn').disabled = true;
  statusEl.textContent = '⏳ جاري المسح على 3 طبقات...';
  resultEl.style.display = 'none';
  copyBtn.style.display = 'none';
  if (syncBtn) syncBtn.style.display = 'none';
  resultEl.textContent = '';
  progressEl.textContent = '';

  const finalCourses = {}; // courseId -> { name, catId, catName, moduleId, level }

  try {
    // ======= طبقة 1: السداسي الثاني =======
    progressEl.textContent = `📂 طبقة 1: جلب المقاييس من السداسي (${ROOT_CAT})...`;
    const layer1 = await fetchPage(ROOT_CAT);
    log(`طبقة 1: ${layer1.subCats.length} قسم فرعي، ${layer1.courses.length} مقياس مباشر`);

    // مقاييس مباشرة في الطبقة 1
    for (const c of layer1.courses) {
      finalCourses[c.id] = { name: c.name, catId: ROOT_CAT, catName: 'السداسي الثاني', level: 1 };
    }

    // ======= طبقة 2: كل قسم فرعي =======
    for (let i = 0; i < layer1.subCats.length; i++) {
      const cat2 = layer1.subCats[i];
      progressEl.textContent = `📂 طبقة 2: ${i + 1}/${layer1.subCats.length} — ${cat2.name.substring(0, 45)}`;

      const layer2 = await fetchPage(cat2.id);
      log(`  └ ${cat2.name}: ${layer2.courses.length} مقياس، ${layer2.subCats.length} قسم فرعي`);

      for (const c of layer2.courses) {
        finalCourses[c.id] = { name: c.name, catId: cat2.id, catName: cat2.name, level: 2 };
      }

      // ======= طبقة 3: داخل كل قسم فرعي =======
      for (const cat3 of layer2.subCats) {
        progressEl.textContent = `📂 طبقة 3: ${cat3.name.substring(0, 45)}`;
        const layer3 = await fetchPage(cat3.id);
        log(`    └ ${cat3.name}: ${layer3.courses.length} مقياس`);

        for (const c of layer3.courses) {
          finalCourses[c.id] = {
            name: c.name,
            catId: cat3.id,
            catName: cat3.name,
            parentCatId: cat2.id,
            parentCatName: cat2.name,
            level: 3
          };
        }
      }

      await sleep(200);
    }

    // حفظ النتائج في storage
    await chrome.storage.local.set({ allCourses: finalCourses });

    // عرض النتائج
    progressEl.textContent = '';
    const total = Object.keys(finalCourses).length;
    statusEl.textContent = `✅ تم! وجدنا ${total} مقياس على 3 طبقات`;

    let output = `إجمالي المقاييس: ${total}\n`;
    output += `تاريخ المسح: ${new Date().toLocaleString('ar')}\n`;
    output += `─────────────────────────────\n\n`;

    // تجميع حسب الطبقة
    const byLevel = { 1: [], 2: [], 3: [] };
    for (const [id, info] of Object.entries(finalCourses)) {
      byLevel[info.level].push({ id, ...info });
    }

    for (const level of [1, 2, 3]) {
      if (byLevel[level].length === 0) continue;
      output += `\n📂 طبقة ${level} (${byLevel[level].length} مقياس):\n`;
      for (const c of byLevel[level]) {
        output += `  ID: ${c.id} | ${c.name}\n`;
        if (c.catName) output += `    القسم: ${c.catName}\n`;
      }
    }

    resultEl.textContent = output;
    resultEl.style.display = 'block';
    copyBtn.style.display = 'block';
    if (syncBtn) syncBtn.style.display = 'block';

  } catch (e) {
    statusEl.textContent = `❌ خطأ: ${e.message}`;
    progressEl.textContent = '';
    console.error(e);
  }

  document.getElementById('scanBtn').disabled = false;
}

// جلب صفحة category وإرجاع sub-categories و courses
async function fetchPage(catId) {
  const subCats = [];
  const courses = [];
  const seenCats = new Set();
  const seenCourses = new Set();

  try {
    const res = await fetch(`${MOODLE}/course/index.php?categoryid=${catId}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Sub-categories
    doc.querySelectorAll('a[href*="categoryid="]').forEach(a => {
      const m = a.href.match(/categoryid=(\d+)/);
      if (!m) return;
      const id = m[1];
      if (id === catId || id === ROOT_CAT || seenCats.has(id)) return;
      const name = a.textContent.trim().replace(/\s+/g, ' ');
      if (name.length < 2) return;
      seenCats.add(id);
      subCats.push({ id, name });
    });

    // Courses من روابط course/view.php
    doc.querySelectorAll('a[href*="course/view.php"]').forEach(a => {
      const m = a.href.match(/course\/view\.php\?id=(\d+)/);
      if (!m || seenCourses.has(m[1])) return;
      let name = a.textContent.trim().replace(/\s+/g, ' ');
      if (!name || name.length < 2) {
        const box = a.closest('.coursebox, .course_title, li, .card, .coursename');
        if (box) name = box.querySelector('h2,h3,h4,.coursename')?.textContent?.trim() || name;
      }
      seenCourses.add(m[1]);
      courses.push({ id: m[1], name: name.substring(0, 80) });
    });

    // Courses من روابط enrol/index.php
    doc.querySelectorAll('a[href*="enrol/index.php"]').forEach(a => {
      const m = a.href.match(/[?&]id=(\d+)/);
      if (!m || seenCourses.has(m[1])) return;
      const name = a.textContent.trim().replace(/\s+/g, ' ');
      seenCourses.add(m[1]);
      courses.push({ id: m[1], name: name.substring(0, 80) });
    });

  } catch (e) {
    log(`⚠️ خطأ في catId=${catId}: ${e.message}`);
  }

  return { subCats, courses };
}

function log(msg) {
  resultEl.textContent += msg + '\n';
  resultEl.style.display = 'block';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
