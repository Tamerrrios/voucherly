// Поддерживаем оба варианта: voucherly://gift?orderId=XXX И https://voucherly.uz/gift/?orderId=XXX
export function parseGiftOrderId(url?: string | null): string | null {
  if (!url) return null;

  try {
    const u = new URL(url);
    // вариант 1: собственная схема
    if (u.protocol === 'voucherly:' && u.hostname === 'gift') {
      return u.searchParams.get('orderId');
    }
    // вариант 2: веб-ссылка
    if ((u.hostname.endsWith('voucherly.uz') || u.hostname.endsWith('web.app')) && u.pathname.startsWith('/gift')) {
      return u.searchParams.get('orderId');
    }
  } catch {
    // на всякий случай, очень старые Android могут дать «сырой» url — пробуем регекс
    const m = url.match(/(?:orderId=)([^&#]+)/i);
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}