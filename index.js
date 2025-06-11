/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.log('🔥 Global error:', error);
    if (isFatal) {
      Alert.alert('Fatal Error', error.message);
    }
  });