import React from 'react';
import AppNavigator from './src/navigation';
import {AuthProvider} from './src/context/AuthContext';
import {OrderProvider} from './src/context/OrderContext';
import { PartnersProvider } from './src/context/PartnersContext';

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
      <PartnersProvider>
        <AppNavigator />
      </PartnersProvider>
      </OrderProvider>
    </AuthProvider>
  );
}
