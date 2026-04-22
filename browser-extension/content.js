// Content Script - يعمل على صفحات course/view.php
const ALLOWED = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip'];

const MODULE_NAME_MAP = {
  'ويب': 'web-apps', 'web': 'web-apps',
  'وثيقة رقمية': 'digital-document',
  'هندسة المعلومات': 'info-engineering',
  'منصات رقمية': 'digital-platforms',
  'منهجية': 'research-methodology',
  'إدارة بيانات': 'research-data-management',
  'حوكمة': 'governance-e-reputation', 'سمعة': 'governance-e-reputation',
  'برمجة': 'programming-ai', 'ذكاء': 'programming-ai',
  'مقاولاتية': 'entrepreneurship',
  'شبكات تواصل': 'social-networks',
  'إنجليزية': 'english-language', 'english': 'english-language',
};

function guessModuleId(name) {
  if (!name) return 'moodle_auto_sync';
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(MODULE_NAME_MAP)) {
    if (lower.includes(key)) return val;
  }
  return 'moodle_auto_sync';
}

function extractFiles() {
  const files = [];
  const seen  = new Set();

  document.querySelectorAll('a[href*="pluginfile.php"]').forEach(a => {
    const url = a.href.split('?')[0]; // بدون token في الـ URL
    const fullUrl = a.href;
    if (seen.has(url)) return;
    const ext = url.split('.').pop()?.toLowerCase();
    if (!ALLOWED.includes(ext)) return;
    seen.add(url);

    const name = a.querySelector('.instancename')?.textContent?.trim()
      || decodeURIComponent(url.split('/').pop() || 'file');

    files.push({ name: name.replace(/\s+/g, ' ').trim(), url: fullUrl });
  });

  return files;
}

function getCourseName() {
  return document.querySelector('.page-header-headings h1, h1.h2, #page-header h1')
    ?.textContent?.trim() || document.title;
}

// ===== استماع للرسائل =====
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_FILES' || msg.type === 'SCAN_FOR_NEW') {
    const files      = extractFiles();
    const courseName = getCourseName();
    const moduleId   = guessModuleId(courseName);
    sendResponse({ files, courseName, moduleId });
  }
  return true;
});

// ===== فحص تلقائي عند تحميل الصفحة =====
window.addEventListener('load', () => {
  setTimeout(() => {
    const files      = extractFiles();
    const courseName = getCourseName();
    const moduleId   = guessModuleId(courseName);

    if (files.length > 0) {
      chrome.runtime.sendMessage({
        type: 'NEW_FILES_DETECTED',
        files,
        courseName,
        moduleId
      });
    }
  }, 2000);
});
