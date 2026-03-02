export type AppLanguage = 'uz' | 'ru' | 'en';

export const translations = {
  ru: {
    common: {
      guest: 'Гость',
      close: 'Закрыть',
      done: 'Готово',
      error: 'Ошибка',
      explore: 'Подробнее',
      openLinkFailed: 'Не удалось открыть ссылку',
      unknownActionUrl: 'Неизвестный actionUrl',
      comingSoon: 'Скоро!',
      sectionSoonPrefix: 'Раздел',
      sectionSoonSuffix: 'скоро будет доступен',
    },
    home: {
      categories: 'Категории',
    },
    navigation: {
      home: 'Главная',
      vouchers: 'Ваучеры',
      wallet: 'Кошелёк',
      profile: 'Профиль',
      unavailableTitle: '🚧 Временно недоступно',
      unavailableDescription:
        'Раздел с ваучерами сейчас на обновлении. Мы уже работаем над улучшением и скоро вернём его в приложение!',
      understood: 'Понятно',
    },
    profile: {
      title: 'Профиль',
      language: 'Язык',
      privacy: 'Политика конфиденциальности',
      logout: 'Выйти из приложения',
      languageTitle: 'Выберите язык',
      languageSubtitle: 'Язык интерфейса обновится сразу',
      languageUz: 'Узбекский',
      languageRu: 'Русский',
      languageEn: 'Английский',
      cancel: 'Отмена',
    },
    login: {
      title: 'Вход',
      subtitle: 'Добро пожаловать 👋 Войдите в аккаунт, чтобы продолжить',
      email: 'Email',
      password: 'Пароль',
      signIn: 'ВОЙТИ',
      telegram: 'Продолжить через Telegram',
      noAccount: 'Нет аккаунта?',
      register: 'Зарегистрироваться',
      forgot: 'Забыли пароль?',
      fillAllTitle: 'Ошибка',
      fillAllMessage: 'Пожалуйста, заполните все поля',
      invalidTitle: 'Ошибка входа',
      invalidMessage: 'Неверный email или пароль',
      needEmailTitle: 'Нужен email',
      needEmailMessage: 'Введите ваш email в поле выше, и мы отправим ссылку для сброса пароля.',
      sentTitle: 'Письмо отправлено',
      sentMessagePrefix: 'Мы отправили письмо для сброса пароля на',
      sentMessageSuffix: 'Проверьте почту.',
      invalidEmail: 'Некорректный email',
      notFound: 'Пользователь с таким email не найден',
      sendFailed: 'Не удалось отправить письмо',
      telegramNotConfiguredTitle: 'Telegram не настроен',
      telegramNotConfiguredMessage: 'Укажите TELEGRAM_AUTH_BASE_URL в src/config/telegramAuth.ts (HTTPS адрес backend).',
      telegramLoginError: 'Ошибка входа через Telegram',
      telegramMissingToken: 'Custom token отсутствует',
      telegramInvalidResponse: 'Некорректный ответ от страницы Telegram',
    },
    wallet: {
      title: 'Мой кошелёк',
      active: 'Активные',
      history: 'История',
      digitalVoucher: 'ЦИФРОВОЙ ВАУЧЕР',
      remaining: 'Остаток',
      currency: 'сум',
      code: 'КОД',
      expires: 'ДЕЙСТВУЕТ ДО',
      redeem: 'Активировать',
      used: 'Использован',
      expired: 'Истёк',
      sent: 'Отправлен',
      updated: 'Обновлено',
      noActive: 'Нет активных ваучеров',
      noHistory: 'История пока пуста',
      noActiveDesc: 'Здесь появятся ваши активные цифровые ваучеры.',
      noHistoryDesc: 'Здесь появятся использованные и истёкшие ваучеры.',
      copiedTitle: 'Скопировано',
      copiedMessage: 'Код ваучера скопирован',
      voucherCode: 'Код ваучера',
      voucherHint: 'Используйте код при оплате. Нажатие не помечает ваучер как использованный.',
      copyCode: 'Скопировать код',
      showQr: 'Показать QR',
      qrSoonTitle: 'Скоро',
      qrSoonMessage: 'QR будет доступен в следующем обновлении',
      signingIn: 'Входим...',
      telegramLogin: 'Вход через Telegram',
      networkError: 'Ошибка сети',
      openTelegramPageError: 'Не удалось открыть Telegram страницу',
    },
  },
  uz: {
    common: {
      guest: 'Mehmon',
      close: 'Yopish',
      done: 'Tayyor',
      error: 'Xatolik',
      explore: 'Batafsil',
      openLinkFailed: 'Havolani ochib bo‘lmadi',
      unknownActionUrl: 'Noma’lum actionUrl',
      comingSoon: 'Tez kunda!',
      sectionSoonPrefix: 'Bo‘lim',
      sectionSoonSuffix: 'tez orada mavjud bo‘ladi',
    },
    home: {
      categories: 'Kategoriyalar',
    },
    navigation: {
      home: 'Bosh sahifa',
      vouchers: 'Vaucherlar',
      wallet: 'Hamyon',
      profile: 'Profil',
      unavailableTitle: '🚧 Vaqtincha mavjud emas',
      unavailableDescription:
        'Vaucherlar bo‘limi hozir yangilanmoqda. Tez orada yana ilovada bo‘ladi!',
      understood: 'Tushunarli',
    },
    profile: {
      title: 'Profil',
      language: 'Til',
      privacy: 'Maxfiylik siyosati',
      logout: 'Ilovadan chiqish',
      languageTitle: 'Tilni tanlang',
      languageSubtitle: 'Interfeys tili darhol yangilanadi',
      languageUz: 'O‘zbekcha',
      languageRu: 'Ruscha',
      languageEn: 'Inglizcha',
      cancel: 'Bekor qilish',
    },
    login: {
      title: 'Kirish',
      subtitle: 'Xush kelibsiz 👋 Davom etish uchun akkauntingizga kiring',
      email: 'Email',
      password: 'Parol',
      signIn: 'KIRISH',
      telegram: 'Telegram orqali davom etish',
      noAccount: 'Akkaunt yo‘qmi?',
      register: 'Ro‘yxatdan o‘tish',
      forgot: 'Parolni unutdingizmi?',
      fillAllTitle: 'Xatolik',
      fillAllMessage: 'Iltimos, barcha maydonlarni to‘ldiring',
      invalidTitle: 'Kirishda xatolik',
      invalidMessage: 'Email yoki parol noto‘g‘ri',
      needEmailTitle: 'Email kerak',
      needEmailMessage: 'Yuqoridagi maydonga emailingizni kiriting, parolni tiklash havolasini yuboramiz.',
      sentTitle: 'Xat yuborildi',
      sentMessagePrefix: 'Parolni tiklash xati quyidagi manzilga yuborildi:',
      sentMessageSuffix: 'Pochtangizni tekshiring.',
      invalidEmail: 'Noto‘g‘ri email',
      notFound: 'Bunday email bilan foydalanuvchi topilmadi',
      sendFailed: 'Xatni yuborib bo‘lmadi',
      telegramNotConfiguredTitle: 'Telegram sozlanmagan',
      telegramNotConfiguredMessage: 'src/config/telegramAuth.ts faylida TELEGRAM_AUTH_BASE_URL ni (HTTPS backend manzili) kiriting.',
      telegramLoginError: 'Telegram orqali kirishda xatolik',
      telegramMissingToken: 'Custom token topilmadi',
      telegramInvalidResponse: 'Telegram sahifasidan noto‘g‘ri javob keldi',
    },
    wallet: {
      title: 'Mening hamyonim',
      active: 'Faol',
      history: 'Tarix',
      digitalVoucher: 'RAQAMLI VAUCHER',
      remaining: 'Qoldiq',
      currency: 'soʻm',
      code: 'KOD',
      expires: 'AMAL QILADI',
      redeem: 'Faollashtirish',
      used: 'Ishlatilgan',
      expired: 'Muddati tugagan',
      sent: 'Yuborilgan',
      updated: 'Yangilandi',
      noActive: 'Faol vaucherlar yo‘q',
      noHistory: 'Tarix hozircha bo‘sh',
      noActiveDesc: 'Faol raqamli vaucherlaringiz shu yerda ko‘rinadi.',
      noHistoryDesc: 'Ishlatilgan yoki muddati tugagan vaucherlar shu yerda bo‘ladi.',
      copiedTitle: 'Nusxalandi',
      copiedMessage: 'Vaucher kodi nusxalandi',
      voucherCode: 'Vaucher kodi',
      voucherHint: 'Koddan to‘lovda foydalaning. Bu tugma vaucher holatini o‘zgartirmaydi.',
      copyCode: 'Koddan nusxa olish',
      showQr: 'QR ko‘rsatish',
      qrSoonTitle: 'Tez kunda',
      qrSoonMessage: 'QR keyingi yangilanishda qo‘shiladi',
      signingIn: 'Kirilmoqda...',
      telegramLogin: 'Telegram orqali kirish',
      networkError: 'Tarmoq xatosi',
      openTelegramPageError: 'Telegram sahifasini ochib bo‘lmadi',
    },
  },
  en: {
    common: {
      guest: 'Guest',
      close: 'Close',
      done: 'Done',
      error: 'Error',
      explore: 'Explore',
      openLinkFailed: 'Unable to open link',
      unknownActionUrl: 'Unknown actionUrl',
      comingSoon: 'Coming soon!',
      sectionSoonPrefix: 'Section',
      sectionSoonSuffix: 'will be available soon',
    },
    home: {
      categories: 'Categories',
    },
    navigation: {
      home: 'Home',
      vouchers: 'Vouchers',
      wallet: 'Wallet',
      profile: 'Profile',
      unavailableTitle: '🚧 Temporarily unavailable',
      unavailableDescription:
        'The vouchers section is currently being updated. We are improving it and it will be back soon!',
      understood: 'Got it',
    },
    profile: {
      title: 'Profile',
      language: 'Language',
      privacy: 'Privacy Policy',
      logout: 'Log out',
      languageTitle: 'Choose language',
      languageSubtitle: 'Interface language updates immediately',
      languageUz: 'Uzbek',
      languageRu: 'Russian',
      languageEn: 'English',
      cancel: 'Cancel',
    },
    login: {
      title: 'Sign in',
      subtitle: 'Welcome back 👋 Sign in to continue',
      email: 'Email',
      password: 'Password',
      signIn: 'SIGN IN',
      telegram: 'Continue with Telegram',
      noAccount: 'No account?',
      register: 'Register',
      forgot: 'Forgot password?',
      fillAllTitle: 'Error',
      fillAllMessage: 'Please fill in all fields',
      invalidTitle: 'Sign-in error',
      invalidMessage: 'Invalid email or password',
      needEmailTitle: 'Email required',
      needEmailMessage: 'Enter your email above and we will send a reset link.',
      sentTitle: 'Email sent',
      sentMessagePrefix: 'We sent a password reset email to',
      sentMessageSuffix: 'Please check your inbox.',
      invalidEmail: 'Invalid email',
      notFound: 'User with this email was not found',
      sendFailed: 'Could not send email',
      telegramNotConfiguredTitle: 'Telegram auth is not configured',
      telegramNotConfiguredMessage: 'Set TELEGRAM_AUTH_BASE_URL in src/config/telegramAuth.ts to your HTTPS backend domain.',
      telegramLoginError: 'Telegram login error',
      telegramMissingToken: 'Custom token is missing',
      telegramInvalidResponse: 'Invalid response from Telegram page',
    },
    wallet: {
      title: 'My Wallet',
      active: 'Active',
      history: 'History',
      digitalVoucher: 'DIGITAL VOUCHER',
      remaining: 'Remaining',
      currency: 'UZS',
      code: 'CODE',
      expires: 'EXPIRES',
      redeem: 'Redeem Now',
      used: 'Used',
      expired: 'Expired',
      sent: 'Sent',
      updated: 'Updated',
      noActive: 'No active vouchers',
      noHistory: 'No history yet',
      noActiveDesc: 'Your active digital vouchers will appear here.',
      noHistoryDesc: 'Completed and expired vouchers will appear here.',
      copiedTitle: 'Copied',
      copiedMessage: 'Voucher code copied',
      voucherCode: 'Voucher Code',
      voucherHint: 'Use this code at checkout. Redeem does not mark it as used.',
      copyCode: 'Copy Code',
      showQr: 'Show QR',
      qrSoonTitle: 'Coming soon',
      qrSoonMessage: 'QR will be available in the next update',
      signingIn: 'Signing in...',
      telegramLogin: 'Telegram Login',
      networkError: 'Network error',
      openTelegramPageError: 'Unable to open Telegram login page',
    },
  },
} as const;

