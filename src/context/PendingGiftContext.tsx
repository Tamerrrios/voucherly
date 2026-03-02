// src/context/PendingGiftContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Linking } from 'react-native';

type PendingGift = { orderId: string | null };

type Ctx = {
  pending: PendingGift;
  setPending: (p: PendingGift) => void;
  clearPending: () => void;
  hasPending: boolean;
};

const PendingGiftContext = createContext<Ctx>({
  pending: { orderId: null },
  setPending: () => {},
  clearPending: () => {},
  hasPending: false,
});

export const usePendingGift = () => useContext(PendingGiftContext);

/** Разбираем orderId из:
 *  - voucherly://gift?orderId=XYZ
 *  - https://voucherly.uz/gift/?orderId=XYZ
 *  - https://<project>.web.app/gift/?orderId=XYZ
 *  - https://.../gift/XYZ
 */
export function parseGiftLink(url?: string | null): string | null {
  if (!url) return null;

  try {
    const u = new URL(url);

    // 1) app-scheme: voucherly://gift?orderId=...
    if (u.protocol === 'voucherly:') {
      // тут hostname === 'gift', pathname === ''
      if (u.hostname.toLowerCase() === 'gift') {
        return u.searchParams.get('orderId');
      }
    }

    // 2) веб-домены
    const host = u.hostname.toLowerCase();
    const isVoucherlyDomain =
      host.endsWith('voucherly.uz') || host.endsWith('.web.app') || host.endsWith('.firebaseapp.com');

    if (isVoucherlyDomain) {
      // поддержим /gift и /gift/
      const path = u.pathname.toLowerCase();
      if (path === '/gift' || path === '/gift/') {
        const q = u.searchParams.get('orderId');
        if (q) return q;
      }

      // поддержим /gift/XYZ
      const parts = path.split('/').filter(Boolean); // ['gift', 'XYZ']
      if (parts[0] === 'gift' && parts[1]) {
        return decodeURIComponent(parts[1]);
      }
    }
  } catch {
    // very old Android may send raw string — fallback
    const m = url.match(/(?:^|[?&#/])orderId=([^&#/]+)/i);
    if (m) return decodeURIComponent(m[1]);

    const m2 = url.match(/\/gift\/([^?#/]+)/i);
    if (m2) return decodeURIComponent(m2[1]);
  }

  return null;
}

export const PendingGiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pending, setPendingState] = useState<PendingGift>({ orderId: null });

  const setPending = useCallback((p: PendingGift) => {
    setPendingState(prev => {
      // не перезаписываем тем же самым, чтобы не дёргать лишние эффекты
      if (prev.orderId === p.orderId) return prev;
      return p;
    });
  }, []);

  const clearPending = useCallback(() => setPendingState({ orderId: null }), []);

  useEffect(() => {
    // 1) Приложение запущено по ссылке
    Linking.getInitialURL().then((url) => {
      const orderId = parseGiftLink(url);
      if (orderId) setPending({ orderId });
    });

    // 2) Ссылки, пока приложение уже открыто
    const sub = Linking.addEventListener('url', ({ url }) => {
      const orderId = parseGiftLink(url);
      if (orderId) setPending({ orderId });
    });

    return () => {
      // RN 0.70+ — у подписки есть .remove()
      (sub as any)?.remove?.();
    };
  }, [setPending]);

  return (
    <PendingGiftContext.Provider
      value={{
        pending,
        setPending,
        clearPending,
        hasPending: !!pending.orderId,
      }}
    >
      {children}
    </PendingGiftContext.Provider>
  );
};