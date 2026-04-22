// Content Script - Irtaqi Moodle Sync
console.log('🚀 Irtaqi Sync - Content Active');

const MOODLE_BASE = 'https://moodle.univ-tiaret.dz';

// ربط مباشر بين categoryid في Moodle و module_id في المنصة
const CATEGORY_MODULE_MAP = {
  '33988': 'web-apps',
  '33989': 'digital-document',
  '35841': 'info-engineering',
  '33990': 'digital-platforms',
  '33991': 'research-methodology',
  '33992': 'research-data-management',
  '33993': 'governance-e-reputation',
  '33994': 'programming-ai',
  '33995': 'entrepreneurship',
  '33996': 'social-networks',
  '33997': 'english-language',
};

// ===== استخراج روابط المقاييس من صفحة القسم =====
function extractCoursesFromCategory() {
  const courses = [];
  const seen = new Set();

  // استخراج المقاييس من الـ dropdown أو الـ category tree
  // الـ dropdown يحتوي على كل الـ categories بـ value="/course/index.php?categoryid=XXXX"
  document.querySelectorAll('select[name="jump"] option, a[href*="categoryid="]').forEach(el => {
    const href = el.value || el.href || '';
    const match = href.match(/categoryid=(\d+)/);
    if (!match) return;

    const catId = match[1];
    if (!CATEGORY_MODULE_MAP[catId]) return; // فقط مقاييسنا
    if (seen.has(catId)) return;
    seen.add(catId);

    const name = el.textContent?.trim().split('/').pop()?.trim() || `مقياس ${catId}`;
    courses.push({
      id: catId,
      name,
      url: `https://moodle.univ-tiaret.dz/course/index.php?categoryid=${catId}`,
      moduleId: CATEGORY_MODULE_MAP[catId],
      isCategory: true
    });
  });

  console.log('[Irtaqi] Found courses:', courses.length);
  return courses;
}

// ===== استخراج الملفات من صفحة مقياس =====
function extractFilesFromCourse(moduleId) {
  const files = [];
  const seen = new Set();

  // روابط الملفات المباشرة
  document.querySelectorAll('a[href*="pluginfile.php"], a[href*="mod/resource"]').forEach(link => {
    const url = link.href;
    if (seen.has(url)) return;

    // فقط الملفات المسموح بها
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
    if (!allowed.includes(ext) && !url.includes('mod/resource')) return;

    seen.add(url);

    let name = link.querySelector('.instancename, span')?.textContent?.trim()
      || link.textContent.trim()
      || decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'file');
    name = name.replace(/\s+/g, ' ').trim();

    files.push({ name, url, moduleId });
  });

  return files;
}

// ===== استماع للرسائل =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // طلب استخراج المقاييس من صفحة القسم
  if (message.type === 'GET_COURSES') {
    const courses = extractCoursesFromCategory();
    sendResponse({ courses });
  }

  // مزامنة يدوية أو تلقائية
  if (message.type === 'TRIGGER_SYNC' || message.type === 'AUTO_SCAN') {
    const moduleId = message.moduleId || 'moodle_auto_sync';
    const files = extractFilesFromCourse(moduleId);
    if (files.length > 0) {
      chrome.runtime.sendMessage({ type: 'FILES_FOUND', files });
    }
    sendResponse({ files });
  }

  return true;
});

// ===== فحص تلقائي عند تحميل صفحة مقياس =====
if (window.location.href.includes('course/view.php')) {
  setTimeout(() => {
    // استرجاع الـ moduleId المحفوظ لهذا الكورس
    const courseId = new URL(window.location.href).searchParams.get('id');
    chrome.storage.local.get(`course_${courseId}`, (data) => {
      const moduleId = data[`course_${courseId}`] || 'moodle_auto_sync';
      const files = extractFilesFromCourse(moduleId);
      if (files.length > 0) {
        chrome.runtime.sendMessage({ type: 'FILES_FOUND', files });
        console.log(`📤 Auto-sync: ${files.length} files from course ${courseId}`);
      }
    });
  }, 2000);
}
