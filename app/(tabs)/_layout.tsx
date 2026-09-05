import { StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { useWorkout } from '@/context/workout-context';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function TabLayout() {
    const { isWorkoutActive } = useWorkout();
    const { colors } = useAppTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.tint,
                tabBarInactiveTintColor: colors.textFaint,
                tabBarButton: HapticTab,
                tabBarLabelStyle: styles.label,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopColor: colors.separatorSoft,
                    borderTopWidth: StyleSheet.hairlineWidth,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Workout',
                    tabBarBadge: isWorkoutActive ? '' : undefined,
                    tabBarBadgeStyle: {
                        minWidth: 8,
                        minHeight: 8,
                        maxHeight: 8,
                        borderRadius: 4,
                        marginTop: 4,
                        backgroundColor: colors.success,
                    },
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'barbell' : 'barbell-outline'}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="exercises"
                options={{
                    title: 'Exercises',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'book' : 'book-outline'}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'calendar' : 'calendar-outline'}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'You',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="music"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 11,
        fontWeight: '600',
    },
});
