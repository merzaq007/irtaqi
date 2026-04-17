import { useState, useEffect, useRef } from 'react';
import {
  Upload, Lock, CheckCircle, AlertCircle, FileUp,
  Trash2, LogOut, BookOpen, FileText, File as FileIcon,
  Calendar, HardDrive, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MODULES } from '@/lib/index';
import { Layout } from '@/components/Layout';
import { supabase, DBFile } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_KEY = 'irtaqi_teacher_auth';
const ADMIN_PASSWORD = '@irtaqi2026';
const BUCKET = 'course-files';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeLabel(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'PDF';
  if (['doc', 'docx'].includes(ext)) return 'DOC';
  if (['ppt', 'pptx'].includes(ext)) return 'PPT';
  if (['xls', 'xlsx'].includes(ext)) return 'XLS';
  return ext.toUpperCase();
}

function getTypeColor(type: string) {
  switch (type) {
    case 'PDF': return 'bg-red-500/10 text-red-600 border-red-200';
    case 'DOC': return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'PPT': return 'bg-orange-500/10 text-orange-600 border-orange-200';
    case 'XLS': return 'bg-green-500/10 text-green-600 border-green-200';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

function getFileIcon(type: string) {
  switch (type) {
    case 'PDF': return <FileText size={22} className="text-red-500" />;
    case 'DOC': return <FileIcon size={22} className="text-blue-500" />;
    case 'PPT': return <FileIcon size={22} className="text-orange-500" />;
    default: return <FileText size={22} className="text-muted-foreground" />;
  }
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onLogin();
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <Card className="w-full max-w-sm shadow-xl border-border/60">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-extrabold">لوحة التحكم</CardTitle>
          <CardDescription className="text-sm mt-1">أدخل كلمة المرور للمتابعة</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="كلمة المرور"
              className="text-right h-11"
              dir="rtl"
              autoFocus
            />
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full h-11 font-bold">
              دخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Upload Form ──────────────────────────────────────────────────────────────

function UploadForm({ onUploaded }: { onUploaded: (file: DBFile) => void }) {
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setMessage(null);
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
      const ext = selectedFile.name.split('.').pop();
      const filePath = `${selectedModule}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, selectedFile, { upsert: false });

      if (uploadError) throw uploadError;

      // 2. الحصول على الرابط العام
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      // 3. حفظ معلومات الملف في قاعدة البيانات
      const { data, error: dbError } = await supabase
        .from('files')
        .insert({
          file_name: selectedFile.name,
          file_url: urlData.publicUrl,
          file_type: getFileTypeLabel(selectedFile.name),
          file_size: selectedFile.size,
          module_id: selectedModule,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      onUploaded(data as DBFile);
      setMessage({ type: 'success', text: `✅ تم نشر "${selectedFile.name}" بنجاح` });
      setSelectedModule('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: `حدث خطأ: ${err.message || 'يرجى المحاولة مرة أخرى'}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="shadow-lg border-border/60">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <FileUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">نشر درس جديد</CardTitle>
            <CardDescription>اختر المقياس والملف لنشره للطلاب فوراً</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-semibold text-base">المقياس</Label>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger dir="rtl" className="h-11">
                <SelectValue placeholder="اختر المقياس..." />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-base">الملف</Label>
            <div
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold border ${getTypeColor(getFileTypeLabel(selectedFile.name))}`}>
                    {getFileTypeLabel(selectedFile.name)}
                  </div>
                  <span className="font-semibold text-foreground truncate max-w-xs">{selectedFile.name}</span>
                  <span className="text-muted-foreground text-sm">{formatSize(selectedFile.size)}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload size={32} className="text-primary/50" />
                  <p className="font-medium">اضغط لاختيار ملف</p>
                  <p className="text-xs">PDF, Word, PowerPoint, Excel</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              onChange={handleFileChange}
            />
          </div>

          {message && (
            <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
              {message.type === 'success'
                ? <CheckCircle className="h-4 w-4" />
                : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold"
            disabled={uploading || !selectedModule || !selectedFile}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> جاري النشر...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload size={18} /> نشر الدرس
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Files List per Module ────────────────────────────────────────────────────

function ModuleFilesList({
  moduleName,
  files,
  onDelete,
}: {
  moduleName: string;
  files: DBFile[];
  onDelete: (id: string, fileUrl: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen size={18} className="text-primary" />
          </div>
          <span className="font-bold text-foreground text-right">{moduleName}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-bold">{files.length} ملف</Badge>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open && (
        <div className="divide-y divide-border bg-background/50">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getTypeColor(file.file_type)}`}>
                {getFileIcon(file.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{file.file_name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(file.upload_date).toLocaleDateString('ar-DZ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive size={11} />
                    {formatSize(file.file_size)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border font-bold ${getTypeColor(file.file_type)}`}>
                    {file.file_type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                  title="فتح الملف"
                >
                  <Eye size={16} />
                </a>
                <button
                  onClick={() => onDelete(file.id, file.file_url)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Teacher Dashboard ───────────────────────────────────────────────────

function TeacherDashboard({ onLogout }: { onLogout: () => void }) {
  const [files, setFiles] = useState<DBFile[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب الملفات من Supabase عند فتح الصفحة
  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('upload_date', { ascending: false });

      if (!error && data) setFiles(data as DBFile[]);
      setLoading(false);
    };
    fetchFiles();
  }, []);

  const handleUploaded = (file: DBFile) => {
    setFiles((prev) => [file, ...prev]);
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;

    // استخراج مسار الملف من الرابط
    const path = fileUrl.split(`${BUCKET}/`)[1];

    // حذف من Storage
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }

    // حذف من قاعدة البيانات
    await supabase.from('files').delete().eq('id', id);

    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // تجميع الملفات حسب المقياس
  const filesByModule = MODULES.map((m) => ({
    ...m,
    files: files.filter((f) => f.module_id === m.id),
  })).filter((m) => m.files.length > 0);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" dir="rtl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
              لوحة الأستاذ
            </h1>
            <p className="text-muted-foreground mt-1">إدارة ونشر الدروس للطلاب</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="gap-2 font-semibold">
            <LogOut size={16} />
            خروج
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="text-center p-5 shadow-sm">
            <p className="text-4xl font-extrabold text-primary">{files.length}</p>
            <p className="text-muted-foreground text-sm mt-1 font-medium">إجمالي الملفات</p>
          </Card>
          <Card className="text-center p-5 shadow-sm">
            <p className="text-4xl font-extrabold text-accent">{filesByModule.length}</p>
            <p className="text-muted-foreground text-sm mt-1 font-medium">مقاييس نشطة</p>
          </Card>
          <Card className="text-center p-5 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-4xl font-extrabold text-green-600">{MODULES.length}</p>
            <p className="text-muted-foreground text-sm mt-1 font-medium">إجمالي المقاييس</p>
          </Card>
        </div>

        {/* Upload Form */}
        <UploadForm onUploaded={handleUploaded} />

        {/* Files by Module */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            الدروس المنشورة
          </h2>

          {loading ? (
            <Card className="p-10 text-center shadow-sm">
              <p className="text-muted-foreground font-medium animate-pulse">جاري تحميل الملفات...</p>
            </Card>
          ) : filesByModule.length === 0 ? (
            <Card className="p-10 text-center shadow-sm">
              <FileUp size={40} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">لم يتم نشر أي دروس بعد</p>
              <p className="text-muted-foreground text-sm mt-1">ارفع أول درس باستخدام النموذج أعلاه</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filesByModule.map((m) => (
                <ModuleFilesList
                  key={m.id}
                  moduleName={m.name}
                  files={m.files}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// ─── Page Entry ───────────────────────────────────────────────────────────────

export default function TeacherPage() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === '1'
  );

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return <TeacherDashboard onLogout={handleLogout} />;
}
