import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Constants from 'expo-constants';
import { router } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import { SettingsGroup, SettingsRow } from '@/components/settings-list';
import { useAuth } from '@/context/auth-context';
import { useHistory } from '@/context/history-context';
import { useRoutines } from '@/context/routine-context';
import { useExerciseCatalog } from '@/context/exercise-catalog-context';
import { useSettings } from '@/context/settings-context';
import { useAppTheme } from '@/hooks/use-app-theme';

function appearanceLabel(mode: string) {
    if (mode === 'dark') {
        return 'Dark';
    }

    if (mode === 'light') {
        return 'Light';
    }

    return 'System';
}

export default function SettingsScreen() {
    const { colors } = useAppTheme();
    const {
        appearance,
        resetTips,
        weightUnit,
        setWeightUnit,
        defaultRestTime,
        setDefaultRestTime,
        musicService,
        setMusicService,
        gymPlaylistUrl,
        setGymPlaylistUrl,
        setAppearance,
    } = useSettings();
    const { routines, replaceRoutines } = useRoutines();
    const {
        customExercises,
        replaceCustomExercises,
    } = useExerciseCatalog();
    const {
        user,
        biometricLabel,
        faceIdEnabled,
        lock,
        removeAccount,
    } = useAuth();
    const { workouts, clearHistory, replaceWorkouts } = useHistory();

    const version =
        Constants.expoConfig?.version ?? '1.0.0';

    function confirmSignOut() {
        Alert.alert(
            'Sign Out?',
            'You will need Face ID or your password to open the app again.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', onPress: lock },
            ]
        );
    }

    function confirmRemoveAccount() {
        Alert.alert(
            'Remove Account?',
            'This deletes the login on this phone. Your workout history stays unless you clear it separately.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove Account',
                    style: 'destructive',
                    onPress: () => {
                        removeAccount();
                    },
                },
            ]
        );
    }

    async function exportBackup() {
        try {
            const payload = {
                version: 1,
                exportedAt: new Date().toISOString(),
                workouts,
                routines,
                customExercises,
                settings: {
                    weightUnit,
                    defaultRestTime,
                    musicService,
                    gymPlaylistUrl,
                    appearance,
                },
            };

            const file = new File(
                Paths.cache,
                `workout-backup-${Date.now()}.json`
            );
            file.create({ overwrite: true });
            file.write(JSON.stringify(payload, null, 2));

            const canShare = await Sharing.isAvailableAsync();

            if (!canShare) {
                Alert.alert(
                    'Backup created',
                    'Sharing is not available on this device.'
                );
                return;
            }

            await Sharing.shareAsync(file.uri, {
                mimeType: 'application/json',
                dialogTitle: 'Export workout backup',
            });
        } catch (error) {
            Alert.alert(
                'Could not export',
                error instanceof Error ? error.message : 'Try again.'
            );
        }
    }

    async function importBackup() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const file = new File(result.assets[0].uri);
            const parsed = JSON.parse(await file.text());

            if (!parsed || typeof parsed !== 'object') {
                throw new Error('That file is not a valid backup.');
            }

            Alert.alert(
                'Restore backup?',
                'This replaces workouts, routines, and custom exercises on this phone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Restore',
                        style: 'destructive',
                        onPress: () => {
                            if (Array.isArray(parsed.workouts)) {
                                replaceWorkouts(parsed.workouts);
                            }

                            if (Array.isArray(parsed.routines)) {
                                replaceRoutines(parsed.routines);
                            }

                            if (Array.isArray(parsed.customExercises)) {
                                replaceCustomExercises(
                                    parsed.customExercises
                                );
                            }

                            const imported = parsed.settings ?? {};

                            if (
                                imported.weightUnit === 'lb' ||
                                imported.weightUnit === 'kg'
                            ) {
                                setWeightUnit(imported.weightUnit);
                            }

                            if (typeof imported.defaultRestTime === 'number') {
                                setDefaultRestTime(imported.defaultRestTime);
                            }

                            if (
                                imported.musicService === 'spotify' ||
                                imported.musicService === 'apple'
                            ) {
                                setMusicService(imported.musicService);
                            }

                            if (typeof imported.gymPlaylistUrl === 'string') {
                                setGymPlaylistUrl(imported.gymPlaylistUrl);
                            }

                            if (
                                imported.appearance === 'light' ||
                                imported.appearance === 'dark' ||
                                imported.appearance === 'system'
                            ) {
                                setAppearance(imported.appearance);
                            }

                            Alert.alert(
                                'Backup restored',
                                'Your data is back on this phone.'
                            );
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert(
                'Could not import',
                error instanceof Error ? error.message : 'Try again.'
            );
        }
    }

    function confirmClearHistory() {
        if (workouts.length === 0) {
            Alert.alert(
                'No Workout History',
                'You do not have any workouts to delete.'
            );
            return;
        }

        Alert.alert(
            'Clear Workout History?',
            'This will permanently delete all of your saved workouts. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear History',
                    style: 'destructive',
                    onPress: () => {
                        clearHistory();
                    },
                },
            ]
        );
    }

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text
                style={[
                    styles.section,
                    { color: colors.textMuted },
                ]}
            >
                ACCOUNT
            </Text>

            <SettingsGroup colors={colors}>
                <SettingsRow
                    colors={colors}
                    icon="person"
                    iconColor="#636366"
                    label="Edit Profile"
                    value={user?.name}
                    onPress={() =>
                        router.push('/settings/account')
                    }
                />
                <SettingsRow
                    colors={colors}
                    icon="lock-closed"
                    iconColor="#007AFF"
                    label="Security"
                    value={
                        faceIdEnabled ? biometricLabel : 'Password'
                    }
                    last
                    onPress={() =>
                        router.push('/settings/security')
                    }
                />
            </SettingsGroup>

            <Text
                style={[
                    styles.section,
                    { color: colors.textMuted },
                ]}
            >
                APP
            </Text>

            <SettingsGroup colors={colors}>
                <SettingsRow
                    colors={colors}
                    icon="moon"
                    iconColor="#5856D6"
                    label="Appearance"
                    value={appearanceLabel(appearance)}
                    onPress={() =>
                        router.push('/settings/appearance')
                    }
                />
                <SettingsRow
                    colors={colors}
                    icon="barbell"
                    iconColor="#FF9500"
                    label="Training"
                    onPress={() =>
                        router.push('/settings/training')
                    }
                />
                <SettingsRow
                    colors={colors}
                    icon="bulb"
                    iconColor="#32D74B"
                    label="Show Tips Again"
                    last
                    onPress={() => {
                        resetTips();
                        Alert.alert(
                            'Tips reset',
                            'A short tip will show the next time you open each screen.'
                        );
                    }}
                />
            </SettingsGroup>

            <Text
                style={[
                    styles.section,
                    { color: colors.textMuted },
                ]}
            >
                DATA
            </Text>

            <SettingsGroup colors={colors}>
                <SettingsRow
                    colors={colors}
                    icon="download"
                    iconColor="#30D158"
                    label="Export Backup"
                    onPress={exportBackup}
                />
                <SettingsRow
                    colors={colors}
                    icon="cloud-upload"
                    iconColor="#0A84FF"
                    label="Restore Backup"
                    onPress={importBackup}
                />
                <SettingsRow
                    colors={colors}
                    icon="trash"
                    iconColor="#FF3B30"
                    label="Clear Workout History"
                    last
                    destructive
                    onPress={confirmClearHistory}
                />
            </SettingsGroup>

            <SettingsGroup colors={colors}>
                <Pressable
                    onPress={confirmSignOut}
                    style={({ pressed }) => [
                        styles.actionRow,
                        pressed && { backgroundColor: colors.fill },
                    ]}
                >
                    <Text
                        style={[
                            styles.actionText,
                            { color: colors.tint },
                        ]}
                    >
                        Sign Out
                    </Text>
                </Pressable>

                <View
                    style={[
                        styles.actionDivider,
                        { backgroundColor: colors.separator },
                    ]}
                />

                <Pressable
                    onPress={confirmRemoveAccount}
                    style={({ pressed }) => [
                        styles.actionRow,
                        pressed && { backgroundColor: colors.fill },
                    ]}
                >
                    <Text
                        style={[
                            styles.actionText,
                            { color: colors.destructive },
                        ]}
                    >
                        Remove Account
                    </Text>
                </Pressable>
            </SettingsGroup>

            <Text
                style={[
                    styles.footer,
                    { color: colors.textFaint },
                ]}
            >
                Workout · {version}
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        paddingHorizontal: 16,
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

    actionRow: {
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },

    actionText: {
        fontSize: 17,
        fontWeight: '600',
    },

    actionDivider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 16,
    },

    footer: {
        textAlign: 'center',
        fontSize: 13,
        marginTop: 8,
    },
});
