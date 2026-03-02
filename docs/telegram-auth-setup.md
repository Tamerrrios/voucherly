# Telegram Auth Setup (Voucherly)

## Что уже сделано

### 1) React Native (клиент)
- Добавлена кнопка `Continue with Telegram` на экране логина.
- Добавлен WebView-модуль для Telegram login flow.
- Реализована обработка сообщений из WebView:
  - `telegram_auth_success` -> вход через Firebase `signInWithCustomToken`.
  - `telegram_auth_error` -> показ ошибки.
- Существующий email/password flow не тронут.

Изменённые файлы:
- `src/screens/Auth/LoginScreen.tsx`
- `src/components/TelegramLoginWebView.tsx`
- `src/config/telegramAuth.ts`

---

### 2) Backend (Node.js + TypeScript + Firebase Admin)
- Реализован endpoint `POST /auth/telegram/verify`.
- Реализована проверка подписи Telegram по официальному алгоритму:
  1. исключение `hash`,
  2. сортировка ключей,
  3. `data_check_string` через `\n`,
  4. `secret_key = sha256(BOT_TOKEN)`,
  5. `hmac_sha256(data_check_string, secret_key)`,
  6. безопасное сравнение hash,
  7. проверка свежести `auth_date`.
- При успехе:
  - создаётся/обновляется Firebase Auth user c uid: `tg_<telegramId>`;
  - пишется профиль в Firestore `users/{uid}.telegram`;
  - возвращается `{ customToken }`.

Изменённые/добавленные файлы:
- `backend/src/routes/telegramAuth.routes.ts`
- `backend/src/services/telegramAuth.service.ts`
- `backend/src/config/firebaseAdmin.ts`
- `backend/src/server.ts`
- `backend/public/telegram-login.html`
- `backend/.env.example`
- `backend/.env`

---

### 3) Telegram Login HTML
- Добавлен Telegram Login Widget.
- После успешной авторизации отправляет payload на backend `/auth/telegram/verify`.
- Получает `{ customToken }` и отправляет в RN через:
  `window.ReactNativeWebView.postMessage(...)`.

Файл:
- `backend/public/telegram-login.html`

---

## Что нужно сделать тебе (обязательно)

### Шаг 1. Перевыпусти токен бота
Токен был показан в чате, значит его нужно считать скомпрометированным.
- В BotFather сделай revoke/новый token.
- Используй только новый токен.

### Шаг 2. Заполни backend env
Открой файл `backend/.env` и укажи:
- `TELEGRAM_BOT_USERNAME=voucherly_auth_bot`
- `TELEGRAM_BOT_TOKEN=<НОВЫЙ_РЕАЛЬНЫЙ_ТОКЕН>`
- Firebase Admin credentials:
  - либо `FIREBASE_SERVICE_ACCOUNT_JSON=...`
  - либо `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`

### Шаг 3. Подними backend
```bash
cd backend
yarn
yarn dev
```
Проверь, что открывается:
- `https://<твой-домен>/telegram-login.html` (prod)
- или временно `http://<lan-ip>:8080/telegram-login.html` (локально)

### Шаг 4. Укажи клиенту реальный backend URL
В `src/config/telegramAuth.ts`:
- `TELEGRAM_AUTH_BASE_URL = 'https://<твой-реальный-домен>'`

Важно: `localhost` удалён. Нужен реальный URL.

### Шаг 5. iOS зависимости (уже частично сделано)
После установки `react-native-webview`:
```bash
cd ios
pod install
cd ..
yarn ios
```

### Шаг 6. Проверка сценария
1. Открой Login.
2. Нажми `Continue with Telegram`.
3. Пройди Telegram widget.
4. Убедись, что вход выполняется и пользователь попадает в приложение.

---

## Типовые ошибки

### NSURLErrorDomain -1004 (Could not connect to server)
Причина: WebView не может открыть страницу backend.
Проверь:
- backend реально запущен,
- URL в `src/config/telegramAuth.ts` корректный,
- для физического телефона не использовать `localhost`,
- HTTPS-домен доступен извне.

### 500 TELEGRAM_BOT_TOKEN missing
В `backend/.env` не задан `TELEGRAM_BOT_TOKEN`.

### 401 Telegram auth verification failed
Обычно неверный `BOT_TOKEN`, просроченный `auth_date`, или некорректная подпись.

---

## Важные замечания по безопасности
- `BOT_TOKEN` только на backend.
- Никогда не хранить token в RN-клиенте.
- Не коммитить `backend/.env` и service account в git.

---

## Что можно сделать следующим шагом
- Подключить реальный `Show QR` в bottom sheet.
- Добавить rate-limit на `POST /auth/telegram/verify`.
- Добавить backend логирование входов (без хранения чувствительных данных).
