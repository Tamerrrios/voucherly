export const TELEGRAM_AUTH_BASE_URL = 'https://YOUR_BACKEND_DOMAIN';

export const TELEGRAM_LOGIN_PAGE_URL = `${TELEGRAM_AUTH_BASE_URL}/telegram-login.html`;

export const isTelegramAuthConfigured = () =>
	TELEGRAM_AUTH_BASE_URL.startsWith('https://') &&
	!TELEGRAM_AUTH_BASE_URL.includes('YOUR_BACKEND_DOMAIN');
