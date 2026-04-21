// Background Service Worker
console.log('🔧 Irtaqi Moodle Sync - Background Service Active');

// تخزين الملفات المكتشفة
let detectedFiles = [];
let syncedFiles = new Set();

// استقبال الرسائل من Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NEW_FILES_DETECTED') {
    handleNewFiles(message.files);
  } else if (message.type === 'MANUAL_SYNC') {
    syncFilesToIrtaqi(message.files);
  }
});

// معالجة الملفات الجديدة
function handleNewFiles(files) {
  files.forEach(file => {
    const fileId = `${file.name}_${file.url}`;
    
    // تحقق إذا كان الملف جديد
    if (!syncedFiles.has(fileId)) {
      detectedFiles.push(file);
      
      // إرسال إشعار
      chrome.notifications.create({
        type: 'basic',
        title: 'ملف جديد في المودل! 📚',
        message: `تم اكتشاف: ${file.name}`,
        priority: 2
      });
      
      // مزامنة تلقائية
      syncFilesToIrtaqi([file]);
    }
  });
}

// مزامنة الملفات مع منصة ارتقي
async function syncFilesToIrtaqi(files) {
  for (const file of files) {
    try {
      // الحصول على إعدادات المنصة
      const settings = await chrome.storage.local.get(['irtaqiUrl', 'supabaseUrl', 'supabaseKey']);
      
      const irtaqiUrl = settings.irtaqiUrl || 'http://localhost:8080';
      const supabaseUrl = settings.supabaseUrl || 'https://bdjhurufqkalicjmokbk.supabase.co';
      const supabaseKey = settings.supabaseKey;
      
      if (!supabaseKey) {
        console.error('❌ Supabase key not configured');
        return;
      }
      
      // تحميل الملف من المودل
      const fileResponse = await fetch(file.url);
      const fileBlob = await fileResponse.blob();
      
      // رفع الملف إلى Supabase Storage
      const fileName = `moodle_sync/${Date.now()}_${file.name}`;
      const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/course-files/${fileName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': fileBlob.type
        },
        body: fileBlob
      });
      
      if (uploadResponse.ok) {
        // حفظ معلومات الملف في قاعدة البيانات
        const fileUrl = `${supabaseUrl}/storage/v1/object/public/course-files/${fileName}`;
        
        await fetch(`${supabaseUrl}/rest/v1/files`, {
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
            file_type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
            file_size: fileBlob.size,
            module_id: 'moodle_auto_sync'
          })
        });
        
        // تسجيل الملف كمزامن
        const fileId = `${file.name}_${file.url}`;
        syncedFiles.add(fileId);
        
        // إشعار نجاح
        chrome.notifications.create({
          type: 'basic',
          title: 'تمت المزامنة! ✅',
          message: `تم رفع ${file.name} إلى منصة ارتقي`,
          priority: 1
        });
        
        console.log('✅ File synced:', file.name);
      }
    } catch (error) {
      console.error('❌ Sync error:', error);
      
      chrome.notifications.create({
        type: 'basic',
        title: 'خطأ في المزامنة ❌',
        message: `فشل رفع ${file.name}`,
        priority: 2
      });
    }
  }
}

// مزامنة دورية كل 30 دقيقة
chrome.alarms.create('periodicSync', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodicSync') {
    console.log('🔄 Running periodic sync...');
    // يمكن إضافة منطق المزامنة الدورية هنا
  }
});
