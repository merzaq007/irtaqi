// Popup Script - Irtaqi Sync
document.addEventListener('DOMContentLoaded', async () => {

  const PLATFORM_MODULES = [
    { id: 'web-apps',                 name: 'تطبيقات الويب' },
    { id: 'digital-document',         name: 'الوثيقة الرقمية' },
    { id: 'info-engineering',         name: 'هندسة المعلومات' },
    { id: 'digital-platforms',        name: 'المنصات الرقمية' },
    { id: 'research-methodology',     name: 'منهجية البحث' },
    { id: 'research-data-management', name: 'إدارة بيانات البحث' },
    { id: 'governance-e-reputation',  name: 'الحوكمة والسمعة' },
    { id: 'programming-ai',           name: 'البرمجة والذكاء الاصطناعي' },
    { id: 'entrepreneurship',         name: 'المقاولاتية' },
    { id: 'social-networks',          name: 'شبكات التواصل' },
    { id: 'english-language',         name: 'اللغة الإنجليزية' },
  ];

  // ===== تحميل البيانات =====
  const stored = await chrome.storage.local.get(['supabaseKey', 'totalSynced', 'lastSync', 'courseMappings']);
  const mappings = stored.courseMappings || {};

  if (stored.supabaseKey) {
    document.getElementById('statusDot').className = 'status-dot dot-green';
    document.getElementById('statusText').textContent = 'متصل';
    document.getElementById('supabaseKey').value = stored.supabaseKey;
  }

  document.getElementById('totalSynced').textContent = stored.totalSynced || 0;
  document.getElementById('mappedCount').textContent = Object.keys(mappings).length;
  if (stored.lastSync) document.getElementById('lastSync').textContent = `آخر مزامنة: ${stored.lastSync}`;

  // ===== مساعد عرض النتيجة =====
  function showResult(msg, color) {
    const result = document.getElementById('syncResult');
    const text = document.getElementById('syncResultText');
    result.style.display = 'block';
    text.style.color = color;
    text.textContent = msg;
    setTimeout(() => { result.style.display = 'none'; }, 4000);
  }

  // ===== التبويبات =====
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // ===== مزامنة الآن =====
  document.getElementById('syncNowBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const btn = document.getElementById('syncNowBtn');

    if (!tab?.url?.includes('moodle.univ-tiaret.dz')) {
      showResult('⚠️ افتح صفحة المودل أولاً', '#f59e0b');
      return;
    }

    btn.textContent = '⏳ جاري المزامنة...';
    btn.disabled = true;

    const courseId = new URL(tab.url).searchParams.get('id');
    const moduleId = courseId ? (mappings[courseId] || 'moodle_auto_sync') : 'moodle_auto_sync';

    chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_SYNC', moduleId }, async (res) => {
      btn.textContent = '🔄 مزامنة الآن';
      btn.disabled = false;

      if (chrome.runtime.lastError || !res) {
        showResult('❌ تعذر الاتصال بالصفحة', '#ef4444');
        return;
      }

      const count = res.files?.length || 0;
      if (count === 0) {
        showResult('ℹ️ لا توجد ملفات جديدة في هذه الصفحة', '#64748b');
      } else {
        showResult(`✅ تم إرسال ${count} ملف للمزامنة`, '#10b981');
        const newTotal = (stored.totalSynced || 0) + count;
        document.getElementById('totalSynced').textContent = newTotal;
      }
    });
  });

  // ===== استخراج المقاييس =====
  document.getElementById('extractCoursesBtn').addEventListener('click', async () => {
    const btn = document.getElementById('extractCoursesBtn');
    btn.textContent = '⏳ جاري التحميل...';
    btn.disabled = true;

    const knownCourses = [
      { id: '33988', name: 'تطبيقات الويب في أنظمة المعلومات الوثائقية', moduleId: 'web-apps' },
      { id: '33989', name: 'الوثيقة الرقمية', moduleId: 'digital-document' },
      { id: '35841', name: 'هندسة المعلومات', moduleId: 'info-engineering' },
      { id: '33990', name: 'المنصات الرقمية الوثائقية', moduleId: 'digital-platforms' },
      { id: '33991', name: 'منهجية البحث العلمي في علم المكتبات', moduleId: 'research-methodology' },
      { id: '33992', name: 'إدارة بيانات البحث', moduleId: 'research-data-management' },
      { id: '33993', name: 'الحوكمة والسمعة الإلكترونية', moduleId: 'governance-e-reputation' },
      { id: '33994', name: 'البرمجة والذكاء الاصطناعي (2)', moduleId: 'programming-ai' },
      { id: '33995', name: 'المقاولاتية والمؤسسات الناشئة', moduleId: 'entrepreneurship' },
      { id: '33996', name: 'شبكات التواصل الاجتماعي', moduleId: 'social-networks' },
      { id: '33997', name: 'اللغة الإنجليزية (2)', moduleId: 'english-language' },
    ];

    btn.textContent = '🔍 استخراج المقاييس من المودل';
    btn.disabled = false;
    renderCourseList(knownCourses, mappings);
  });

  // ===== حفظ الربط =====
  document.getElementById('saveMappingBtn').addEventListener('click', async () => {
    const newMappings = {};
    document.querySelectorAll('.course-select').forEach(sel => {
      const courseId = sel.dataset.courseId;
      const moduleId = sel.value;
      if (moduleId) newMappings[courseId] = moduleId;
    });

    await chrome.storage.local.set({ courseMappings: newMappings });
    for (const [courseId, moduleId] of Object.entries(newMappings)) {
      await chrome.storage.local.set({ [`course_${courseId}`]: moduleId });
    }

    document.getElementById('mappedCount').textContent = Object.keys(newMappings).length;
    alert(`✅ تم حفظ ربط ${Object.keys(newMappings).length} مقياس!`);
  });

  // ===== حفظ الإعدادات =====
  document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    const key = document.getElementById('supabaseKey').value.trim();
    if (!key) { alert('❌ أدخل Supabase Key'); return; }
    await chrome.storage.local.set({ supabaseKey: key });
    document.getElementById('statusDot').className = 'status-dot dot-green';
    document.getElementById('statusText').textContent = 'متصل';
    alert('✅ تم الحفظ!');
  });

  // ===== أزرار الروابط =====
  document.getElementById('openMoodleBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://moodle.univ-tiaret.dz/course/index.php?categoryid=33988' });
  });
  document.getElementById('openIrtaqiBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://irtaqi-1gy.pages.dev' });
  });
  document.getElementById('openScannerBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('scanner.html') });
  });

  // ===== رسم قائمة المقاييس =====
  function renderCourseList(courses, existingMappings) {
    const list = document.getElementById('courseList');
    list.innerHTML = '';

    courses.forEach(course => {
      const item = document.createElement('div');
      item.className = 'course-item';
      const mapped = course.moduleId || existingMappings[course.id];

      item.innerHTML = `
        <div class="course-name" title="${course.name}">${course.name}</div>
        <select class="course-select ${mapped ? 'mapped' : ''}" data-course-id="${course.id}">
          <option value="">-- اختر --</option>
          ${PLATFORM_MODULES.map(m =>
            `<option value="${m.id}" ${mapped === m.id ? 'selected' : ''}>${m.name}</option>`
          ).join('')}
        </select>
      `;

      item.querySelector('select').addEventListener('change', function () {
        this.className = `course-select ${this.value ? 'mapped' : ''}`;
      });

      list.appendChild(item);
    });

    document.getElementById('saveMappingBtn').style.display = 'block';
  }

  // ===== مسح Course IDs =====
  document.getElementById('openScanPageBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://moodle.univ-tiaret.dz/course/index.php?categoryid=29773' });
  });

  document.getElementById('scanBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const btn = document.getElementById('scanBtn');

    if (!tab?.url?.includes('moodle.univ-tiaret.dz')) {
      alert('⚠️ افتح صفحة Moodle أولاً:\nmoodle.univ-tiaret.dz/course/index.php?categoryid=33988');
      return;
    }

    btn.textContent = '⏳ جاري المسح...';
    btn.disabled = true;

    try {
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const results = {};
          document.querySelectorAll('a[href*="course/view.php"], a[href*="enrol/index.php"]').forEach(a => {
            const match = a.href.match(/[?&]id=(\d+)/);
            if (!match) return;
            const courseId = match[1];
            if (results[courseId]) return;
            let name = a.textContent.trim().replace(/\s+/g, ' ');
            if (!name || name.length < 3) {
              const parent = a.closest('.coursebox, li, .card, .activity');
              if (parent) name = parent.querySelector('h2,h3,h4,.coursename')?.textContent?.trim() || name;
            }
            const catMatch = window.location.href.match(/categoryid=(\d+)/);
            results[courseId] = {
              name: name.substring(0, 80),
              catId: catMatch ? catMatch[1] : 'unknown',
              url: a.href
            };
          });
          return results;
        }
      });

      btn.textContent = '🔍 مسح وجلب كل course IDs';
      btn.disabled = false;

      const data = injectionResults?.[0]?.result;

      if (!data || Object.keys(data).length === 0) {
        document.getElementById('scanResult').textContent =
          '⚠️ لم يتم العثور على مقاييس.\nافتح صفحة مقياس مثل:\nhttps://moodle.univ-tiaret.dz/course/index.php?categoryid=33988';
        document.getElementById('scanResultSection').style.display = 'block';
        return;
      }

      const lines = Object.entries(data).map(([id, info]) =>
        `ID: ${id} | ${info.name}`
      ).join('\n');

      document.getElementById('scanResult').textContent = lines;
      document.getElementById('scanResultSection').style.display = 'block';
      await chrome.storage.local.set({ scannedCourses: data });

    } catch (e) {
      btn.textContent = '🔍 مسح وجلب كل course IDs';
      btn.disabled = false;
      document.getElementById('scanResult').textContent = '❌ خطأ: ' + e.message;
      document.getElementById('scanResultSection').style.display = 'block';
    }
  });

  document.getElementById('copyScanBtn').addEventListener('click', () => {
    const text = document.getElementById('scanResult').textContent;
    navigator.clipboard.writeText(text).then(() => {
      document.getElementById('copyScanBtn').textContent = '✅ تم النسخ!';
      setTimeout(() => { document.getElementById('copyScanBtn').textContent = '📋 نسخ النتائج'; }, 2000);
    });
  });

});
