import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import HabitatBackground from '../components/HabitatBackground';
import HabitatScreen from '../screens/HabitatScreen';
import PcNotAvailableScreen from '../screens/PcNotAvailableScreen';
import PetCareScreen from '../screens/PetCareScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ShopScreen from '../screens/ShopScreen';
import TournamentScreen from '../screens/TournamentScreen';
import { colors, rootNavigatorStyles } from '../style';

const Tab = createBottomTabNavigator();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: Record<string, { icon: IconName; iconFocused: IconName; label: string }> = {
  Habitat: { icon: 'home-outline', iconFocused: 'home', label: 'Hábitat' },
  Mascota: { icon: 'paw-outline', iconFocused: 'paw', label: 'Mascota' },
  Tienda: { icon: 'bag-outline', iconFocused: 'bag', label: 'Tienda' },
  Torneo: { icon: 'trophy-outline', iconFocused: 'trophy', label: 'Torneo' },
  Progreso: { icon: 'star-outline', iconFocused: 'star', label: 'Progreso' },
};

function AppTabs({ desktop }: { desktop: boolean }) {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => {
        const state = navigation.getState();
        const focusedRoute = state.routes[state.index]?.name;

        return {
          headerShown: false,
          animation: 'none',
          lazy: true,
          freezeOnBlur: true,
          sceneStyle: desktop
            ? [rootNavigatorStyles.desktopScene, route.name !== focusedRoute && rootNavigatorStyles.hiddenDesktopScene]
            : { backgroundColor: colors.appBg },
        };
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Habitat" component={HabitatScreen} />
      <Tab.Screen name="Mascota" component={PetCareScreen} />
      <Tab.Screen name="Tienda" component={ShopScreen} />
      <Tab.Screen name="Torneo" component={TournamentScreen} />
      <Tab.Screen name="Progreso" component={ProgressScreen} />
    </Tab.Navigator>
  );
}

function AnimatedTabItem({
  routeKey,
  routeName,
  focused,
  desktop,
  onPress,
}: {
  routeKey: string;
  routeName: string;
  focused: boolean;
  desktop: boolean;
  onPress: () => void;
}) {
  const meta = TABS[routeName];
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.9, duration: 70, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1.08, friction: 4, tension: 220, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [focused, scale]);

  return (
    <TouchableOpacity
      key={routeKey}
      style={[
        rootNavigatorStyles.tabItem,
        desktop && rootNavigatorStyles.desktopTabItem,
        focused && rootNavigatorStyles.tabItemFocused,
      ]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={meta.label}
      onPress={() => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } catch {}
        onPress();
      }}
    >
      <Animated.View style={{ alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
        <Ionicons
          name={focused ? meta.iconFocused : meta.icon}
          size={desktop ? 24 : 21}
          color={focused ? colors.primaryDark : colors.textSecondary}
        />
        <Text
          style={[
            rootNavigatorStyles.tabLabel,
            desktop && rootNavigatorStyles.desktopTabLabel,
            focused && rootNavigatorStyles.tabLabelFocused,
          ]}
          numberOfLines={1}
        >
          {meta.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const desktop = useWindowDimensions().width >= 900;
  return (
    <View
      style={[
        rootNavigatorStyles.tabBarWrap,
        desktop && rootNavigatorStyles.desktopTabBarWrap,
        { paddingBottom: desktop ? 0 : insets.bottom + 10 },
      ]}
      pointerEvents="box-none"
    >
      <View style={[rootNavigatorStyles.tabBar, desktop && rootNavigatorStyles.desktopTabBar]}>
        {desktop && (
          <View style={rootNavigatorStyles.brand}>
            <Text style={rootNavigatorStyles.brandTitle}>PomoPets</Text>
            <Text style={rootNavigatorStyles.brandSubtitle}>Estudia y crece</Text>
          </View>
        )}
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          return (
            <AnimatedTabItem
              key={route.key}
              routeKey={route.key}
              routeName={route.name}
              focused={focused}
              desktop={desktop}
              onPress={() => {
                if (!focused) {
                  playSound('tap');
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function RootNavigator() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop =
    isWeb &&
    (width >= 800 ||
      (typeof navigator !== 'undefined' &&
        !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
        width >= 600));
  const [bypassedPc, setBypassedPc] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem('pomopets:bypass_pc') === 'true';
    }
    return false;
  });
  const desktop = width >= 900;

  const handleBypass = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('pomopets:bypass_pc', 'true');
    }
    setBypassedPc(true);
  };

  if (isDesktop && !bypassedPc) {
    return <PcNotAvailableScreen onBypass={handleBypass} />;
  }

  return (
    <View style={rootNavigatorStyles.root}>
      {desktop && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <HabitatBackground />
        </View>
      )}
      <NavigationContainer
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: desktop ? 'transparent' : colors.appBg,
            card: colors.appBg,
          },
        }}
      >
        <AppTabs desktop={desktop} />
      </NavigationContainer>
    </View>
  );
}
