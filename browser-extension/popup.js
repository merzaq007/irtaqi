// Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  // تحميل الإعدادات
  const settings = await chrome.storage.local.get(['supabaseKey', 'syncedCount']);
  
  if (settings.supabaseKey) {
    document.getElementById('supabaseKey').value = settings.supabaseKey;
    document.getElementById('status').textContent = '✅ متصل';
    document.getElementById('status').style.background = 'rgba(34, 197, 94, 0.5)';
  } else {
    document.getElementById('status').textContent = '❌ غير متصل';
    document.getElementById('status').style.background = 'rgba(239, 68, 68, 0.5)';
  }
  
  document.getElementById('fileCount').textContent = settings.syncedCount || 0;
  
  // حفظ الإعدادات
  document.getElementById('saveBtn').addEventListener('click', async () => {
    const supabaseKey = document.getElementById('supabaseKey').value.trim();
    
    if (supabaseKey) {
      await chrome.storage.local.set({
        supabaseKey,
        supabaseUrl: 'https://bdjhurufqkalicjmokbk.supabase.co',
        irtaqiUrl: 'https://irtaqi-1gy.pages.dev'
      });
      
      document.getElementById('status').textContent = '✅ متصل';
      document.getElementById('status').style.background = 'rgba(34, 197, 94, 0.5)';
      
      alert('✅ تم حفظ الإعدادات بنجاح!');
    } else {
      alert('❌ يرجى إدخال Supabase Key');
    }
  });
  
  // مزامنة يدوية
  document.getElementById('syncBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.includes('moodle.univ-tiaret.dz')) {
      chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_SYNC' });
      alert('🔄 جاري المزامنة...');
    } else {
      alert('⚠️ يرجى فتح صفحة المودل أولاً');
    }
  });
  
  // فتح منصة ارتقي
  document.getElementById('openIrtaqi').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://irtaqi-1gy.pages.dev' });
  });
});
