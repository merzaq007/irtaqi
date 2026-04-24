import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface NewFileNotification {
  id: string;
  file_name: string;
  module_id: string;
  upload_date: string;
}

export function useRealtimeNotifications() {
  const [notification, setNotification] = useState<NewFileNotification | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('new-files')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'files' },
        (payload) => {
          const file = payload.new as NewFileNotification;
          setNotification(file);

          // إشعار المتصفح إذا كان مفعلاً
          if (Notification.permission === 'granted') {
            new Notification('📚 منصة ارتقِي - درس جديد!', {
              body: file.file_name,
              icon: '/favicon.svg',
              dir: 'rtl',
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const dismiss = () => setNotification(null);

  return { notification, dismiss };
}
