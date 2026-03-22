import React, { useState } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// Провайдеры
import { AuthProvider } from './src/context/AuthContext';
import { OrderProvider } from './src/context/OrderContext';
import { PartnersProvider } from './src/context/PartnersContext';

// Навигация
import { Navigator } from './src/navigation';
import { navigationRef } from './src/navigation';
import { PendingGiftProvider } from './src/context/PendingGiftContext';
import { LocalizationProvider } from './src/context/LocalizationContext';
import SplashScreen from './src/screens/SplashScreen';


export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <GestureHandlerRootView style={styles.container}>
      <LocalizationProvider>
        <AuthProvider>
          <PendingGiftProvider>
            <OrderProvider>
              <PartnersProvider>
                <Navigator />
              </PartnersProvider>
            </OrderProvider>
          </PendingGiftProvider>
        </AuthProvider>
      </LocalizationProvider>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});