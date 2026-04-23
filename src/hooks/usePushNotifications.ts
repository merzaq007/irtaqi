import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://bdjhurufqkalicjmokbk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkamh1cnVmcWthbGljam1va2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTg4MzAsImV4cCI6MjA5MTkzNDgzMH0.eL0Np-s9leuOTBBo4OYUteLKwJPngv53TtYDe6Yk538';

export type PushStatus = 'idle' | 'subscribed' | 'denied' | 'unsupported';

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('idle');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }
    if (Notification.permission === 'denied') setStatus('denied');
    else if (Notification.permission === 'granted') setStatus('subscribed');
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setStatus('denied'); return; }

      // حفظ الاشتراك في Supabase
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjZJgGkAmj9Ux3-4pXHDui6XSqzU'
        )
      });

      await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ subscription: JSON.stringify(sub), created_at: new Date().toISOString() })
      });

      setStatus('subscribed');
    } catch (e) {
      console.error('Push subscribe error:', e);
    }
  };

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    await sub?.unsubscribe();
    setStatus('idle');
  };

  return { status, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
