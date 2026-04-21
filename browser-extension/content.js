// Content Script - يعمل على صفحات المودل
console.log('🚀 Irtaqi Moodle Sync - Active');

// مراقبة الملفات في المودل - محسّن
function detectNewFiles() {
  const files = [];
  
  // البحث عن روابط الملفات بطرق متعددة
  const selectors = [
    'a[href*="mod/resource"]',
    'a[href*="pluginfile.php"]',
    'a[href*="/mod/folder/"]',
    'a.aalink[href*="resource"]',
    'div.activityinstance a',
    'span.instancename a',
    '.activity.resource a',
    '.modtype_resource a'
  ];
  
  const allLinks = new Set();
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(link => {
      allLinks.add(link);
    });
  });
  
  console.log(`🔍 Found ${allLinks.size} potential file links`);
  
  allLinks.forEach(link => {
    const href = link.href;
    let fileName = link.textContent.trim();
    
    // تنظيف اسم الملف
    fileName = fileName.replace(/\s+/g, ' ').trim();
    
    // استخراج معلومات الملف
    if (fileName && (href.includes('pluginfile.php') || href.includes('mod/resource') || href.includes('mod/folder'))) {
      // محاولة استخراج اسم الملف من الرابط إذا كان النص فارغاً
      if (!fileName || fileName.length < 3) {
        const urlParts = href.split('/');
        fileName = urlParts[urlParts.length - 1] || 'file';
      }
      
      const fileInfo = {
        name: fileName,
        url: href,
        courseName: getCourseNameFromPage(),
        timestamp: Date.now()
      };
      
      files.push(fileInfo);
      console.log('📄 File detected:', fileName);
    }
  });
  
  return files;
}

// الحصول على اسم المقرر من الصفحة
function getCourseNameFromPage() {
  const selectors = [
    '.page-header-headings h1',
    '.course-title',
    'h1.h2',
    '.page-context-header h1',
    '#page-header h1'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent.trim();
    }
  }
  
  return 'Unknown Course';
}

// إرسال الملفات للخلفية
function sendFilesToBackground(files) {
  if (files.length > 0) {
    console.log(`📤 Sending ${files.length} files to background`);
    chrome.runtime.sendMessage({
      type: 'NEW_FILES_DETECTED',
      files: files
    });
  } else {
    console.log('⚠️ No files found on this page');
  }
}

// مراقبة التغييرات في الصفحة
const observer = new MutationObserver(() => {
  const files = detectNewFiles();
  sendFilesToBackground(files);
});

// بدء المراقبة
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// فحص أولي عند تحميل الصفحة
setTimeout(() => {
  console.log('🔍 Initial scan...');
  const files = detectNewFiles();
  sendFilesToBackground(files);
}, 2000);

// إضافة زر مزامنة سريع في المودل
function addSyncButton() {
  const navbar = document.querySelector('.navbar, .page-header, body');
  if (navbar && !document.getElementById('irtaqi-sync-btn')) {
    const btn = document.createElement('button');
    btn.id = 'irtaqi-sync-btn';
    btn.innerHTML = '🔄 مزامنة مع ارتقي';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #3b82f6, #f59e0b);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
      z-index: 9999;
      font-family: 'Cairo', sans-serif;
      transition: all 0.3s;
    `;
    
    btn.onmouseover = () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
    };
    
    btn.onmouseout = () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
    };
    
    btn.onclick = () => {
      console.log('🔄 Manual sync triggered');
      const files = detectNewFiles();
      
      if (files.length > 0) {
        chrome.runtime.sendMessage({
          type: 'MANUAL_SYNC',
          files: files
        });
        btn.innerHTML = `✅ تمت المزامنة! (${files.length} ملف)`;
        setTimeout(() => {
          btn.innerHTML = '🔄 مزامنة مع ارتقي';
        }, 3000);
      } else {
        btn.innerHTML = '❌ لا توجد ملفات في هذه الصفحة';
        setTimeout(() => {
          btn.innerHTML = '🔄 مزامنة مع ارتقي';
        }, 3000);
      }
    };
    
    document.body.appendChild(btn);
    console.log('✅ Sync button added');
  }
}

// إضافة الزر بعد تحميل الصفحة
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addSyncButton);
} else {
  addSyncButton();
}

// استماع للرسائل من popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRIGGER_SYNC') {
    const files = detectNewFiles();
    sendFilesToBackground(files);
    sendResponse({ success: true, fileCount: files.length });
  }
});
