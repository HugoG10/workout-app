import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useHistory } from '@/context/history-context';
import { useSettings } from '@/context/settings-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
    appleHealthAvailability,
    connectAppleHealth,
    syncWorkoutsToAppleHealth,
} from '@/lib/apple-health';

export default function HealthSettingsScreen() {
    const { colors } = useAppTheme();
    const { appleHealthEnabled, setAppleHealthEnabled } = useSettings();
    const { workouts } = useHistory();
    const [busy, setBusy] = useState(false);
    const availability = appleHealthAvailability();
    const canConnect = availability === 'ready';

    async function handleToggle(enabled: boolean) {
        if (!enabled) {
            setAppleHealthEnabled(false);
            return;
        }

        if (availability === 'expo-go') {
            Alert.alert(
                'Needs a development build',
                'Expo Go cannot talk to Apple Health. On this iPhone, run a development build (npx expo run:ios), then turn this on. Finished workouts will show in the Fitness app and on Apple Watch.'
            );
            return;
        }

        if (!canConnect) {
            Alert.alert(
                'Apple Health unavailable',
                'Apple Health and Apple Watch sync only work on iPhone.'
            );
            return;
        }

        setBusy(true);

        try {
            const result = await connectAppleHealth();

            if (result === 'connected') {
                setAppleHealthEnabled(true);
                return;
            }

            if (result === 'denied') {
                Alert.alert(
                    'Health access denied',
                    'Allow Workout to write workouts in Settings → Health → Data Access & Devices.'
                );
                return;
            }

            Alert.alert(
                'Could not connect',
                'Apple Health is not available on this device.'
            );
        } finally {
            setBusy(false);
        }
    }

    async function handleSyncHistory() {
        if (!appleHealthEnabled || !canConnect) {
            return;
        }

        if (workouts.length === 0) {
            Alert.alert(
                'No workouts',
                'Finish a workout first, then send it to Apple Health.'
            );
            return;
        }

        setBusy(true);

        try {
            const saved = await syncWorkoutsToAppleHealth(workouts);

            Alert.alert(
                saved > 0 ? 'Sent to Apple Health' : 'Nothing sent',
                saved > 0
                    ? `${saved} workout${saved === 1 ? '' : 's'} will show in Fitness and on Apple Watch.`
                    : 'Apple Health did not accept the workouts. Check Health permissions and try again.'
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <ScrollView
            style={[styles.screen, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            <Text style={[styles.section, { color: colors.textMuted }]}>
                APPLE HEALTH
            </Text>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={styles.alertRow}>
                    <View style={styles.alertInfo}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Save workouts to Health
                        </Text>
                        <Text
                            style={[
                                styles.description,
                                { color: colors.textSecondary, marginBottom: 0 },
                            ]}
                        >
                            After you finish, the session is written to Apple Health so it appears in Fitness and on Apple Watch.
                        </Text>
                    </View>
                    <Switch
                        value={appleHealthEnabled && canConnect}
                        disabled={busy}
                        onValueChange={handleToggle}
                        trackColor={{
                            false: colors.switchOff,
                            true: colors.success,
                        }}
                    />
                </View>
            </View>

            {availability === 'expo-go' ? (
                <Text style={[styles.note, { color: colors.textSecondary }]}>
                    You are in Expo Go, which cannot use HealthKit. Build a development client on this iPhone to connect Apple Health and your Watch.
                </Text>
            ) : null}

            {availability === 'unavailable' ? (
                <Text style={[styles.note, { color: colors.textSecondary }]}>
                    Apple Health is only available on iPhone.
                </Text>
            ) : null}

            {appleHealthEnabled && canConnect ? (
                <Pressable
                    disabled={busy}
                    onPress={handleSyncHistory}
                    style={({ pressed }) => [
                        styles.syncButton,
                        { backgroundColor: colors.card },
                        pressed && { backgroundColor: colors.fill },
                    ]}
                >
                    <Text style={[styles.syncText, { color: colors.tint }]}>
                        Send workout history
                    </Text>
                </Pressable>
            ) : null}

            <Text style={[styles.note, { color: colors.textMuted }]}>
                This does not log sets on the Watch. Logging on-wrist needs a separate Watch app. Workout saves the finished session so the Watch can show it.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },

    content: {
        padding: 16,
        paddingTop: 12,
        paddingBottom: 48,
    },

    section: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.4,
        marginLeft: 16,
        marginBottom: 8,
    },

    card: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
    },

    title: {
        fontSize: 17,
        fontWeight: '700',
    },

    description: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 4,
        marginBottom: 14,
    },

    alertRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    alertInfo: {
        flex: 1,
    },

    note: {
        fontSize: 13,
        lineHeight: 18,
        marginHorizontal: 4,
        marginBottom: 16,
    },

    syncButton: {
        borderRadius: 14,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    syncText: {
        fontSize: 17,
        fontWeight: '600',
    },
});
