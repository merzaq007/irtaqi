import { NavLink } from 'react-router-dom';
import { Moon, Sun, GraduationCap } from 'lucide-react';
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
              <div className="flex items-center justify-center w-12 h-12 bg-card backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-border transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <img src="/logo.png" alt="شعار جامعة ابن خلدون تيارت" className="w-10 h-10 object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">منصة ارتقِي</span>
                <span className="text-xs font-semibold text-muted-foreground tracking-wide">تخصص تكنولوجيا وهندسة المعلومات</span>
              </div>
            </NavLink>

            <div className="flex items-center gap-1">
              <NavLink to="/teacher" title="لوحة الأستاذ">
                <Button variant="ghost" size="icon" className="rounded-full opacity-40 hover:opacity-100 transition-opacity">
                  <GraduationCap className="h-5 w-5" />
                </Button>
              </NavLink>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
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
            <div className="flex items-center justify-center w-12 h-12 bg-card backdrop-blur-sm rounded-xl overflow-hidden shadow-md border border-border transition-all hover:scale-110 hover:-translate-y-1">
                <img src="/logo.png" alt="شعار جامعة ابن خلدون تيارت" className="w-9 h-9 object-contain" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">منصة ارتقِي</span>
            </div>
            <p className="text-sm text-muted-foreground">
              منصة ارتقِي - جميع الحقوق محفوظة © 2026
            </p>
            <p className="text-sm font-medium text-foreground">
              تصميم وتطوير الطالب بوضلعة عبدالرزاق
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
