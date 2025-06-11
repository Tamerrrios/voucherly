// context/OrderContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Order = {
  voucher?: any;
  voucherId?: string;
  partnerId?: string;
  partnerName?: string;
  totalPrice?: number;
  imageUrl?: string;    
  audioUrl?: string;     
  comment?: string;
  receiverPhone?: string;
};

interface OrderContextType {
  order: Partial<Order>;
  setOrder: (data: Partial<Order>) => void;
  resetOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [order, setOrderState] = useState<Partial<Order>>({});

  const setOrder = (data: Partial<Order>) => {
    setOrderState((prev) => ({ ...prev, ...data }));
  };

  const resetOrder = () => setOrderState({});

  return (
    <OrderContext.Provider value={{ order, setOrder, resetOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
