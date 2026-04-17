import { useState } from 'react';
import { Upload, Lock, CheckCircle, AlertCircle, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MODULES } from '@/lib/index';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'نوع الملف غير مدعوم. يرجى اختيار ملف PDF أو Word أو PowerPoint' });
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !selectedFile) {
      setMessage({ type: 'error', text: 'يرجى اختيار المادة والملف' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage({ type: 'success', text: `تم رفع الملف "${selectedFile.name}" بنجاح` });
      setSelectedModule('');
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى' });
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
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              {message && message.type === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                دخول
              </Button>
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
            <CardDescription className="text-base mt-3">اختر المقياس والملف لرفعه إلى المنصة</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpload} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="module" className="text-base font-semibold">المقياس</Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger id="module" className="text-right" dir="rtl">
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODULES.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="file-input" className="text-base font-semibold">الملف</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground text-right">
                    الملف المحدد: {selectedFile.name}
                  </p>
                )}
              </div>

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

              <Button
                type="submit"
                className="w-full text-base py-6"
                disabled={uploading || !selectedModule || !selectedFile}
                size="lg"
              >
                {uploading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="ml-2 h-4 w-4" />
                    رفع الملف
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
