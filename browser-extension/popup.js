document.addEventListener('DOMContentLoaded', async () => {

  const MODULE_MAP = {
    'web-apps':                 'تطبيقات الويب',
    'digital-document':         'الوثيقة الرقمية',
    'info-engineering':         'هندسة المعلومات',
    'digital-platforms':        'المنصات الرقمية الوثائقية',
    'research-methodology':     'منهجية البحث',
    'research-data-management': 'إدارة بيانات البحث',
    'governance-e-reputation':  'الحوكمة والسمعة',
    'programming-ai':           'البرمجة والذكاء الاصطناعي',
    'entrepreneurship':         'المقاولاتية',
    'social-networks':          'شبكات التواصل',
    'english-language':         'اللغة الإنجليزية',
  };

  const FILE_ICONS = { pdf:'📕', doc:'📘', docx:'📘', ppt:'📙', pptx:'📙', xls:'📗', xlsx:'📗', zip:'🗜️' };

  let currentFiles  = [];
  let currentModule = '';
  let currentCourse = '';

  // ===== تبويبات =====
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // ===== تحميل الإعدادات =====
  const s = await chrome.storage.local.get(['supabaseKey','telegramToken','telegramChatId','totalSynced']);
  if (s.supabaseKey)    document.getElementById('supabaseKey').value    = s.supabaseKey;
  if (s.telegramToken)  document.getElementById('telegramToken').value  = s.telegramToken;
  if (s.telegramChatId) document.getElementById('telegramChatId').value = s.telegramChatId;

  if (s.telegramToken && s.telegramChatId) {
    document.getElementById('tgDot').classList.add('on');
    document.getElementById('tgStatus').textContent = 'مفعّل ✅';
  }

  // ===== فحص الصفحة الحالية =====
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url?.includes('moodle.univ-tiaret.dz/course/view.php')) {
    try {
      const res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_FILES' });
      if (res) { currentFiles = res.files||[]; currentCourse = res.courseName||''; currentModule = res.moduleId||''; }
    } catch {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      await sleep(800);
      try {
        const res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_FILES' });
        if (res) { currentFiles = res.files||[]; currentCourse = res.courseName||''; currentModule = res.moduleId||''; }
      } catch {}
    }
    renderFiles();
  } else {
    document.getElementById('courseName').textContent = 'افتح صفحة مقياس في Moodle';
    document.getElementById('fileList').innerHTML = '<div class="empty">moodle.univ-tiaret.dz/course/view.php</div>';
  }

  // ===== رسم الملفات =====
  function renderFiles() {
    const name = MODULE_MAP[currentModule] || currentCourse;
    document.getElementById('courseName').textContent = name;
    document.getElementById('courseMeta').textContent = `${currentFiles.length} ملف • ${s.totalSynced||0} مزامن إجمالاً`;

    const list = document.getElementById('fileList');
    list.innerHTML = '';

    if (!currentFiles.length) {
      list.innerHTML = '<div class="empty">لا توجد ملفات في هذه الصفحة</div>';
      return;
    }

    currentFiles.forEach(f => {
      const ext  = f.name.split('.').pop()?.toLowerCase()||'';
      const icon = FILE_ICONS[ext]||'📄';
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `<span class="file-icon">${icon}</span>
        <span class="file-name" title="${f.name}">${f.name}</span>
        <span class="file-type">${ext.toUpperCase()}</span>`;
      list.appendChild(item);
    });

    document.getElementById('downloadBtn').disabled = false;
  }

  // ===== رفع الملفات =====
  document.getElementById('downloadBtn').addEventListener('click', async () => {
    if (!currentFiles.length) return;
    const btn = document.getElementById('downloadBtn');
    btn.disabled = true;
    btn.textContent = '⏳ جاري الرفع...';
    showStatus('main', '⏳ جاري رفع الملفات ونشرها...', 'info');
    showProgress(30);

    const result = await chrome.runtime.sendMessage({
      type: 'UPLOAD_FILES', files: currentFiles, moduleId: currentModule, courseName: currentCourse
    });

    hideProgress();
    btn.disabled = false;
    btn.textContent = '📤 رفع ونشر على ارتقي';

    if (result?.error === 'no_key') {
      showStatus('main', '❌ أدخل Supabase Key في الإعدادات', 'error');
    } else if (result?.synced > 0) {
      showStatus('main', `✅ تم نشر ${result.synced} ملف على ارتقي وإرسال إشعار Telegram`, 'ok');
    } else {
      showStatus('main', 'ℹ️ كل الملفات موجودة مسبقاً', 'info');
    }
  });

  // ===== فتح Moodle =====
  document.getElementById('openMoodleBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://moodle.univ-tiaret.dz/course/index.php?categoryid=29773' });
  });

  // ===== حفظ الإعدادات =====
  document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    const key     = document.getElementById('supabaseKey').value.trim();
    const token   = document.getElementById('telegramToken').value.trim();
    const chatId  = document.getElementById('telegramChatId').value.trim();

    if (!key) { showStatus('settings', '❌ أدخل Supabase Key', 'error'); return; }

    await chrome.storage.local.set({ supabaseKey: key, telegramToken: token, telegramChatId: chatId });

    if (token && chatId) {
      document.getElementById('tgDot').classList.add('on');
      document.getElementById('tgStatus').textContent = 'مفعّل ✅';
    }
    showStatus('settings', '✅ تم الحفظ', 'ok');
  });

  // ===== اختبار Telegram =====
  document.getElementById('testTgBtn').addEventListener('click', async () => {
    const token  = document.getElementById('telegramToken').value.trim();
    const chatId = document.getElementById('telegramChatId').value.trim();
    if (!token || !chatId) { showStatus('settings', '❌ أدخل Token و Chat ID أولاً', 'error'); return; }

    const btn = document.getElementById('testTgBtn');
    btn.disabled = true;
    btn.textContent = '⏳ جاري الإرسال...';

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          parse_mode: 'HTML',
          text:
            `✅ <b>منصة ارتقي - اختبار الإشعارات</b>\n\n` +
            `🎉 الإشعارات تعمل بشكل صحيح!\n\n` +
            `📚 <b>مثال على إشعار حقيقي:</b>\n` +
            `📄 تم نشر دروس جديدة في مقياس\n` +
            `<b>المنصات الرقمية الوثائقية</b>\n\n` +
            `🔗 <a href="https://irtaqi.pages.dev">افتح المنصة</a>`
        })
      });
      const data = await res.json();
      if (data.ok) {
        showStatus('settings', '✅ تم إرسال رسالة اختبار إلى Telegram', 'ok');
        document.getElementById('tgDot').classList.add('on');
        document.getElementById('tgStatus').textContent = 'مفعّل ✅';
      } else {
        showStatus('settings', `❌ خطأ: ${data.description}`, 'error');
      }
    } catch (e) {
      showStatus('settings', `❌ فشل الاتصال: ${e.message}`, 'error');
    }

    btn.disabled = false;
    btn.textContent = '🔔 اختبار الإشعار';
  });

  // ===== مساعدات =====
  function showStatus(section, msg, type) {
    const id = section === 'main' ? 'statusMsg' : 'settingsStatus';
    const el = document.getElementById(id);
    el.textContent   = msg;
    el.className     = `status ${type}`;
    el.style.display = 'block';
  }

  function showProgress(pct) {
    document.getElementById('progressBar').style.display = 'block';
    document.getElementById('progressFill').style.width  = `${pct}%`;
  }

  function hideProgress() {
    document.getElementById('progressBar').style.display = 'none';
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
});
