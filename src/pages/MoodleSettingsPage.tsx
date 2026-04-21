import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MOODLE_URL = 'https://moodle.univ-tiaret.dz';

export default function MoodleSettingsPage() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // تحميل الإعدادات المحفوظة
  useEffect(() => {
    const savedToken = localStorage.getItem('moodle_token');
    if (savedToken) {
      setToken(savedToken);
      setIsConnected(true);
    }
  }, []);

  // الطريقة 1: إدخال Token مباشرة
  const handleSaveToken = () => {
    if (!token.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال Token' });
      return;
    }
    localStorage.setItem('moodle_token', token);
    setIsConnected(true);
    setMessage({ type: 'success', text: '✅ تم حفظ Token بنجاح' });
  };

  // الطريقة 2: الحصول على Token تلقائياً
  const handleGetToken = async () => {
    if (!username.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // استدعاء Moodle Token API
      const response = await fetch(`${MOODLE_URL}/login/token.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username,
          password,
          service: 'moodle_mobile_app',
        }),
      });

      const data = await response.json();

      if (data.token) {
        setToken(data.token);
        localStorage.setItem('moodle_token', data.token);
        setIsConnected(true);
        setMessage({ type: 'success', text: '✅ تم الاتصال بالمودل بنجاح!' });
      } else if (data.error) {
        setMessage({ type: 'error', text: `خطأ: ${data.error}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `فشل الاتصال: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // مزامنة الملفات من المودل
  const handleSync = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'يرجى الاتصال بالمودل أولاً' });
      return;
    }

    setLoading(true);
    setMessage({ type: 'success', text: '🔄 جاري المزامنة...' });

    try {
      // جلب المقررات
      const coursesResponse = await fetch(
        `${MOODLE_URL}/webservice/rest/server.php?wstoken=${token}&wsfunction=core_course_get_enrolled_courses_by_timeline_classification&moodlewsrestformat=json&classification=all`
      );
      const courses = await coursesResponse.json();

      if (courses.error) {
        throw new Error(courses.error);
      }

      let totalFiles = 0;

      // لكل مقرر، جلب المحتوى
      for (const course of courses.courses || []) {
        const contentsResponse = await fetch(
          `${MOODLE_URL}/webservice/rest/server.php?wstoken=${token}&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=${course.id}`
        );
        const contents = await contentsResponse.json();

        // استخراج الملفات
        for (const section of contents || []) {
          for (const module of section.modules || []) {
            if (module.modname === 'resource' && module.contents) {
              for (const file of module.contents) {
                if (file.type === 'file') {
                  // حفظ الملف في قاعدة البيانات
                  await supabase.from('files').insert({
                    file_name: file.filename,
                    file_url: file.fileurl + `&token=${token}`,
                    file_type: file.filename.split('.').pop()?.toUpperCase() || 'FILE',
                    file_size: file.filesize,
                    module_id: 'moodle_sync', // يمكن تحسينه لربطه بالمقاييس
                  });
                  totalFiles++;
                }
              }
            }
          }
        }
      }

      setMessage({ type: 'success', text: `✅ تمت المزامنة! تم إضافة ${totalFiles} ملف` });
    } catch (error: any) {
      setMessage({ type: 'error', text: `خطأ في المزامنة: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6" dir="rtl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
            ربط المنصة بالمودل
          </h1>
          <p className="text-muted-foreground mt-2">
            قم بربط حسابك في المودل لمزامنة المحاضرات تلقائياً
          </p>
        </div>

        {/* حالة الاتصال */}
        {isConnected && (
          <Alert className="bg-green-500/10 border-green-500/50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 font-semibold">
              متصل بالمودل ✓
            </AlertDescription>
          </Alert>
        )}

        {/* الطريقة 1: إدخال Token مباشرة */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>الطريقة 1: إدخال Token مباشرة</CardTitle>
                <CardDescription>إذا كان لديك Token جاهز من المودل</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Moodle Token</Label>
              <Input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="أدخل Token من المودل"
                dir="ltr"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                احصل على Token من: {MOODLE_URL}/login/token.php
              </p>
            </div>
            <Button onClick={handleSaveToken} className="w-full">
              حفظ Token
            </Button>
          </CardContent>
        </Card>

        {/* الطريقة 2: الحصول على Token تلقائياً */}
        <Card>
          <CardHeader>
            <CardTitle>الطريقة 2: الاتصال التلقائي</CardTitle>
            <CardDescription>أدخل بيانات حسابك في المودل</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اسم المستخدم</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اسم المستخدم في المودل"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                dir="ltr"
              />
            </div>
            <Button onClick={handleGetToken} disabled={loading} className="w-full">
              {loading ? 'جاري الاتصال...' : 'الاتصال بالمودل'}
            </Button>
          </CardContent>
        </Card>

        {/* زر المزامنة */}
        {isConnected && (
          <Card className="bg-primary/5">
            <CardContent className="pt-6">
              <Button
                onClick={handleSync}
                disabled={loading}
                className="w-full h-12 text-base font-bold"
                variant="default"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin" size={18} />
                    جاري المزامنة...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw size={18} />
                    مزامنة الملفات من المودل
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* الرسائل */}
        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </div>
    </Layout>
  );
}