export type TranslationKey =
  | 'common.guest'
  | 'common.close'
  | 'common.done'
  | 'common.error'
  | 'common.explore'
  | 'common.openLinkFailed'
  | 'common.unknownActionUrl'
  | 'common.comingSoon'
  | 'common.sectionSoonPrefix'
  | 'common.sectionSoonSuffix'
  | 'home.categories'
  | 'navigation.home'
  | 'navigation.vouchers'
  | 'navigation.wallet'
  | 'navigation.profile'
  | 'navigation.unavailableTitle'
  | 'navigation.unavailableDescription'
  | 'navigation.understood'
  | 'profile.title'
  | 'profile.language'
  | 'profile.privacy'
  | 'profile.logout'
  | 'profile.languageTitle'
  | 'profile.languageSubtitle'
  | 'profile.languageUz'
  | 'profile.languageRu'
  | 'profile.languageEn'
  | 'profile.cancel'
  | 'login.title'
  | 'login.subtitle'
  | 'login.email'
  | 'login.password'
  | 'login.signIn'
  | 'login.telegram'
  | 'login.noAccount'
  | 'login.register'
  | 'login.forgot'
  | 'login.fillAllTitle'
  | 'login.fillAllMessage'
  | 'login.invalidTitle'
  | 'login.invalidMessage'
  | 'login.needEmailTitle'
  | 'login.needEmailMessage'
  | 'login.sentTitle'
  | 'login.sentMessagePrefix'
  | 'login.sentMessageSuffix'
  | 'login.invalidEmail'
  | 'login.notFound'
  | 'login.sendFailed'
  | 'login.telegramNotConfiguredTitle'
  | 'login.telegramNotConfiguredMessage'
  | 'login.telegramLoginError'
  | 'login.telegramMissingToken'
  | 'login.telegramInvalidResponse'
  | 'wallet.title'
  | 'wallet.active'
  | 'wallet.history'
  | 'wallet.digitalVoucher'
  | 'wallet.remaining'
  | 'wallet.currency'
  | 'wallet.code'
  | 'wallet.expires'
  | 'wallet.redeem'
  | 'wallet.used'
  | 'wallet.expired'
  | 'wallet.sent'
  | 'wallet.updated'
  | 'wallet.noActive'
  | 'wallet.noHistory'
  | 'wallet.noActiveDesc'
  | 'wallet.noHistoryDesc'
  | 'wallet.copiedTitle'
  | 'wallet.copiedMessage'
  | 'wallet.voucherCode'
  | 'wallet.voucherHint'
  | 'wallet.copyCode'
  | 'wallet.showQr'
  | 'wallet.qrSoonTitle'
  | 'wallet.qrSoonMessage'
  | 'wallet.signingIn'
  | 'wallet.telegramLogin'
  | 'wallet.networkError'
  | 'wallet.openTelegramPageError';
