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
    <div className="bg-card rounded-xl p-3 sm:p-4 border border-border animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
        <div className="flex-grow">
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
        <div className="w-5 h-5 rounded bg-muted shrink-0" />
      </div>
    </div>
  );
}

export default function Home() {
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});
  const [recentModules, setRecentModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('files')
        .select('module_id, upload_date');

      if (!error && data) {
        const counts: Record<string, number> = {};
        const recent = new Set<string>();
        data.forEach((row: { module_id: string; upload_date: string }) => {
          counts[row.module_id] = (counts[row.module_id] || 0) + 1;
          if (new Date(row.upload_date) >= sevenDaysAgo) recent.add(row.module_id);
        });
        setFileCounts(counts);
        setRecentModules(recent);
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

        {/* ===== DESKTOP: Hero + Modules side by side ===== */}
        <div className="hidden lg:flex min-h-screen relative">

          {/* خلفية كاملة للـ desktop */}
          <div className="absolute inset-0 bg-[oklch(0.12_0.06_255)]" />
          <div className="absolute top-[-100px] left-[30%] w-[500px] h-[500px] rounded-full bg-[oklch(0.40_0.14_255)]/20 blur-[100px]" />
          <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[oklch(0.55_0.18_200)]/15 blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)', backgroundSize: '50px 50px'}} />

          {/* Hero - يسار */}
          <div className="relative z-10 w-[420px] xl:w-[480px] shrink-0 flex flex-col justify-center px-10 xl:px-14 py-16 sticky top-0 h-screen">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 mb-8 w-fit">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
              <span className="text-white/80 text-xs font-medium">جامعة ابن خلدون تيارت</span>
            </div>

            <h1 className="text-5xl xl:text-6xl font-extrabold mb-6 tracking-tight text-white leading-tight">
              منصة ارتقِي
            </h1>

            <div className="flex flex-col gap-2 mb-8">
              <p className="text-sm text-white/70 font-medium">المنصة الأكاديمية لطلبة السنة أولى ماستر</p>
              <p className="text-sm text-white/70 font-medium">تخصص تكنولوجيا وهندسة المعلومات</p>
              <p className="text-xs text-white/40 font-medium mt-1">حيث يَسهُل الوصول إلى المحاضرات</p>
            </div>

            {/* Stats */}
            {!loading && (
              <div className="flex items-center gap-6 mb-8">
                <div>
                  <span className="text-2xl font-extrabold text-white">{modulesData.length}</span>
                  <p className="text-xs text-white/40">مقياس</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <span className="text-2xl font-extrabold text-white">{activeModules}</span>
                  <p className="text-xs text-white/40">مقياس نشط</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <span className="text-2xl font-extrabold text-white">{totalFiles}</span>
                  <p className="text-xs text-white/40">ملف متاح</p>
                </div>
              </div>
            )}

            <button
              onClick={() => document.querySelector('.desktop-modules')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 text-sm text-white w-fit"
              style={{background: 'linear-gradient(135deg, oklch(0.40_0.14_255), oklch(0.55_0.18_200))', boxShadow: '0 4px 24px oklch(0.40 0.14 255 / 0.4)'}}
            >
              تصفح المقاييس ↓
            </button>
          </div>

          {/* فاصل */}
          <div className="relative z-10 w-px bg-white/5 shrink-0" />

          {/* المقاييس - يمين */}
          <div className="relative z-10 flex-1 overflow-y-auto py-8 px-6 xl:px-10 desktop-modules" style={{maxHeight: '100vh'}}>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white/80">المقاييس الدراسية</h2>
              <p className="text-white/40 text-xs mt-1">اختر المقياس للوصول إلى الملفات</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 shrink-0" />
                      <div className="flex-grow">
                        <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-white/10 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))
                : modulesData.map((module) => {
                  const count = fileCounts[module.id] || 0;
                  const hasFiles = count > 0;
                  return (
                    <Link
                      key={module.id}
                      to={`/module/${module.id}`}
                      className="group bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-white/25 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary to-accent transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:text-white shrink-0 ${module.color}`}>
                          {iconMap[module.icon]}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xs font-bold text-white/80 group-hover:text-white transition-colors truncate leading-snug">
                              {module.title}
                            </h3>
                            {recentModules.has(module.id) && (
                              <span className="shrink-0 text-[9px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">جديد</span>
                            )}
                          </div>
                          <div className="mt-1">
                            {hasFiles
                              ? <span className="text-[10px] font-semibold text-primary/80">{count} ملف</span>
                              : <span className="text-[10px] text-white/30">لا توجد ملفات</span>
                            }
                          </div>
                        </div>
                        <ChevronLeft size={14} className="text-white/30 group-hover:text-white/70 transition-colors shrink-0" />
                      </div>
                    </Link>
                  );
                })
              }
            </div>
          </div>
        </div>

        {/* ===== MOBILE/TABLET: الهيكل الأصلي ===== */}
        <div className="lg:hidden flex flex-col">
          {/* Hero Section */}
          <header className="relative overflow-hidden min-h-[320px] sm:min-h-[420px] flex items-center justify-center">
            <div className="absolute inset-0 bg-[oklch(0.12_0.06_255)]" />
            <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[oklch(0.40_0.14_255)]/20 blur-[80px]" />
            <div className="absolute bottom-[-60px] left-[-60px] w-[350px] h-[350px] rounded-full bg-[oklch(0.55_0.18_200)]/15 blur-[70px]" />
            <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: 'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)', backgroundSize: '50px 50px'}} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center py-14 sm:py-20">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
                <span className="text-white/80 text-xs sm:text-sm font-medium">جامعة ابن خلدون تيارت</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 tracking-tight text-white drop-shadow-lg">
                منصة ارتقِي
              </h1>
              <div className="flex flex-col items-center gap-1.5 mb-8">
                <p className="text-sm sm:text-base text-white/70 font-medium">المنصة الأكاديمية لطلبة السنة أولى ماستر</p>
                <p className="text-sm sm:text-base text-white/70 font-medium">تخصص تكنولوجيا وهندسة المعلومات</p>
                <p className="text-xs sm:text-sm text-white/40 mt-1 font-medium">حيث يَسهُل الوصول إلى المحاضرات</p>
              </div>
              <button
                onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 font-bold px-7 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 text-sm text-white"
                style={{background: 'linear-gradient(135deg, oklch(0.40_0.14_255), oklch(0.55_0.18_200))', boxShadow: '0 4px 24px oklch(0.40 0.14 255 / 0.4)'}}
              >
                تصفح المقاييس ↓
              </button>
            </div>
          </header>

          {/* Stats Bar */}
          {!loading && (
            <div className="bg-card/60 backdrop-blur border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-4 sm:gap-8">
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

          {/* المقاييس */}
          <main className="flex-grow max-w-7xl mx-auto px-3 sm:px-6 pb-16 pt-6 sm:pt-10 w-full">
            <div className="mb-5 sm:mb-8" id="modules">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">المقاييس الدراسية</h2>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">اختر المقياس للوصول إلى الملفات والدروس</p>
            </div>
            <div className="flex flex-col gap-3 max-w-2xl mx-auto">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <ModuleCardSkeleton key={i} />)
                : modulesData.map((module) => {
                  const count = fileCounts[module.id] || 0;
                  const hasFiles = count > 0;
                  return (
                    <Link
                      key={module.id}
                      to={`/module/${module.id}`}
                      className="group bg-card backdrop-blur-md rounded-xl p-3 sm:p-4 shadow-sm border border-border active:scale-[0.98] hover:shadow-2xl hover:border-primary/40 transition-all duration-300 ease-out hover:-translate-y-1 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-inner group-hover:text-white shrink-0 ${module.color}`}>
                          {iconMap[module.icon]}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-sm sm:text-base font-bold text-card-foreground leading-snug group-hover:text-primary transition-colors duration-300 truncate">
                              {module.title}
                            </h2>
                            {recentModules.has(module.id) && (
                              <span className="shrink-0 text-[10px] font-bold bg-green-500/15 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20">جديد</span>
                            )}
                          </div>
                          <div className="mt-1.5">
                            {hasFiles
                              ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{count} ملف متاح</span>
                              : <span className="text-xs text-muted-foreground font-medium">لا توجد ملفات بعد</span>
                            }
                          </div>
                        </div>
                        <div className="text-muted-foreground group-hover:text-primary transition-colors duration-500 shrink-0">
                          <ChevronLeft size={20} strokeWidth={2.5} />
                        </div>
                      </div>
                    </Link>
                  );
                })
              }
            </div>
          </main>
        </div>

      </div>
    </Layout>
  );
}
