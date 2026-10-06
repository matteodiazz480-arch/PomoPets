import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import HabitatBackground from '../components/HabitatBackground';
import { useGame } from '../context/GameContext';
import HabitatScreen from '../screens/HabitatScreen';
import PetCareScreen from '../screens/PetCareScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ShopScreen from '../screens/ShopScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: Record<string, { icon: IconName, iconFocused: IconName; label: string }> = {
  Habitat: { icon: 'home-outline', iconFocused: 'home', label: 'Hábitat' },
  Mascota: { icon: 'paw-outline', iconFocused: 'paw', label: 'Mascota' },
  Tienda: { icon: 'bag-outline', iconFocused: 'bag', label: 'Tienda' },
  Progreso: { icon: 'star-outline', iconFocused: 'star', label: 'Progreso' },
};

const SIDEBAR_WIDTH = 248;

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
          const meta = TABS[route.name];
          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.tabItem,
                desktop && styles.desktopTabItem,
                focused && styles.tabItemFocused,
              ]}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onPress={() => {
                if (!focused) {
                  playSound('tap');
                  navigation.navigate(route.name);
                }
              }}
            >
              <Ionicons
                name={focused ? meta.iconFocused : meta.icon}
                size={desktop ? 24 : 18}
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
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function RootNavigator() {
  const desktop = useWindowDimensions().width >= 900;
  const { state } = useGame();
  return (
    <View style={styles.root}>
      {desktop && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <HabitatBackground theme={state.activeBackground} />
        </View>
      )}
      <NavigationContainer
        theme={
          desktop
            ? { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: 'transparent' } }
            : DefaultTheme
        }
      >
        <Tab.Navigator
          // Suspends re-rendering of tabs you're not looking at (bottom-tabs v7
          // has no unmountOnBlur, this is its replacement). The Pomodoro timer
          // itself lives in GameContext above this navigator, so it's
          // unaffected either way — but each tab's PetAvatar additionally
          // checks useIsFocused() itself to stop its own animation loops when
          // not visible, since freezing alone doesn't halt already-running
          // native animations or timers.
          screenOptions={{
            headerShown: false,
            freezeOnBlur: true,
            sceneStyle: desktop ? { marginLeft: SIDEBAR_WIDTH, backgroundColor: 'transparent' } : undefined,
          }}
          tabBar={(props) => <CustomTabBar {...props} />}
        >
          <Tab.Screen name="Habitat" component={HabitatScreen} />
          <Tab.Screen name="Mascota" component={PetCareScreen} />
          <Tab.Screen name="Tienda" component={ShopScreen} />
          <Tab.Screen name="Progreso" component={ProgressScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
    maxWidth: 440,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 6,
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
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  desktopTabLabel: {
    fontSize: 15,
  },
  tabLabelFocused: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
