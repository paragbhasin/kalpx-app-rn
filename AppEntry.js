// 🚨 MUST BE THE FIRST IMPORT
import messaging from '@react-native-firebase/messaging';

// 📌 Background message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("📥 Background Notification:", remoteMessage);
});

import { registerRootComponent } from 'expo';
import App from './App';

// Register the main component
registerRootComponent(App);
