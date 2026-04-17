import { useParams, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { modulesData } from '../data/modules';
import { FileText, File as FileIcon, ArrowRight, Download, Calendar, HardDrive } from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase, DBFile } from '@/lib/supabase';

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [files, setFiles] = useState<DBFile[]>([]);
  const [loading, setLoading] = useState(true);

  const module = modulesData.find(m => m.id === moduleId);

  useEffect(() => {
    if (!moduleId) return;
    const fetchFiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('module_id', moduleId)
        .order('upload_date', { ascending: false });

      if (!error && data) setFiles(data as DBFile[]);
      setLoading(false);
    };
    fetchFiles();
  }, [moduleId]);

  if (!module) return <Navigate to="/" replace />;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="text-red-500" size={28} strokeWidth={1.5} />;
      case 'DOC': return <FileIcon className="text-blue-500" size={28} strokeWidth={1.5} />;
      case 'PPT': return <FileIcon className="text-orange-500" size={28} strokeWidth={1.5} />;
      default: return <FileText className="text-muted-foreground" size={28} strokeWidth={1.5} />;
    }
  };

  const getFileIconBackground = (type: string) => {
    switch (type) {
      case 'PDF': return 'bg-red-500/10 text-red-500';
      case 'DOC': return 'bg-blue-500/10 text-blue-500';
      case 'PPT': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col w-full relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none h-64" />

        {/* Navigation */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 w-full relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-bold bg-card/60 backdrop-blur px-5 py-2.5 rounded-full shadow-sm border border-border transition-all duration-300 hover:shadow-md hover:-translate-x-1"
          >
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Main Content */}
        <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
          {/* Module Header */}
          <div className="mb-12 text-center sm:text-right bg-card/80 backdrop-blur-md rounded-3xl p-10 shadow-sm border border-border">
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 leading-normal bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
              {module.title}
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-medium">
              تصفح وحمل جميع الملفات والمحاضرات الخاصة بهذا المقياس.
            </p>
          </div>

          {/* Files List */}
          {loading ? (
            <div className="bg-card rounded-2xl p-12 text-center shadow-sm border border-border">
              <p className="text-muted-foreground text-lg animate-pulse">جاري تحميل الملفات...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 text-center shadow-sm border border-border">
              <p className="text-muted-foreground text-lg">لا توجد ملفات حالياً في هذا المقياس.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-xl hover:border-primary/40 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-primary to-accent transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                  <div className="flex items-center gap-5 flex-grow">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 ${getFileIconBackground(file.file_type)}`}>
                      {getFileIcon(file.file_type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                        {file.file_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
                          <Calendar size={14} />
                          {new Date(file.upload_date).toLocaleDateString('ar-DZ')}
                        </span>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                          {file.file_type}
                        </span>
                        <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full font-mono">
                          <HardDrive size={14} />
                          {file.file_size < 1024 * 1024
                            ? `${(file.file_size / 1024).toFixed(1)} KB`
                            : `${(file.file_size / (1024 * 1024)).toFixed(1)} MB`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.file_name}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 transform active:scale-95"
                  >
                    <Download size={20} strokeWidth={2.5} />
                    <span>تحميل</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
