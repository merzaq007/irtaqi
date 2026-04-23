import { Bell, BellOff, X } from 'lucide-react';
import { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationBanner() {
  const { status, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || status === 'subscribed' || status === 'unsupported' || status === 'denied') return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 bg-blue-600 text-white rounded-xl shadow-lg p-4 flex items-center gap-3">
      <Bell className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-bold text-sm">فعّل الإشعارات</p>
        <p className="text-xs opacity-80">احصل على إشعار فور نشر أي درس جديد</p>
      </div>
      <button
        onClick={subscribe}
        className="bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
      >
        تفعيل
      </button>
      <button onClick={() => setDismissed(true)} className="opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
