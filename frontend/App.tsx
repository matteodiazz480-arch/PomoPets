import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initAudio } from './src/audio/sounds';
import { GameProvider } from './src/context/GameContext';
import RootNavigator from './src/navigation/RootNavigator';
import LoadScreen from './src/screens/LoadScreen';
import { requestNotificationPermissions } from './src/notifications/notifications';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAudio();
    requestNotificationPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {loading ? (
        <LoadScreen onFinish={() => setLoading(false)} />
      ) : (
        <GameProvider>
          <RootNavigator />
        </GameProvider>
      )}
    </SafeAreaProvider>
  );
}
