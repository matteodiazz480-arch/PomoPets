import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initAdMob } from './src/ads/admob';
import { initAudio } from './src/audio/sounds';
import { GameProvider } from './src/context/GameContext';
import RootNavigator from './src/navigation/RootNavigator';
import { requestNotificationPermissions } from './src/notifications/notifications';
import LoadScreen from './src/screens/LoadScreen';
import './src/style/typography';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    initAudio();
    initAdMob();
    requestNotificationPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {loading || !fontsLoaded ? (
        <LoadScreen onFinish={() => setLoading(false)} />
      ) : (
        <GameProvider>
          <RootNavigator />
        </GameProvider>
      )}
    </SafeAreaProvider>
  );
}
