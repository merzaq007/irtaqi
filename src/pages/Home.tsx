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

export default function Home() {
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});

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
    };
    fetchCounts();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section with Library Image */}
        <header className="relative overflow-hidden min-h-[480px] flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src="/library.png"
              alt="مكتبة جامعية"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-white/90 text-sm font-medium">جامعة ابن خلدون تيارت - السنة أولى ماستر</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 tracking-tight text-white drop-shadow-lg">
              منصة ارتقِي
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto font-medium">
              المنصة الأكاديمية لطلبة السنة أولى ماستر — تخصص تكنولوجيا وهندسة المعلومات، حيث يسهل الوصول إلى الدروس والمقاييس.
            </p>
          </div>
        </header>

        {/* Main Content - Grid of Modules */}
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-12 w-full">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-foreground">المقاييس الدراسية</h2>
            <p className="text-muted-foreground mt-2 text-sm">اختر المقياس للوصول إلى الملفات والدروس</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {modulesData.map((module) => {
              const count = fileCounts[module.id] || 0;
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

                  <h2 className="text-lg font-bold text-card-foreground mb-2 leading-snug group-hover:text-primary transition-colors duration-300">
                    {module.title}
                  </h2>
                  <p className="text-muted-foreground text-xs font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {count === 0 ? 'لا توجد ملفات بعد' : `${count} ملفات متاحة`}
                  </p>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </Layout>
  );
}
