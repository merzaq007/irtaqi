import { Bell, X, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';

const MODULE_NAMES: Record<string, string> = {
  'web-apps': 'تطبيقات الويب',
  'digital-document': 'الوثيقة الرقمية',
  'info-engineering': 'هندسة المعلومات',
  'digital-platforms': 'المنصات الرقمية الوثائقية',
  'research-methodology': 'منهجية البحث العلمي',
  'research-data-management': 'إدارة بيانات البحث',
  'governance-e-reputation': 'الحوكمة والسمعة الإلكترونية',
  'programming-ai': 'البرمجة والذكاء الاصطناعي',
  'entrepreneurship': 'المقاولاتية والمؤسسات الناشئة',
  'social-networks': 'شبكات التواصل الاجتماعي',
  'english-language': 'اللغة الإنجليزية',
};

export default function PushNotificationBanner() {
  const { notification, dismiss } = useRealtimeNotifications();
  const [permissionAsked, setPermissionAsked] = useState(
    Notification.permission !== 'default'
  );

  const requestPermission = async () => {
    await Notification.requestPermission();
    setPermissionAsked(true);
  };

  // إشعار درس جديد
  if (notification) {
    return (
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-primary text-primary-foreground rounded-xl shadow-2xl p-4 flex items-start gap-3">
          <div className="bg-white/20 rounded-lg p-2 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">📚 درس جديد!</p>
            <p className="text-xs opacity-90 truncate mt-0.5">{notification.file_name}</p>
            <p className="text-xs opacity-70 mt-0.5">
              {MODULE_NAMES[notification.module_id] || notification.module_id}
            </p>
          </div>
          <button onClick={dismiss} className="opacity-70 hover:opacity-100 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // طلب إذن الإشعارات
  if (!permissionAsked && 'Notification' in window) {
    return (
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50">
        <div className="bg-card border border-border rounded-xl shadow-lg p-4 flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm text-foreground">فعّل الإشعارات</p>
            <p className="text-xs text-muted-foreground">احصل على إشعار فور نشر أي درس جديد</p>
          </div>
          <button
            onClick={requestPermission}
            className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition shrink-0"
          >
            تفعيل
          </button>
          <button onClick={() => setPermissionAsked(true)} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
