import { useState, useEffect, useRef } from 'react';
import { Platform, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const webViewRef = useRef<WebView>(null);

  // Set this to your local IP address for development testing on physical devices.
  // E.g., http://192.168.1.100:3000
  // For iOS simulator, http://localhost:3000 works.
  // For Android emulator, http://10.0.2.2:3000 works.
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://openpumta.com/';

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });
  }, []);

  // When the push token is available, inject it into the web view window
  // so the Next.js app can pick it up.
  const injectedJavaScript = `
    window.EXPO_PUSH_TOKEN = '${expoPushToken}';
    window.dispatchEvent(new CustomEvent('expoTokenReady', { detail: '${expoPushToken}' }));
    true;
  `;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <WebView
          ref={webViewRef}
          source={{ uri: webUrl }}
          injectedJavaScript={injectedJavaScript}
          onMessage={(event) => {
            // If the web app wants to talk back to the native shell, it uses:
            // window.ReactNativeWebView.postMessage(...)
            console.log('Message from web app:', event.nativeEvent.data);
          }}
          style={styles.webview}
          allowsBackForwardNavigationGestures
          bounces={false}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Learn more about projectId: https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        // Fallback for local development without EAS configured
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } else {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
      }
      console.log('Expo Push Token:', token);
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Match your web app's background color
  },
  webview: {
    flex: 1,
  },
});
