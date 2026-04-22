import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { modulesData } from '../data/modules';
import {
  Globe, FileText, Network, Server, BookOpen, Database,
  Shield, Bot, Rocket, Share2, Languages, ChevronLeft, Search
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
    <div className="bg-card rounded-xl p-4 border border-border animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-lg bg-muted" />
        <div className="w-5 h-5 rounded bg-muted mt-1" />
      </div>
      <div className="h-5 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/3" />
    </div>
  );
}

export default function Home() {
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredModules = modulesData.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <header className="relative overflow-hidden min-h-[320px] sm:min-h-[420px] flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src="/library.png"
              alt="مكتبة جامعية"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-24">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-white/90 text-sm font-medium">جامعة ابن خلدون تيارت - السنة أولى ماستر</span>
            </div>
            <h1 className="text-4xl sm:text-7xl font-extrabold mb-4 tracking-tight text-white drop-shadow-lg">
              منصة ارتقِي
            </h1>
            <p className="text-base sm:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto font-medium">
              المنصة الأكاديمية لطلبة السنة أولى ماستر — تخصص تكنولوجيا وهندسة المعلومات
            </p>
          </div>
        </header>

        {/* Stats Bar */}
        {!loading && (
          <div className="bg-card/60 backdrop-blur border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-8">
              <div className="text-center">
                <span className="text-xl font-extrabold text-primary">{modulesData.length}</span>
                <p className="text-xs text-muted-foreground">مقياس</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <span className="text-xl font-extrabold text-primary">{activeModules}</span>
                <p className="text-xs text-muted-foreground">مقياس نشط</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <span className="text-xl font-extrabold text-primary">{totalFiles}</span>
                <p className="text-xs text-muted-foreground">ملف متاح</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-10 w-full">

          {/* Header + Search */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">المقاييس الدراسية</h2>
              <p className="text-muted-foreground mt-1 text-sm">اختر المقياس للوصول إلى الملفات والدروس</p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن مقياس..."
                className="w-full bg-card border border-border rounded-xl pr-9 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                dir="rtl"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ModuleCardSkeleton key={i} />)
              : filteredModules.length === 0
              ? (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <Search size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">لا توجد نتائج لـ "{search}"</p>
                </div>
              )
              : filteredModules.map((module) => {
                const count = fileCounts[module.id] || 0;
                const hasFiles = count > 0;
                return (
                  <Link
                    key={module.id}
                    to={`/module/${module.id}`}
                    className="group bg-card backdrop-blur-md rounded-xl p-4 shadow-sm border border-border hover:shadow-2xl hover:border-primary/40 transition-all duration-500 ease-out hover:-translate-y-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />

                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3 transition-all duration-500 shadow-inner group-hover:text-white ${module.color}`}>
                        {iconMap[module.icon]}
                      </div>
                      <div className="text-muted-foreground group-hover:text-primary transition-colors duration-500 mr-auto mt-1">
                        <ChevronLeft size={20} strokeWidth={2.5} />
                      </div>
                    </div>

                    <h2 className="text-lg font-bold text-card-foreground mb-3 leading-snug group-hover:text-primary transition-colors duration-300">
                      {module.title}
                    </h2>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground font-semibold">
                          {hasFiles ? `${count} ملفات متاحة` : 'لا توجد ملفات بعد'}
                        </span>
                        {hasFiles && (
                          <span className="text-xs font-bold text-primary">{count}</span>
                        )}
                      </div>
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                          style={{ width: hasFiles ? `${Math.min((count / 10) * 100, 100)}%` : '0%' }}
                        />
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
