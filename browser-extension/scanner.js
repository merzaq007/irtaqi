const MOODLE = 'https://moodle.univ-tiaret.dz';
const ROOT_CAT = '29773'; // السداسي الثاني

const status = document.getElementById('status');
const progress = document.getElementById('progress');
const result = document.getElementById('result');
const copyBtn = document.getElementById('copyBtn');

document.getElementById('scanBtn').addEventListener('click', startScan);
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(result.textContent);
  copyBtn.textContent = '✅ تم النسخ!';
  setTimeout(() => copyBtn.textContent = '📋 نسخ النتائج', 2000);
});

async function startScan() {
  document.getElementById('scanBtn').disabled = true;
  status.textContent = '⏳ جاري المسح...';
  result.style.display = 'none';
  copyBtn.style.display = 'none';
  result.textContent = '';

  try {
    const finalData = {};

    // المستوى 1: جلب sub-categories من السداسي الثاني
    progress.textContent = `📂 المستوى 1: جلب المقاييس من categoryid=${ROOT_CAT}`;
    const level1 = await fetchCategoryPage(ROOT_CAT);
    const subCats = level1.categories;
    const directCourses = level1.courses;

    log(`✅ المستوى 1: ${subCats.length} قسم فرعي، ${directCourses.length} مقياس مباشر`);

    // المقاييس المباشرة في المستوى 1
    for (const c of directCourses) {
      finalData[c.id] = { name: c.name, catId: ROOT_CAT, level: 1 };
    }

    // المستوى 2: جلب courses من كل sub-category
    for (let i = 0; i < subCats.length; i++) {
      const cat = subCats[i];
      progress.textContent = `📂 المستوى 2: ${i+1}/${subCats.length} - ${cat.name.substring(0,40)}`;
      
      const level2 = await fetchCategoryPage(cat.id);
      
      for (const c of level2.courses) {
        finalData[c.id] = { name: c.name, catId: cat.id, catName: cat.name, level: 2 };
      }

      // المستوى 3: إذا في sub-sub-categories
      for (const subCat of level2.categories) {
        progress.textContent = `📂 المستوى 3: ${subCat.name.substring(0,40)}`;
        const level3 = await fetchCategoryPage(subCat.id);
        for (const c of level3.courses) {
          finalData[c.id] = { name: c.name, catId: subCat.id, catName: subCat.name, parentCatId: cat.id, parentCatName: cat.name, level: 3 };
        }
      }

      await sleep(300); // تجنب الحظر
    }

    // عرض النتائج
    progress.textContent = '';
    status.textContent = `✅ تم! وجدنا ${Object.keys(finalData).length} مقياس`;

    let output = `// النتائج - ${new Date().toLocaleString('ar')}\n`;
    output += `// إجمالي المقاييس: ${Object.keys(finalData).length}\n\n`;

    // تنسيق للـ Worker
    output += `const COURSE_MAP = {\n`;
    for (const [courseId, info] of Object.entries(finalData)) {
      output += `  // ${info.name}\n`;
      output += `  '${courseId}': { catId: '${info.catId}', level: ${info.level} },\n`;
    }
    output += `};\n\n`;

    // تفاصيل كاملة
    output += `\n// ===== تفاصيل كاملة =====\n`;
    for (const [courseId, info] of Object.entries(finalData)) {
      output += `\ncourse/view.php?id=${courseId}\n`;
      output += `  الاسم: ${info.name}\n`;
      output += `  categoryid: ${info.catId}\n`;
      if (info.catName) output += `  اسم القسم: ${info.catName}\n`;
      if (info.parentCatName) output += `  القسم الأب: ${info.parentCatName}\n`;
      output += `  المستوى: ${info.level}\n`;
    }

    result.textContent = output;
    result.style.display = 'block';
    copyBtn.style.display = 'block';

  } catch (e) {
    status.textContent = `❌ خطأ: ${e.message}`;
    progress.textContent = '';
  }

  document.getElementById('scanBtn').disabled = false;
}

async function fetchCategoryPage(catId) {
  const categories = [];
  const courses = [];

  try {
    const res = await fetch(`${MOODLE}/course/index.php?categoryid=${catId}`, {
      credentials: 'include'
    });
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // جلب sub-categories
    doc.querySelectorAll('a[href*="categoryid="]').forEach(a => {
      const match = a.href.match(/categoryid=(\d+)/);
      if (!match || match[1] === catId || match[1] === ROOT_CAT) return;
      const name = a.textContent.trim().replace(/\s+/g, ' ');
      if (name.length > 2 && !categories.find(c => c.id === match[1])) {
        categories.push({ id: match[1], name });
      }
    });

    // جلب courses مباشرة
    doc.querySelectorAll('a[href*="course/view.php"]').forEach(a => {
      const match = a.href.match(/course\/view\.php\?id=(\d+)/);
      if (!match) return;
      let name = a.textContent.trim().replace(/\s+/g, ' ');
      if (!name || name.length < 3) {
        const parent = a.closest('.coursebox, .course_title, li, .card');
        if (parent) name = parent.querySelector('h2,h3,h4,.coursename')?.textContent?.trim() || name;
      }
      if (!courses.find(c => c.id === match[1])) {
        courses.push({ id: match[1], name: name.substring(0, 80) });
      }
    });

    // أيضاً enrol links
    doc.querySelectorAll('a[href*="enrol/index.php"]').forEach(a => {
      const match = a.href.match(/[?&]id=(\d+)/);
      if (!match) return;
      if (!courses.find(c => c.id === match[1])) {
        const name = a.textContent.trim().replace(/\s+/g, ' ');
        courses.push({ id: match[1], name: name.substring(0, 80) });
      }
    });

  } catch (e) {
    log(`⚠️ خطأ في catId=${catId}: ${e.message}`);
  }

  return { categories, courses };
}

function log(msg) {
  result.textContent += msg + '\n';
  result.style.display = 'block';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
