/**
 * Irtaqi Moodle Auto Sync Worker
 * يعمل تلقائياً كل 30 دقيقة لمزامنة الملفات من المودل
 */

const IRTAQI_URL = 'https://irtaqi.pages.dev';

async function sendTelegramNotification(env, chatId, message) {
  const { TELEGRAM_TOKEN } = env;
  if (!TELEGRAM_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId || env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    })
  });
}

export default {
  async scheduled(event, env, ctx) {
    try {
      const result = await syncMoodleFiles(env);
      if (result.totalNewFiles > 0) {
        await sendTelegramNotification(env, env.TELEGRAM_CHAT_ID,
          `📚 <b>منصة ارتقي - ملفات جديدة!</b>\n\n` +
          `تم إضافة <b>${result.totalNewFiles}</b> ملف جديد:\n` +
          result.syncedFiles.map(f => `• ${f}`).join('\n') +
          `\n\n🔗 <a href="${IRTAQI_URL}">افتح المنصة</a>`
        );
      }
    } catch (error) {
      await sendTelegramNotification(env, env.TELEGRAM_CHAT_ID, `❌ خطأ في المزامنة: ${error.message}`);
    }
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Telegram Webhook
    if (url.pathname === '/webhook' && request.method === 'POST') {
      const body = await request.json();
      const message = body?.message;
      if (message?.text === '/start') {
        await sendTelegramNotification(env, message.chat.id,
          `✅ <b>مرحباً ${message.from.first_name}!</b>\n\n` +
          `🔔 الإشعارات تعمل بشكل صحيح!\n\n` +
          `سيصلك إشعار تلقائي عند نشر أي درس جديد في المودل.\n\n` +
          `🔗 <a href="${IRTAQI_URL}">افتح منصة ارتقي</a>`
        );
      }
      return new Response('OK', { status: 200 });
    }

    // مزامنة يدوية
    if (url.pathname === '/sync') {
      try {
        const result = await syncMoodleFiles(env);
        if (result.totalNewFiles > 0) {
          await sendTelegramNotification(env, env.TELEGRAM_CHAT_ID,
            `📚 <b>منصة ارتقي - ملفات جديدة!</b>\n\n` +
            `تم إضافة <b>${result.totalNewFiles}</b> ملف جديد:\n` +
            result.syncedFiles.map(f => `• ${f}`).join('\n') +
            `\n\n🔗 <a href="${IRTAQI_URL}">افتح المنصة</a>`
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

    // اختبار الإشعارات
    if (url.pathname === '/test-notify') {
      await sendTelegramNotification(env, env.TELEGRAM_CHAT_ID,
        `✅ <b>منصة ارتقي</b>\n\nالإشعارات تعمل بشكل صحيح! 🎉\n\n🔗 <a href="${IRTAQI_URL}">افتح المنصة</a>`
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

async function syncMoodleFiles(env) {
  const { MOODLE_URL, MOODLE_USERNAME, MOODLE_PASSWORD, SUPABASE_URL, SUPABASE_KEY } = env;
  const session = await loginToMoodle(MOODLE_URL, MOODLE_USERNAME, MOODLE_PASSWORD);
  if (!session) throw new Error('Failed to login to Moodle');
  const courses = await getMoodleCourses(MOODLE_URL, session);
  let totalNewFiles = 0;
  const syncedFiles = [];
  for (const course of courses) {
    const files = await getCourseFiles(MOODLE_URL, session, course.id);
    for (const file of files) {
      const isNew = await isFileNew(SUPABASE_URL, SUPABASE_KEY, file.url);
      if (isNew) {
        const uploaded = await uploadFileToSupabase(session, file, SUPABASE_URL, SUPABASE_KEY);
        if (uploaded) { totalNewFiles++; syncedFiles.push(file.name); }
      }
    }
  }
  return { success: true, totalNewFiles, syncedFiles, timestamp: new Date().toISOString() };
}

async function loginToMoodle(moodleUrl, username, password) {
  try {
    const res = await fetch(`${moodleUrl}/login/token.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password, service: 'moodle_mobile_app' })
    });
    const data = await res.json();
    if (data.token) return { token: data.token, type: 'api' };
    const loginRes = await fetch(`${moodleUrl}/login/index.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }),
      redirect: 'manual'
    });
    const cookies = loginRes.headers.get('set-cookie');
    if (cookies && cookies.includes('MoodleSession')) return { cookies, type: 'session' };
    return null;
  } catch (e) { return null; }
}

async function getMoodleCourses(moodleUrl, session) {
  if (session.type === 'api') {
    const res = await fetch(`${moodleUrl}/webservice/rest/server.php?wstoken=${session.token}&wsfunction=core_course_get_enrolled_courses_by_timeline_classification&moodlewsrestformat=json&classification=all`);
    const data = await res.json();
    return data.courses || [];
  }
  const res = await fetch(`${moodleUrl}/my/`, { headers: { 'Cookie': session.cookies } });
  const html = await res.text();
  const courses = [];
  const regex = /course\/view\.php\?id=(\d+)/g;
  let match;
  while ((match = regex.exec(html)) !== null) courses.push({ id: match[1] });
  return courses;
}

async function getCourseFiles(moodleUrl, session, courseId) {
  if (session.type === 'api') {
    const res = await fetch(`${moodleUrl}/webservice/rest/server.php?wstoken=${session.token}&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=${courseId}`);
    const contents = await res.json();
    const files = [];
    for (const section of contents || []) {
      for (const mod of section.modules || []) {
        if (mod.modname === 'resource' && mod.contents) {
          for (const f of mod.contents) {
            if (f.type === 'file') files.push({ name: f.filename, url: f.fileurl + `&token=${session.token}`, size: f.filesize, courseId });
          }
        }
      }
    }
    return files;
  }
  const res = await fetch(`${moodleUrl}/course/view.php?id=${courseId}`, { headers: { 'Cookie': session.cookies } });
  const html = await res.text();
  const files = [];
  const regex = /pluginfile\.php([^"'\s]+)/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const name = match[1].split('/').pop() || 'file';
    files.push({ name, url: `${moodleUrl}/pluginfile.php${match[1]}`, size: 0, courseId });
  }
  return files;
}

async function isFileNew(supabaseUrl, supabaseKey, fileUrl) {
  const res = await fetch(`${supabaseUrl}/rest/v1/files?file_url=eq.${encodeURIComponent(fileUrl)}&select=id`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const data = await res.json();
  return data.length === 0;
}

async function uploadFileToSupabase(session, file, supabaseUrl, supabaseKey) {
  try {
    const fileRes = await fetch(file.url, { headers: session.cookies ? { 'Cookie': session.cookies } : {} });
    if (!fileRes.ok) return false;
    const blob = await fileRes.blob();
    const fileName = `moodle_auto/${Date.now()}_${file.name}`;
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/course-files/${fileName}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': blob.type || 'application/octet-stream' },
      body: blob
    });
    if (!uploadRes.ok) return false;
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/course-files/${fileName}`;
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/files`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${supabaseKey}`, 'apikey': supabaseKey, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ file_name: file.name, file_url: fileUrl, file_type: file.name.split('.').pop()?.toUpperCase() || 'FILE', file_size: file.size, module_id: 'moodle_auto_sync' })
    });
    return dbRes.ok;
  } catch (e) { return false; }
}
