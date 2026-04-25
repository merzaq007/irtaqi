import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { modulesData } from '../data/modules';
import {
  Globe, FileText, Network, Server, BookOpen, Database,
  Shield, Bot, Rocket, Share2, Languages, ChevronLeft
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { AnimatedCard } from '../components/AnimatedCard';
import { supabase } from '@/lib/supabase';

const iconMap: Record<string, React.ReactNode> = {
  Globe:     <Globe size={20} strokeWidth={1.5} />,
  FileText:  <FileText size={20} strokeWidth={1.5} />,
  Network:   <Network size={20} strokeWidth={1.5} />,
  Server:    <Server size={20} strokeWidth={1.5} />,
  BookOpen:  <BookOpen size={20} strokeWidth={1.5} />,
  Database:  <Database size={20} strokeWidth={1.5} />,
  Shield:    <Shield size={20} strokeWidth={1.5} />,
  Bot:       <Bot size={20} strokeWidth={1.5} />,
  Rocket:    <Rocket size={20} strokeWidth={1.5} />,
  Share2:    <Share2 size={20} strokeWidth={1.5} />,
  Languages: <Languages size={20} strokeWidth={1.5} />,
};

const gradientBtn = {
  background: 'linear-gradient(135deg, oklch(0.42 0.16 255), oklch(0.52 0.18 220))',
  boxShadow: '0 4px 20px oklch(0.42 0.16 255 / 0.35)',
};

function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-muted rounded w-4/5" />
          <div className="h-2.5 bg-muted rounded w-2/5" />
        </div>
      </div>
    </div>
  );
}

