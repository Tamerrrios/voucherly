// src/hooks/usePostAuthRedirect.ts
import { useEffect } from 'react';
import { usePendingGift } from '../context/PendingGiftContext';
import { Navigation } from '../navigation/Navigation';
import { Routes } from '../navigation/types';

export const usePostAuthRedirect = (isAuthenticated: boolean) => {
  const { pending, clearPending } = usePendingGift();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (pending.orderId) {
      Navigation.navigate(Routes.GiftClaim, { orderId: pending.orderId });
      clearPending();
    }
  }, [isAuthenticated, pending.orderId, clearPending]);
};