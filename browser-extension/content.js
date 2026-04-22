// Content Script - Irtaqi Moodle Sync
console.log('🚀 Irtaqi Sync - Content Active on:', window.location.href);

// ===== استخراج الملفات من صفحة مقياس =====
function extractFilesFromCourse(moduleId) {
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

    files.push({ name, url, moduleId });
  });

  return files;
}

// ===== استماع للرسائل =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

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
    const courseId = new URL(window.location.href).searchParams.get('id');
    chrome.storage.local.get(`course_${courseId}`, (data) => {
      const moduleId = data[`course_${courseId}`] || 'moodle_auto_sync';
      const files = extractFilesFromCourse(moduleId);
      if (files.length > 0) {
        chrome.runtime.sendMessage({ type: 'FILES_FOUND', files });
        console.log(`📤 Auto-sync: ${files.length} files from course ${courseId} → ${moduleId}`);
      }
    });
  }, 2000);
}
