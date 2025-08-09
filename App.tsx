import React from 'react';
import AppNavigator from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';
import { OrderProvider } from './src/context/OrderContext';
import { PartnersProvider } from './src/context/PartnersContext';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
        <AuthProvider>
          <OrderProvider>
            <PartnersProvider>
              <AppNavigator />
            </PartnersProvider>
          </OrderProvider>
        </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
// import React from 'react';
// import AppNavigator from './src/navigation';
// import {AuthProvider} from './src/context/AuthContext';
// import {OrderProvider} from './src/context/OrderContext';
// import { PartnersProvider } from './src/context/PartnersContext';
// import 'react-native-gesture-handler';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';


// export default function App() {
//   return (
//     <AuthProvider>
//       <OrderProvider>
//       <PartnersProvider>
//         <AppNavigator />
//       </PartnersProvider>
//       </OrderProvider>
//     </AuthProvider>
//   );
// }
