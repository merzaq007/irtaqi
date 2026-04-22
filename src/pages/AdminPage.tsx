import { useState } from 'react';
import { Upload, Lock, CheckCircle, AlertCircle, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MODULES } from '@/lib/index';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword]               = useState('');
  const [selectedModule, setSelectedModule]   = useState('');
  const [selectedFile, setSelectedFile]       = useState<File | null>(null);
  const [uploading, setUploading]             = useState(false);
  const [message, setMessage]                 = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setMessage(null);
    } else {
      setMessage({ type: 'error', text: 'كلمة المرور غير صحيحة' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (allowed.includes(file.type)) {
      setSelectedFile(file);
      setMessage(null);
    } else {
      setMessage({ type: 'error', text: 'نوع الملف غير مدعوم. PDF أو Word أو PowerPoint فقط' });
      setSelectedFile(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !selectedFile) {
      setMessage({ type: 'error', text: 'يرجى اختيار المقياس والملف' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      // 1. رفع الملف إلى Supabase Storage
      const ext      = selectedFile.name.split('.').pop()?.toLowerCase() || 'file';
      const path     = `${selectedModule}/${Date.now()}_${selectedFile.name}`;

      const { error: storageError } = await supabase.storage
        .from('course-files')
        .upload(path, selectedFile, { upsert: false });

      if (storageError) throw new Error(storageError.message);

      // 2. جلب الرابط العام
      const { data: urlData } = supabase.storage
        .from('course-files')
        .getPublicUrl(path);

      const fileUrl = urlData.publicUrl;

      // 3. حفظ المعلومات في قاعدة البيانات
      // هذا سيُطلق الـ trigger تلقائياً → Edge Function → إشعار Telegram
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          file_name:  selectedFile.name,
          file_url:   fileUrl,
          file_type:  ext.toUpperCase(),
          file_size:  selectedFile.size,
          module_id:  selectedModule,
        });

      if (dbError) throw new Error(dbError.message);

      setMessage({ type: 'success', text: `✅ تم نشر "${selectedFile.name}" وإرسال إشعار Telegram تلقائياً` });
      setSelectedModule('');
      setSelectedFile(null);
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';

    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ خطأ: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-6 w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">لوحة التحكم</CardTitle>
            <CardDescription className="text-base mt-2">يرجى إدخال كلمة المرور للوصول</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور" dir="rtl" />
              </div>
              {message?.type === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">دخول</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm">
              <FileUp className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold">رفع ملف جديد</CardTitle>
            <CardDescription className="text-base mt-3">
              عند الرفع يُرسل إشعار Telegram تلقائياً لكل الطلاب
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpload} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="module" className="text-base font-semibold">المقياس</Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger id="module" dir="rtl">
                    <SelectValue placeholder="اختر المقياس" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODULES.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="file-input" className="text-base font-semibold">الملف</Label>
                <Input id="file-input" type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx" dir="rtl" />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    الملف: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
              </div>

              {message && (
                <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
                  {message.type === 'success'
                    ? <CheckCircle className="h-4 w-4" />
                    : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full text-base py-6" size="lg"
                disabled={uploading || !selectedModule || !selectedFile}>
                {uploading ? (
                  <><span className="animate-spin mr-2">⏳</span>جاري الرفع والإشعار...</>
                ) : (
                  <><Upload className="ml-2 h-4 w-4" />نشر الدرس + إشعار Telegram</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
