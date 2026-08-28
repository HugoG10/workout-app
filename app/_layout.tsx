import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { ReactNode, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { HistoryProvider } from '@/context/history-context';
import { RoutineProvider } from '@/context/routine-context';
import { SettingsProvider } from '@/context/settings-context';
import { WorkoutProvider } from '@/context/workout-context';
import { ExerciseCatalogProvider } from '@/context/exercise-catalog-context';
import { useAppTheme } from '@/hooks/use-app-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { loading, hasAccount, isUnlocked } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <HistoryProvider>
          <RoutineProvider>
            <ExerciseCatalogProvider>
            <WorkoutProvider>
              <ThemedNavigation>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Protected guard={!hasAccount}>
                    <Stack.Screen name="(auth)" />
                  </Stack.Protected>

                  <Stack.Protected
                    guard={hasAccount && !isUnlocked}
                  >
                    <Stack.Screen
                      name="lock"
                      options={{
                        gestureEnabled: false,
                        animation: 'fade',
                      }}
                    />
                  </Stack.Protected>

                  <Stack.Protected guard={isUnlocked}>
                    <Stack.Screen name="(tabs)" />

                    <Stack.Screen name="settings" />

                    <Stack.Screen name="active-workout" />

                    <Stack.Screen
                      name="workout-recap"
                      options={{
                        gestureEnabled: false,
                        animation: 'fade',
                      }}
                    />

                    <Stack.Screen
                      name="create-exercise"
                      options={{
                        presentation: 'modal',
                      }}
                    />

                    <Stack.Screen
                      name="exercise-picker"
                      options={{
                        presentation: 'modal',
                      }}
                    />

                    <Stack.Screen
                      name="exercise/[id]"
                      options={{
                        headerShown: false,
                        gestureEnabled: false,
                      }}
                    />

                    <Stack.Screen
                      name="create-routine"
                      options={{
                        presentation: 'modal',
                      }}
                    />

                    <Stack.Screen name="routine/[id]" />

                    <Stack.Screen
                      name="history/[id]"
                      options={{
                        headerShown: false,
                        gestureEnabled: false,
                      }}
                    />

                    <Stack.Screen
                      name="modal"
                      options={{
                        presentation: 'modal',
                      }}
                    />
                  </Stack.Protected>
                </Stack>
              </ThemedNavigation>
            </WorkoutProvider>
            </ExerciseCatalogProvider>
          </RoutineProvider>
        </HistoryProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

function ThemedNavigation({ children }: { children: ReactNode }) {
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.tint,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.separator,
      notification: colors.destructive,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      {children}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
