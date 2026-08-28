import { Pressable } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

import { useAppTheme } from '@/hooks/use-app-theme';

export default function SettingsLayout() {
    const { colors } = useAppTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerShadowVisible: false,
                headerBackButtonDisplayMode: 'minimal',
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.tint,
                headerTitleStyle: {
                    color: colors.text,
                    fontWeight: '600',
                },
                contentStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Settings',
                    headerLeft: () => (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Back to Profile"
                            hitSlop={12}
                            onPress={() => router.back()}
                            style={{ marginLeft: -6 }}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={28}
                                color={colors.tint}
                            />
                        </Pressable>
                    ),
                }}
            />

            <Stack.Screen
                name="account"
                options={{ title: 'Edit Profile' }}
            />

            <Stack.Screen
                name="security"
                options={{ title: 'Security' }}
            />

            <Stack.Screen
                name="appearance"
                options={{ title: 'Appearance' }}
            />

            <Stack.Screen
                name="training"
                options={{ title: 'Training' }}
            />
        </Stack>
    );
}
