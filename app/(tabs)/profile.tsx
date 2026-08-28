import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { useHistory } from '@/context/history-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProfilePhotoPicker } from '@/hooks/use-profile-photo-picker';
import { ScreenTip } from '@/components/screen-tip';
import { ProfileAvatar } from '@/components/profile-avatar';

function initialsFor(
    firstName: string,
    lastName: string
) {
    const first = firstName.trim()[0];
    const last = lastName.trim()[0];

    if (first && last) {
        return `${first}${last}`.toUpperCase();
    }

    if (first) {
        return firstName.trim().slice(0, 2).toUpperCase();
    }

    return 'W';
}

export default function ProfileScreen() {
    const insets = useScreenInsets();
    const { colors } = useAppTheme();
    const { user } = useAuth();
    const { workouts } = useHistory();
    const { showPhotoOptions } = useProfilePhotoPicker();

    const name = user?.name || 'Athlete';
    const initials = initialsFor(
        user?.firstName ?? '',
        user?.lastName ?? ''
    );

    const totalExercises = workouts.reduce(
        (total, workout) => total + workout.exercises.length,
        0
    );

    const totalSets = workouts.reduce(
        (workoutTotal, workout) =>
            workoutTotal +
            workout.exercises.reduce(
                (exerciseTotal, exercise) =>
                    exerciseTotal + exercise.sets.length,
                0
            ),
        0
    );

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + 4 },
            ]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Profile
                </Text>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Settings"
                    hitSlop={10}
                    onPress={() => router.push('/settings')}
                    style={({ pressed }) => [
                        styles.gear,
                        { backgroundColor: colors.fill },
                        pressed && styles.pressed,
                    ]}
                >
                    <Ionicons
                        name="settings-outline"
                        size={22}
                        color={colors.text}
                    />
                </Pressable>
            </View>

            <ScreenTip
                id="profile"
                title="Your account"
                body="Stats live here. Tap the gear for appearance, Face ID, and training settings."
            />

            <View style={styles.identity}>
                <ProfileAvatar
                    uri={user?.photoUri}
                    initials={initials}
                    colors={colors}
                    editable
                    onPress={showPhotoOptions}
                />

                <Text style={[styles.name, { color: colors.text }]}>
                    {name}
                </Text>

                <Text
                    style={[
                        styles.email,
                        { color: colors.textSecondary },
                    ]}
                >
                    {user?.email ?? ''}
                </Text>
            </View>

            <View style={styles.statsRow}>
                <View
                    style={[
                        styles.statCard,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <Text
                        style={[styles.statValue, { color: colors.text }]}
                    >
                        {workouts.length}
                    </Text>
                    <Text
                        style={[
                            styles.statLabel,
                            { color: colors.textFaint },
                        ]}
                    >
                        WORKOUTS
                    </Text>
                </View>

                <View
                    style={[
                        styles.statCard,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <Text
                        style={[styles.statValue, { color: colors.text }]}
                    >
                        {totalExercises}
                    </Text>
                    <Text
                        style={[
                            styles.statLabel,
                            { color: colors.textFaint },
                        ]}
                    >
                        EXERCISES
                    </Text>
                </View>

                <View
                    style={[
                        styles.statCard,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <Text
                        style={[styles.statValue, { color: colors.text }]}
                    >
                        {totalSets}
                    </Text>
                    <Text
                        style={[
                            styles.statLabel,
                            { color: colors.textFaint },
                        ]}
                    >
                        SETS
                    </Text>
                </View>
            </View>

            <Pressable
                onPress={() => router.push('/settings/account')}
                style={({ pressed }) => [
                    styles.editButton,
                    { backgroundColor: colors.fill },
                    pressed && styles.pressed,
                ]}
            >
                <Text
                    style={[styles.editText, { color: colors.text }]}
                >
                    Edit Profile
                </Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        padding: 20,
        paddingBottom: 60,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
    },

    title: {
        fontSize: 36,
        fontWeight: '700',
        letterSpacing: -0.5,
    },

    gear: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    identity: {
        alignItems: 'center',
        marginBottom: 28,
        gap: 14,
    },

    name: {
        fontSize: 24,
        fontWeight: '700',
    },

    email: {
        fontSize: 15,
        marginTop: 4,
    },

    statsRow: {
        flexDirection: 'row',
        gap: 9,
        marginBottom: 16,
    },

    statCard: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 12,
        alignItems: 'center',
    },

    statValue: {
        fontSize: 25,
        fontWeight: '700',
        letterSpacing: -0.3,
    },

    statLabel: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.6,
        marginTop: 5,
    },

    editButton: {
        borderRadius: 12,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    editText: {
        fontSize: 15,
        fontWeight: '700',
    },

    pressed: {
        opacity: 0.7,
    },
});