function MobileSkeletonCard() {
  return (
    <div className="bg-card rounded-xl p-3 border border-border animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
        <div className="flex-grow space-y-2">
          <div className="h-3.5 bg-muted rounded w-3/4" />
          <div className="h-2.5 bg-muted rounded w-1/4" />
        </div>
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
      const { data, error } = await supabase.from('files').select('module_id, upload_date');
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

        {/* ===== DESKTOP ===== */}
        <div className="hidden lg:block">

          {/* Hero */}
          <header className="relative overflow-hidden min-h-[540px] flex items-center">
            <div className="absolute inset-0 bg-[oklch(0.10_0.05_255)]" />
            <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-[oklch(0.42_0.16_255)]/15 blur-[120px] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[oklch(0.55_0.18_200)]/10 blur-[100px] translate-y-1/3" />
            <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage:'linear-gradient(oklch(1 0 0) 1px,transparent 1px),linear-gradient(90deg,oklch(1 0 0) 1px,transparent 1px)',backgroundSize:'60px 60px'}} />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-8 xl:px-16 w-full py-20">
              <div className="max-w-3xl">

                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 bg-white/8 backdrop-blur border border-white/12 rounded-full px-4 py-1.5 mb-6"
                  style={{opacity:1,animation:'fadeInDown 0.6s ease both'}}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-white/70 text-xs font-medium tracking-wide">جامعة ابن خلدون تيارت — السنة أولى ماستر</span>
                </div>

                {/* العنوان */}
                <h1
                  className="text-6xl xl:text-7xl font-bold text-white mb-4 leading-[1.1] tracking-tight"
                  style={{animation:'fadeInUp 0.7s ease 0.1s both'}}
                >
                  كل محاضراتك في{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-blue-300">مكان واحد</span>
                    <span className="absolute inset-x-0 bottom-1 h-3 bg-blue-400/30 rounded-sm -z-0" />
                  </span>
                </h1>

                {/* الوصف */}
                <p
                  className="text-base text-white/55 mb-2 leading-relaxed"
                  style={{animation:'fadeInUp 0.7s ease 0.2s both'}}
                >
                  المنصة الأكاديمية لطلبة تخصص تكنولوجيا وهندسة المعلومات
                </p>
                <p
                  className="text-sm text-white/30 mb-10"
                  style={{animation:'fadeInUp 0.7s ease 0.25s both'}}
                >
                  حيث يَسهُل الوصول إلى المحاضرات والملفات الدراسية
                </p>

                {/* CTA + Stats */}
                <div
                  className="flex items-center gap-8 flex-wrap"
                  style={{animation:'fadeInUp 0.7s ease 0.35s both'}}
                >
                  <button
                    onClick={() => document.getElementById('desktop-modules')?.scrollIntoView({behavior:'smooth'})}
                    className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl text-white text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                    style={gradientBtn}
                  >
                    ابدأ التصفح الآن
                    <ChevronLeft size={16} className="rotate-90" />
                  </button>

                  {!loading && (
                    <div className="flex items-center gap-6">
                      {[
                        {val: modulesData.length, label: 'مقياس'},
                        {val: totalFiles, label: 'ملف متاح'},
                        {val: activeModules, label: 'مقياس نشط'},
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-6">
                          {i > 0 && <div className="w-px h-8 bg-white/10" />}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{s.val}</div>
                            <div className="text-xs text-white/35 mt-0.5">{s.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* المقاييس */}
          <main className="max-w-7xl mx-auto px-8 xl:px-16 py-16" id="desktop-modules">
            <AnimatedCard className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold text-foreground">المقاييس الدراسية</h2>
                <p className="text-muted-foreground text-sm mt-1">اختر المقياس للوصول إلى الملفات والدروس</p>
              </div>
              {!loading && (
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium">
                  {modulesData.length} مقياس
                </span>
              )}
            </AnimatedCard>

            <div className="grid grid-cols-3 gap-4">
              {loading
                ? Array.from({length:9}).map((_,i) => <SkeletonCard key={i} />)
                : modulesData.map((module, idx) => {
                  const count = fileCounts[module.id] || 0;
                  const hasFiles = count > 0;
                  return (
                    <AnimatedCard key={module.id} delay={idx * 50}>
                      <Link
                        to={`/module/${module.id}`}
                        className="group flex flex-col bg-card rounded-2xl p-5 border border-border hover:border-primary/35 hover:shadow-xl hover:bg-primary/[0.015] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full"
                      >
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                        <div className="flex items-start gap-3 mb-4 flex-1">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${module.color}`}>
                            {iconMap[module.icon]}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                              {module.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          {hasFiles
                            ? <span className="text-xs font-semibold bg-primary/8 text-primary px-2.5 py-1 rounded-lg">{count} ملف</span>
                            : <span className="text-xs text-muted-foreground/60">لا توجد ملفات بعد</span>
                          }
                          <div className="flex items-center gap-1.5">
                            {recentModules.has(module.id) && (
                              <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20">جديد</span>
                            )}
                            <ChevronLeft size={14} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-[-2px] transition-all duration-200" />
                          </div>
                        </div>
                      </Link>
                    </AnimatedCard>
                  );
                })
              }
            </div>
          </main>
        </div>

        {/* ===== MOBILE/TABLET ===== */}
        <div className="lg:hidden flex flex-col">
          <header className="relative overflow-hidden min-h-[320px] sm:min-h-[420px] flex items-center justify-center">
            <div className="absolute inset-0 bg-[oklch(0.10_0.05_255)]" />
            <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[oklch(0.42_0.16_255)]/20 blur-[80px]" />
            <div className="absolute bottom-[-60px] left-[-60px] w-[350px] h-[350px] rounded-full bg-[oklch(0.55_0.18_200)]/15 blur-[70px]" />
            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(oklch(1 0 0) 1px,transparent 1px),linear-gradient(90deg,oklch(1 0 0) 1px,transparent 1px)',backgroundSize:'50px 50px'}} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center py-14 sm:py-20">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-white/75 text-xs font-medium">جامعة ابن خلدون تيارت</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white leading-tight">
                كل محاضراتك في مكان واحد
              </h1>
              <p className="text-xs sm:text-sm text-white/60 mb-1">السنة أولى ماستر</p>
              <p className="text-xs text-white/40 mb-8">تخصص تكنولوجيا وهندسة المعلومات</p>
              <button
                onClick={() => document.getElementById('modules')?.scrollIntoView({behavior:'smooth'})}
                className="inline-flex items-center gap-2 font-bold px-7 py-3 rounded-xl text-white text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                style={gradientBtn}
              >
                ابدأ التصفح ↓
              </button>
            </div>
          </header>

          {!loading && (
            <div className="bg-card/60 backdrop-blur border-b border-border">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-6 sm:gap-10">
                {[
                  {val: modulesData.length, label: 'مقياس'},
                  {val: activeModules, label: 'نشط'},
                  {val: totalFiles, label: 'ملف'},
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-6">
                    {i > 0 && <div className="w-px h-5 bg-border" />}
                    <div className="text-center">
                      <span className="text-base sm:text-lg font-bold text-primary">{s.val}</span>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <main className="flex-grow max-w-2xl mx-auto px-3 sm:px-6 pb-16 pt-6 w-full">
            <div className="mb-5" id="modules">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">المقاييس الدراسية</h2>
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">اختر المقياس للوصول إلى الملفات</p>
            </div>
            <div className="flex flex-col gap-2.5">
              {loading
                ? Array.from({length:6}).map((_,i) => <MobileSkeletonCard key={i} />)
                : modulesData.map((module, idx) => {
                  const count = fileCounts[module.id] || 0;
                  const hasFiles = count > 0;
                  return (
                    <AnimatedCard key={module.id} delay={idx * 40}>
                      <Link
                        to={`/module/${module.id}`}
                        className="group flex bg-card rounded-xl p-3 sm:p-4 border border-border active:scale-[0.98] hover:border-primary/35 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        <div className="flex items-center gap-3 w-full">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${module.color}`}>
                            {iconMap[module.icon]}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {module.title}
                              </h2>
                              {recentModules.has(module.id) && (
                                <span className="shrink-0 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-500/20">جديد</span>
                              )}
                            </div>
                            <div className="mt-1">
                              {hasFiles
                                ? <span className="text-xs font-medium text-primary/80">{count} ملف متاح</span>
                                : <span className="text-xs text-muted-foreground/60">لا توجد ملفات بعد</span>
                              }
                            </div>
                          </div>
                          <ChevronLeft size={16} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-[-2px] transition-all duration-200 shrink-0" />
                        </div>
                      </Link>
                    </AnimatedCard>
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
