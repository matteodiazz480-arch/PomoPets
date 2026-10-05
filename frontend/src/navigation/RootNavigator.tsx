import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
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

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBarWrap, { paddingBottom: insets.bottom + 10 }]} pointerEvents="box-none">
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const meta = TABS[route.name];
          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabItem, focused && styles.tabItemFocused]}
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
                size={19}
                color={focused ? colors.primaryDark : colors.textSecondary}
              />
              {focused && <Text style={styles.tabLabel}>{meta.label}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        // Suspends re-rendering of tabs you're not looking at (bottom-tabs v7
        // has no unmountOnBlur, this is its replacement). The Pomodoro timer
        // itself lives in GameContext above this navigator, so it's
        // unaffected either way — but each tab's PetAvatar additionally
        // checks useIsFocused() itself to stop its own animation loops when
        // not visible, since freezing alone doesn't halt already-running
        // native animations or timers.
        screenOptions={{ headerShown: false, freezeOnBlur: true }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Habitat" component={HabitatScreen} />
        <Tab.Screen name="Mascota" component={PetCareScreen} />
        <Tab.Screen name="Tienda" component={ShopScreen} />
        <Tab.Screen name="Progreso" component={ProgressScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    gap: 4,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  tabItemFocused: {
    backgroundColor: colors.cardAlt,
  },
  tabLabel: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
