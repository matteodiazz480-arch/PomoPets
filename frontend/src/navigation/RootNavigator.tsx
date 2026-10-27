import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import HabitatBackground from '../components/HabitatBackground';
import { useGame } from '../context/GameContext';
import HabitatScreen from '../screens/HabitatScreen';
import PcNotAvailableScreen from '../screens/PcNotAvailableScreen';
import PetCareScreen from '../screens/PetCareScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ShopScreen from '../screens/ShopScreen';
import TournamentScreen from '../screens/TournamentScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: Record<string, { icon: IconName; iconFocused: IconName; label: string }> = {
  Habitat: { icon: 'home-outline', iconFocused: 'home', label: 'Hábitat' },
  Mascota: { icon: 'paw-outline', iconFocused: 'paw', label: 'Mascota' },
  Tienda: { icon: 'bag-outline', iconFocused: 'bag', label: 'Tienda' },
  Torneo: { icon: 'trophy-outline', iconFocused: 'trophy', label: 'Torneo' },
  Progreso: { icon: 'star-outline', iconFocused: 'star', label: 'Progreso' },
};

const SIDEBAR_WIDTH = 248;

function AppTabs({ desktop }: { desktop: boolean }) {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => {
        const state = navigation.getState();
        const focusedRoute = state.routes[state.index]?.name;

        return {
          headerShown: false,
          animation: 'none',
          freezeOnBlur: false,
          sceneStyle: desktop
            ? [styles.desktopScene, route.name !== focusedRoute && styles.hiddenDesktopScene]
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
  }, [focused]);

  return (
    <TouchableOpacity
      key={routeKey}
      style={[
        styles.tabItem,
        desktop && styles.desktopTabItem,
        focused && styles.tabItemFocused,
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
            styles.tabLabel,
            desktop && styles.desktopTabLabel,
            focused && styles.tabLabelFocused,
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
        styles.tabBarWrap,
        desktop && styles.desktopTabBarWrap,
        { paddingBottom: desktop ? 0 : insets.bottom + 10 },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.tabBar, desktop && styles.desktopTabBar]}>
        {desktop && (
          <View style={styles.brand}>
            <Text style={styles.brandTitle}>PomoPets</Text>
            <Text style={styles.brandSubtitle}>Estudia y crece</Text>
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
  const { state } = useGame();

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
    <View style={styles.root}>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  desktopScene: {
    marginLeft: SIDEBAR_WIDTH,
    backgroundColor: 'transparent',
  },
  hiddenDesktopScene: {
    display: 'none',
  },
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  desktopTabBarWrap: {
    top: 0,
    right: undefined,
    width: SIDEBAR_WIDTH,
    alignItems: 'stretch',
    paddingHorizontal: 0,
    paddingTop: 24,
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 580,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#E6D5BF',
    borderBottomWidth: 5,
    borderBottomColor: '#D9C5AB',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 7,
  },
  desktopTabBar: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    maxWidth: undefined,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(255, 253, 249, 0.84)',
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 18,
    borderWidth: 0,
    borderRightWidth: 1,
    borderRightColor: 'rgba(240, 226, 208, 0.8)',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  brand: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 30,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 18,
    gap: 3,
  },
  desktopTabItem: {
    flex: 0,
    minHeight: 64,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderRadius: 16,
    gap: 12,
  },
  tabItemFocused: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 1,
  },
  desktopTabLabel: {
    fontSize: 15,
  },
  tabLabelFocused: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
