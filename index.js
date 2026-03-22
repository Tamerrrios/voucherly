/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

/**
 * Background message handler — must be registered OUTSIDE of React components,
 * at the very top of the JS entry point.
 *
 * This runs in a headless JS context when the app is in background/quit state
 * and a data-only (silent) push arrives.
 *
 * Do NOT navigate here — Navigator is not mounted.
 * Only do data processing, local state updates, etc.
 */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('[Push] Background message received:', remoteMessage.data?.type);
  // Future: update badge count, cache data locally, etc.
});

AppRegistry.registerComponent(appName, () => App);
