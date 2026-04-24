import { NavLink } from 'react-router-dom';
import { Moon, Sun, GraduationCap, Facebook } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative" dir="rtl">
      {/* Decorative gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <NavLink to={ROUTE_PATHS.HOME} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-primary/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <img src="/logo.png" alt="شعار جامعة ابن خلدون تيارت" className="w-10 h-10 object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-primary">منصة ارتقِي</span>
                <span className="text-xs font-semibold text-muted-foreground tracking-wide hidden sm:block">تخصص تكنولوجيا وهندسة المعلومات</span>
              </div>
            </NavLink>

            <div className="flex items-center gap-1">
              <NavLink to="/teacher" title="لوحة التحكم">
                <Button variant="ghost" size="icon" className="rounded-full opacity-60 hover:opacity-100 transition-opacity">
                  <GraduationCap className="h-5 w-5 text-foreground" />
                </Button>
              </NavLink>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">{children}</main>

      <footer className="border-t border-border/40 bg-card/40 backdrop-blur-lg relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-md border border-primary/20 transition-all hover:scale-110 hover:-translate-y-1">
                <img src="/logo.png" alt="شعار جامعة ابن خلدون تيارت" className="w-9 h-9 object-contain" />
              </div>
              <span className="text-xl font-bold text-primary">منصة ارتقِي</span>
            </div>
            <p className="text-sm text-muted-foreground">
              منصة ارتقِي - جميع الحقوق محفوظة © 2026
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span>تصميم وتطوير الطالب بوضلعة عبدالرزاق</span>
              <a 
                href="https://www.facebook.com/Abderrazak11.11" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                title="تابعني على فيسبوك"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
