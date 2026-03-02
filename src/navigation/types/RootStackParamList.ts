import { Routes } from ".";

/**
 * Все экраны стека с параметрами (или без)
 * undefined = экран не принимает параметры
 */
export type RootStackParamList = {
  /** ---------- AUTH ---------- */
  [Routes.Login]: { returnTo?: keyof RootStackParamList } | undefined;
  [Routes.Register]: undefined;
  [Routes.AuthRedirect]: undefined;

  /** ---------- TABS ---------- */
  [Routes.Main]: undefined; // 👈 добавили
  [Routes.Home]: undefined;
  [Routes.Wallet]: undefined;
  [Routes.Vouchers]: {
    categoryId: string;
    categoryName: string;
  };
  [Routes.Profile]: undefined;

  /** ---------- VOUCHER FLOW ---------- */
  [Routes.Supplier]: { partnerId: string };
  [Routes.Contact]: undefined;
  [Routes.MediaScreen]: undefined;
  [Routes.MediaPreview]: { mediaData?: any };
  [Routes.Checkout]: undefined;
  [Routes.Success]: { orderId: string };



  /** ---------- ORDERS ---------- */
  [Routes.MyOrders]: undefined;
  [Routes.MyVouchers]: undefined;
  [Routes.OrderDetails]: { orderId: string };

  /** ---------- SETTINGS & MISC ---------- */
  [Routes.Settings]: undefined;
  [Routes.Language]: undefined;
  [Routes.PrivacyPolicy]: undefined;
  [Routes.AboutApp]: undefined;


  [Routes.Onboarding]: undefined;

  [Routes.GiftClaim]: undefined;
  [Routes.CategoryScreen]: undefined;
  [Routes.NotificationsScreen]: undefined;
};