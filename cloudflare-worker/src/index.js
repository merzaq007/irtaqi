/**
 * Irtaqi Moodle Auto Sync Worker
 * يعمل تلقائياً كل ساعة لمزامنة الملفات من المودل
 */

// إرسال إشعار Telegram
async function sendTelegramNotification(env, message) {
  const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = env;
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    })
  });
}

export default {
  // Cron trigger - يعمل كل ساعة
  async scheduled(event, env, ctx) {
    console.log('🔄 Starting automatic Moodle sync...');
    try {
      const result = await syncMoodleFiles(env);
      if (result.totalNewFiles > 0) {
        await sendTelegramNotification(env,
          `📚 <b>منصة ارتقي - ملفات جديدة!</b>\n\n` +
          `تم إضافة <b>${result.totalNewFiles}</b> ملف جديد:\n` +
          result.syncedFiles.map(f => `• ${f}`).join('\n') +
          `\n\n🔗 <a href="https://irtaqi-1gy.pages.dev">افتح المنصة</a>`
        );
      }
      console.log('✅ Sync completed:', result);
    } catch (error) {
      console.error('❌ Sync failed:', error);
      await sendTelegramNotification(env, `❌ خطأ في المزامنة: ${error.message}`);
    }
  },

  // HTTP endpoint للمزامنة اليدوية
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/sync') {
      try {
        const result = await syncMoodleFiles(env);
        if (result.totalNewFiles > 0) {
          await sendTelegramNotification(env,
            `📚 <b>منصة ارتقي - ملفات جديدة!</b>\n\n` +
            `تم إضافة <b>${result.totalNewFiles}</b> ملف جديد:\n` +
            result.syncedFiles.map(f => `• ${f}`).join('\n') +
            `\n\n🔗 <a href="https://irtaqi-1gy.pages.dev">افتح المنصة</a>`
          );
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // اختبار إشعار Telegram
    if (url.pathname === '/test-notify') {
      await sendTelegramNotification(env,
        `✅ <b>منصة ارتقي</b>\n\nالإشعارات تعمل بشكل صحيح! 🎉\nسيصلك إشعار عند نشر أي درس جديد.`
      );
      return new Response('✅ Test notification sent!', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    return new Response('Irtaqi Moodle Sync Worker - Active ✅', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};

/**
 * المزامنة الرئيسية
 */
async function syncMoodleFiles(env) {
  const { MOODLE_URL, MOODLE_USERNAME, MOODLE_PASSWORD, SUPABASE_URL, SUPABASE_KEY } = env;
  
  // 1. تسجيل الدخول للمودل
  const session = await loginToMoodle(MOODLE_URL, MOODLE_USERNAME, MOODLE_PASSWORD);
  
  if (!session) {
    throw new Error('Failed to login to Moodle');
  }
  
  // 2. جلب قائمة المقررات
  const courses = await getMoodleCourses(MOODLE_URL, session);
  
  let totalNewFiles = 0;
  const syncedFiles = [];
  
  // 3. لكل مقرر، جلب الملفات
  for (const course of courses) {
    const files = await getCourseFiles(MOODLE_URL, session, course.id);
    
    // 4. فحص الملفات الجديدة
    for (const file of files) {
      const isNew = await isFileNew(SUPABASE_URL, SUPABASE_KEY, file.url);
      
      if (isNew) {
        // 5. تحميل ورفع الملف
        const uploaded = await uploadFileToSupabase(
          MOODLE_URL,
          session,
          file,
          SUPABASE_URL,
          SUPABASE_KEY
        );
        
        if (uploaded) {
          totalNewFiles++;
          syncedFiles.push(file.name);
        }
      }
    }
  }
  
  return {
    success: true,
    totalNewFiles,
    syncedFiles,
    timestamp: new Date().toISOString()
  };
}

/**
 * تسجيل الدخول للمودل
 */
async function loginToMoodle(moodleUrl, username, password) {
  try {
    // محاولة الحصول على token
    const tokenResponse = await fetch(`${moodleUrl}/login/token.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username,
        password,
        service: 'moodle_mobile_app'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.token) {
      return { token: tokenData.token, type: 'api' };
    }
    
    // إذا فشل API، استخدم session-based login
    const loginResponse = await fetch(`${moodleUrl}/login/index.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username,
        password
      }),
      redirect: 'manual'
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    
    if (cookies && cookies.includes('MoodleSession')) {
      return { cookies, type: 'session' };
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * جلب قائمة المقررات
 */
async function getMoodleCourses(moodleUrl, session) {
  if (session.type === 'api') {
    // استخدام API
    const response = await fetch(
      `${moodleUrl}/webservice/rest/server.php?wstoken=${session.token}&wsfunction=core_course_get_enrolled_courses_by_timeline_classification&moodlewsrestformat=json&classification=all`
    );
    
    const data = await response.json();
    return data.courses || [];
  } else {
    // استخدام web scraping
    const response = await fetch(`${moodleUrl}/my/`, {
      headers: { 'Cookie': session.cookies }
    });
    
    const html = await response.text();
    return parseCourses(html);
  }
}

/**
 * جلب ملفات المقرر
 */
async function getCourseFiles(moodleUrl, session, courseId) {
  if (session.type === 'api') {
    const response = await fetch(
      `${moodleUrl}/webservice/rest/server.php?wstoken=${session.token}&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=${courseId}`
    );
    
    const contents = await response.json();
    const files = [];
    
    for (const section of contents || []) {
      for (const module of section.modules || []) {
        if (module.modname === 'resource' && module.contents) {
          for (const file of module.contents) {
            if (file.type === 'file') {
              files.push({
                name: file.filename,
                url: file.fileurl + (session.token ? `&token=${session.token}` : ''),
                size: file.filesize,
                courseId
              });
            }
          }
        }
      }
    }
    
    return files;
  } else {
    // web scraping
    const response = await fetch(`${moodleUrl}/course/view.php?id=${courseId}`, {
      headers: { 'Cookie': session.cookies }
    });
    
    const html = await response.text();
    return parseFiles(html, session.cookies);
  }
}

/**
 * التحقق إذا كان الملف جديد
 */
async function isFileNew(supabaseUrl, supabaseKey, fileUrl) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/files?file_url=eq.${encodeURIComponent(fileUrl)}&select=id`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }
  );
  
  const data = await response.json();
  return data.length === 0;
}

/**
 * رفع الملف إلى Supabase
 */
async function uploadFileToSupabase(moodleUrl, session, file, supabaseUrl, supabaseKey) {
  try {
    // 1. تحميل الملف من المودل
    const fileResponse = await fetch(file.url, {
      headers: session.cookies ? { 'Cookie': session.cookies } : {}
    });
    
    if (!fileResponse.ok) {
      throw new Error('Failed to download file from Moodle');
    }
    
    const fileBlob = await fileResponse.blob();
    
    // 2. رفع إلى Supabase Storage
    const fileName = `moodle_auto/${Date.now()}_${file.name}`;
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/course-files/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': fileBlob.type || 'application/octet-stream'
        },
        body: fileBlob
      }
    );
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to Supabase Storage');
    }
    
    // 3. حفظ معلومات الملف في قاعدة البيانات
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/course-files/${fileName}`;
    
    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/files`, {
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
        file_size: file.size,
        module_id: 'moodle_auto_sync'
      })
    });
    
    return dbResponse.ok;
  } catch (error) {
    console.error('Upload error:', error);
    return false;
  }
}

/**
 * Helper functions for web scraping
 */
function parseCourses(html) {
  const courses = [];
  const regex = /course\/view\.php\?id=(\d+).*?title="([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    courses.push({
      id: match[1],
      name: match[2]
    });
  }
  
  return courses;
}

function parseFiles(html, cookies) {
  const files = [];
  const regex = /mod\/resource\/view\.php\?id=(\d+).*?>([^<]+)<.*?pluginfile\.php([^"]+)/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    files.push({
      name: match[2].trim(),
      url: `https://moodle.univ-tiaret.dz/pluginfile.php${match[3]}`,
      size: 0
    });
  }
  
  return files;
}
