import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { modulesData } from '../data/modules';
import {
  Globe, FileText, Network, Server, BookOpen, Database,
  Shield, Bot, Rocket, Share2, Languages, ChevronLeft
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { supabase } from '@/lib/supabase';

const iconMap: Record<string, React.ReactNode> = {
  Globe:     <Globe size={22} strokeWidth={1.5} />,
  FileText:  <FileText size={22} strokeWidth={1.5} />,
  Network:   <Network size={22} strokeWidth={1.5} />,
  Server:    <Server size={22} strokeWidth={1.5} />,
  BookOpen:  <BookOpen size={22} strokeWidth={1.5} />,
  Database:  <Database size={22} strokeWidth={1.5} />,
  Shield:    <Shield size={22} strokeWidth={1.5} />,
  Bot:       <Bot size={22} strokeWidth={1.5} />,
  Rocket:    <Rocket size={22} strokeWidth={1.5} />,
  Share2:    <Share2 size={22} strokeWidth={1.5} />,
  Languages: <Languages size={22} strokeWidth={1.5} />,
};

// Skeleton card component
function ModuleCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 sm:p-5 border border-border animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted shrink-0" />
        <div className="flex-grow">
          <div className="h-5 sm:h-6 bg-muted rounded w-3/4 mb-3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="w-6 h-6 rounded bg-muted shrink-0" />
      </div>
    </div>
  );
}

export default function Home() {
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from('files')
        .select('module_id');

      if (!error && data) {
        const counts: Record<string, number> = {};
        data.forEach((row: { module_id: string }) => {
          counts[row.module_id] = (counts[row.module_id] || 0) + 1;
        });
        setFileCounts(counts);
      }
      setLoading(false);
    };
    fetchCounts();
  }, []);

  const totalFiles = Object.values(fileCounts).reduce((a, b) => a + b, 0);
  const activeModules = Object.keys(fileCounts).filter(k => fileCounts[k] > 0).length;

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <header className="relative overflow-hidden min-h-[260px] sm:min-h-[420px] flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src="/library.png"
              alt="مكتبة جامعية"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-10 sm:py-24">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">جامعة ابن خلدون تيارت - السنة أولى ماستر</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold mb-3 tracking-tight text-white drop-shadow-lg">
              منصة ارتقِي
            </h1>
            <p className="text-sm sm:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto font-medium">
              المنصة الأكاديمية لطلبة السنة أولى ماستر — تخصص تكنولوجيا وهندسة المعلومات
            </p>
          </div>
        </header>

        {/* Stats Bar */}
        {!loading && (
          <div className="bg-card/60 backdrop-blur border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-4 sm:gap-8">
              <div className="text-center">
                <span className="text-lg sm:text-xl font-extrabold text-primary">{modulesData.length}</span>
                <p className="text-[11px] sm:text-xs text-muted-foreground">مقياس</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-border" />
              <div className="text-center">
                <span className="text-lg sm:text-xl font-extrabold text-primary">{activeModules}</span>
                <p className="text-[11px] sm:text-xs text-muted-foreground">مقياس نشط</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-border" />
              <div className="text-center">
                <span className="text-lg sm:text-xl font-extrabold text-primary">{totalFiles}</span>
                <p className="text-[11px] sm:text-xs text-muted-foreground">ملف متاح</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-16 pt-6 sm:pt-10 w-full">

          {/* Header */}
          <div className="mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">المقاييس الدراسية</h2>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">اختر المقياس للوصول إلى الملفات والدروس</p>
          </div>

          {/* List Layout */}
          <div className="flex flex-col gap-3 sm:gap-4 max-w-4xl mx-auto">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ModuleCardSkeleton key={i} />)
              : modulesData.map((module) => {
                const count = fileCounts[module.id] || 0;
                const hasFiles = count > 0;
                return (
                  <Link
                    key={module.id}
                    to={`/module/${module.id}`}
                    className="group bg-card backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-sm border border-border active:scale-[0.98] hover:shadow-2xl hover:border-primary/40 transition-all duration-300 ease-out hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />

                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-500 shadow-inner group-hover:text-white shrink-0 ${module.color}`}>
                        {iconMap[module.icon]}
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-card-foreground mb-2 leading-snug group-hover:text-primary transition-colors duration-300">
                          {module.title}
                        </h2>

                        {/* Progress bar */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs sm:text-sm text-muted-foreground font-semibold">
                              {hasFiles ? `${count} ملفات متاحة` : 'لا توجد ملفات بعد'}
                            </span>
                            {hasFiles && (
                              <span className="text-xs sm:text-sm font-bold text-primary">{count}</span>
                            )}
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                              style={{ width: hasFiles ? `${Math.min((count / 10) * 100, 100)}%` : '0%' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="text-muted-foreground group-hover:text-primary transition-colors duration-500 shrink-0">
                        <ChevronLeft size={24} strokeWidth={2.5} />
                      </div>
                    </div>
                  </Link>
                );
              })
            }
          </div>
        </main>
      </div>
    </Layout>
  );
}
