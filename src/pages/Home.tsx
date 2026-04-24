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

        {/* ===== DESKTOP: تصميم احترافي كامل ===== */}
        <div className="hidden lg:block">

          {/* Hero - كامل العرض */}
          <header className="relative overflow-hidden min-h-[520px] flex items-center">
            {/* خلفية */}
            <div className="absolute inset-0 bg-[oklch(0.10_0.05_255)]" />
            <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-[oklch(0.42_0.16_255)]/15 blur-[120px] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[oklch(0.55_0.18_200)]/10 blur-[100px] translate-y-1/3" />
            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-8 xl:px-16 w-full py-20">
              <div className="max-w-3xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur border border-white/12 rounded-full px-4 py-1.5 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-white/70 text-xs font-medium tracking-wide">جامعة ابن خلدون تيارت — السنة أولى ماستر</span>
                </div>

                {/* العنوان الرئيسي */}
                <h1 className="text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                  منصة{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10">ارتقِي</span>
                    <span className="absolute inset-x-0 bottom-1 h-3 bg-[oklch(0.42_0.16_255)]/40 rounded-sm -z-0" />
                  </span>
                </h1>

                {/* الوصف */}
                <p className="text-lg text-white/55 font-medium mb-2 leading-relaxed">
                  المنصة الأكاديمية لطلبة تخصص تكنولوجيا وهندسة المعلومات
                </p>
                <p className="text-sm text-white/35 mb-10">
                  حيث يَسهُل الوصول إلى المحاضرات
                </p>

                {/* Stats + CTA */}
                <div className="flex items-center gap-8">
                  <button
                    onClick={() => document.getElementById('desktop-modules')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl text-white text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                    style={{background: 'linear-gradient(135deg, oklch(0.42_0.16_255), oklch(0.52_0.18_220))', boxShadow: '0 4px 20px oklch(0.42 0.16 255 / 0.35)'}}
                  >
                    تصفح المقاييس
                    <ChevronLeft size={16} className="rotate-90" />
                  </button>

                  {!loading && (
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{modulesData.length}</div>
                        <div className="text-xs text-white/35 mt-0.5">مقياس</div>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{totalFiles}</div>
                        <div className="text-xs text-white/35 mt-0.5">ملف متاح</div>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{activeModules}</div>
                        <div className="text-xs text-white/35 mt-0.5">مقياس نشط</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* المقاييس - Grid 3 أعمدة */}
          <main className="max-w-7xl mx-auto px-8 xl:px-16 py-16" id="desktop-modules">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold text-foreground">المقاييس الدراسية</h2>
                <p className="text-muted-foreground text-sm mt-1">اختر المقياس للوصول إلى الملفات والدروس</p>
              </div>
              {!loading && (
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium">
                  {modulesData.length} مقياس
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl p-5 border border-border animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
                      <div className="flex-1">
                        <div className="h-3.5 bg-muted rounded w-4/5 mb-2" />
                        <div className="h-2.5 bg-muted rounded w-2/5" />
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
                      className="group bg-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-xl hover:bg-primary/[0.02] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                    >
                      {/* خط علوي ملون */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${module.color}`}>
                          {iconMap[module.icon]}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {module.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {hasFiles ? (
                          <span className="text-xs font-semibold bg-primary/8 text-primary px-2.5 py-1 rounded-lg">
                            {count} ملف متاح
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">لا توجد ملفات بعد</span>
                        )}
                        <div className="flex items-center gap-1.5">
                          {recentModules.has(module.id) && (
                            <span className="text-[9px] font-bold bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20">جديد</span>
                          )}
                          <ChevronLeft size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              }
            </div>
          </main>
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
