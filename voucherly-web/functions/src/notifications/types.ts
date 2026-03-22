/**
 * All supported push notification types in Voucherly.
 * Add new types here as the product grows.
 */
export type NotificationType =
  | 'order_paid'
  | 'voucher_received'
  | 'voucher_redeemed'
  | 'voucher_reminder';

/**
 * Payload sent to sendPushToUser().
 * `data` values must all be strings — FCM requirement.
 */
export interface PushPayload {
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
}

/**
 * Static copy for each notification type.
 * Can be extended to support multiple languages later.
 */
export const NotificationCopy: Record<
  NotificationType,
  Pick<PushPayload, 'title' | 'body'>
> = {
  order_paid: {
    title: 'Заказ оплачен',
    body: 'Ваш ваучер готов к отправке',
  },
  voucher_received: {
    title: 'Вам подарок!',
    body: 'Кто-то отправил вам подарочный ваучер',
  },
  voucher_redeemed: {
    title: 'Ваучер использован',
    body: 'Получатель использовал ваш ваучер',
  },
  voucher_reminder: {
    title: 'Не забудьте про ваучер',
    body: 'У вас есть неиспользованный подарочный ваучер',
  },
};
