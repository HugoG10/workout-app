import { ScreenBackBar } from '@/components/screen-back-bar';

import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    router,
    useLocalSearchParams,
} from 'expo-router';

import { useHistory } from '@/context/history-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import {
    formatSetLabel,
    fromPounds,
    workingSetCount,
    workoutVolumeLb,
} from '@/lib/workout-stats';

export default function WorkoutDetailScreen() {
    const styles = useThemedStyles(createStyles);

    const { id } = useLocalSearchParams<{
        id: string;
    }>();

    const {
        workouts,
        deleteWorkout,
    } = useHistory();

    const workout = workouts.find(
        (item) =>
            item.id.toString() === id
    );

    if (!workout) {
        return (
            <View style={styles.notFoundContainer}>
                <ScreenBackBar
                    label="History"
                    fallback="/history"
                />

                <Text style={styles.notFoundTitle}>
                    Workout not found
                </Text>

                <Pressable
                    style={styles.backButton}
                    onPress={() =>
                        router.replace('/history')
                    }
                >
                    <Text style={styles.backButtonText}>
                        Go Back
                    </Text>
                </Pressable>
            </View>
        );
    }

    const workoutId = workout.id;

    const unit =
        workout.weightUnit ?? 'lb';

    const totalSets = workingSetCount(workout.exercises);

    const totalVolume = fromPounds(
        workoutVolumeLb(workout.exercises, unit),
        unit
    );

    function formatDuration(
        seconds: number
    ) {
        const hours =
            Math.floor(seconds / 3600);

        const minutes =
            Math.floor(
                (seconds % 3600) / 60
            );

        const remainingSeconds =
            seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        if (minutes > 0) {
            return `${minutes} min`;
        }

        return `${remainingSeconds}s`;
    }

    function formatDate(
        date: string
    ) {
        return new Date(
            date
        ).toLocaleDateString([], {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }

    function formatTime(
        date: string
    ) {
        return new Date(
            date
        ).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
        });
    }

    function confirmDelete() {
        Alert.alert(
            'Delete Workout?',
            'This workout will be permanently removed from your history.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',

                    onPress: () => {
                        deleteWorkout(workoutId);

                        router.back();
                    },
                },
            ]
        );
    }

    return (
        <View style={styles.screen}>
            <ScreenBackBar
                label="History"
                fallback="/history"
            />

            <ScrollView
                style={styles.container}
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={false}
            >

            {/* HEADER */}

            <Text style={styles.title}>
                Workout
            </Text>

            <Text style={styles.date}>
                {formatDate(workout.date)}
                {' • '}
                {formatTime(workout.date)}
            </Text>

            {/* SUMMARY */}

            <Text style={styles.sectionLabel}>
                SUMMARY
            </Text>

            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                        {workout.exercises.length}
                    </Text>

                    <Text style={styles.summaryLabel}>
                        EXERCISES
                    </Text>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                        {totalSets}
                    </Text>

                    <Text style={styles.summaryLabel}>
                        SETS
                    </Text>
                </View>
            </View>

            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text
                        style={[
                            styles.summaryValue,
                            styles.summaryValueSmall,
                        ]}
                    >
                        {formatDuration(
                            workout.durationSeconds
                        )}
                    </Text>

                    <Text style={styles.summaryLabel}>
                        DURATION
                    </Text>
                </View>

                <View style={styles.summaryCard}>
                    <Text
                        style={[
                            styles.summaryValue,
                            styles.summaryValueSmall,
                        ]}
                    >
                        {Math.round(
                            totalVolume
                        ).toLocaleString()}
                    </Text>

                    <Text style={styles.summaryLabel}>
                        {unit.toUpperCase()} VOLUME
                    </Text>
                </View>
            </View>

            {/* EXERCISES */}

            <Text
                style={[
                    styles.sectionLabel,
                    styles.exerciseSectionLabel,
                ]}
            >
                EXERCISES
            </Text>

            {workout.exercises.map(
                (exercise, exerciseIndex) => (
                    <View
                        key={exercise.id}
                        style={styles.exerciseCard}
                    >
                        {/* EXERCISE HEADER */}

                        <View style={styles.exerciseHeader}>
                            <View style={styles.exerciseNumber}>
                                <Text
                                    style={
                                        styles.exerciseNumberText
                                    }
                                >
                                    {exerciseIndex + 1}
                                </Text>
                            </View>

                            <View style={styles.exerciseInfo}>
                                <Text
                                    style={
                                        styles.exerciseName
                                    }
                                >
                                    {exercise.name}
                                </Text>

                                <Text
                                    style={
                                        styles.exerciseMuscle
                                    }
                                >
                                    {exercise.primaryMuscle}

                                    {(exercise
                                        .secondaryMuscles ??
                                        []).length > 0 &&
                                        ` • ${exercise.secondaryMuscles
                                            .slice(0, 2)
                                            .join(' • ')}`}
                                </Text>

                                {exercise.notes?.trim() ? (
                                    <Text
                                        style={styles.notes}
                                    >
                                        {exercise.notes}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        {/* SET TABLE */}

                        <View style={styles.setHeader}>
                            <Text
                                style={
                                    styles.setNumberColumn
                                }
                            >
                                SET
                            </Text>

                            <Text
                                style={
                                    styles.valueColumn
                                }
                            >
                                {exercise.tracking ===
                                'duration'
                                    ? 'TIME'
                                    : unit.toUpperCase()}
                            </Text>

                            <Text
                                style={
                                    styles.valueColumn
                                }
                            >
                                {exercise.tracking ===
                                'duration'
                                    ? ''
                                    : 'REPS'}
                            </Text>

                            <Text
                                style={
                                    styles.volumeColumn
                                }
                            >
                                VOLUME
                            </Text>
                        </View>

                        {exercise.sets.map(
                            (set, index) => {
                                const tracking =
                                    exercise.tracking ??
                                    'weight_reps';
                                const workingIndex =
                                    exercise.sets
                                        .slice(0, index)
                                        .filter(
                                            (item) =>
                                                !item.isWarmup
                                        ).length;
                                const weight =
                                    Number(set.weight) || 0;
                                const reps =
                                    Number(set.reps) || 0;
                                const volume =
                                    set.isWarmup
                                        ? 0
                                        : weight * reps;

                                return (
                                    <View
                                        key={set.id}
                                        style={[
                                            styles.setRow,

                                            set.isWarmup &&
                                            styles.setRowWarmup,

                                            index ===
                                            exercise.sets.length -
                                            1 &&
                                            styles.lastSetRow,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.setNumber,
                                                set.isWarmup &&
                                                styles.setNumberWarmup,
                                            ]}
                                        >
                                            {set.isWarmup
                                                ? 'W'
                                                : workingIndex +
                                                  1}
                                        </Text>

                                        <Text
                                            style={
                                                styles.setValue
                                            }
                                        >
                                            {tracking ===
                                            'duration'
                                                ? formatSetLabel(
                                                      set,
                                                      tracking,
                                                      unit
                                                  )
                                                : (set.weight ??
                                                      '') ||
                                                  '—'}
                                        </Text>

                                        <Text
                                            style={
                                                styles.setValue
                                            }
                                        >
                                            {tracking ===
                                            'duration'
                                                ? ''
                                                : (set.reps ??
                                                      '') ||
                                                  '—'}
                                        </Text>

                                        <Text
                                            style={
                                                styles.volumeValue
                                            }
                                        >
                                            {volume > 0
                                                ? Math.round(
                                                      volume
                                                  ).toLocaleString()
                                                : '—'}
                                        </Text>
                                    </View>
                                );
                            }
                        )}
                    </View>
                )
            )}

            {/* DELETE */}

            <Pressable
                style={({ pressed }) => [
                    styles.deleteButton,

                    pressed &&
                    styles.deleteButtonPressed,
                ]}
                onPress={confirmDelete}
            >
                <Text style={styles.deleteText}>
                    Delete Workout
                </Text>
            </Pressable>
            </ScrollView>
        </View>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: c.background,
    },

    container: {
        flex: 1,
        backgroundColor: c.background,
    },

    content: {
        padding: 20,
        paddingBottom: 60,
    },

    // HEADER

    title: {
        color: c.text,

        fontSize: 36,
        fontWeight: '700',

        letterSpacing: -0.6,
    },

    date: {
        color: c.textSecondary,

        fontSize: 15,

        marginTop: 5,
        marginBottom: 30,
    },

    // SECTION

    sectionLabel: {
        color: c.textMuted,

        fontSize: 11,
        fontWeight: '700',

        letterSpacing: 0.9,

        marginBottom: 10,
    },

    exerciseSectionLabel: {
        marginTop: 20,
    },

    // SUMMARY

    summaryRow: {
        flexDirection: 'row',

        gap: 10,

        marginBottom: 10,
    },

    summaryCard: {
        flex: 1,

        backgroundColor: c.card,

        borderRadius: 16,

        padding: 17,
    },

    summaryValue: {
        color: c.text,

        fontSize: 27,
        fontWeight: '700',

        letterSpacing: -0.4,
    },

    summaryValueSmall: {
        fontSize: 22,
    },

    summaryLabel: {
        color: c.textFaint,

        fontSize: 9,
        fontWeight: '700',

        letterSpacing: 0.7,

        marginTop: 5,
    },

    // EXERCISE

    exerciseCard: {
        backgroundColor: c.card,

        borderRadius: 18,

        padding: 18,

        marginBottom: 14,
    },

    exerciseHeader: {
        flexDirection: 'row',

        alignItems: 'center',

        marginBottom: 20,
    },

    exerciseNumber: {
        width: 34,
        height: 34,

        borderRadius: 10,

        backgroundColor: c.tintSoft,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 12,
    },

    exerciseNumberText: {
        color: c.tint,

        fontSize: 13,
        fontWeight: '800',
    },

    exerciseInfo: {
        flex: 1,
    },

    exerciseName: {
        color: c.text,

        fontSize: 19,
        fontWeight: '700',
    },

    exerciseMuscle: {
        color: c.textMuted,

        fontSize: 12,

        marginTop: 3,
    },

    notes: {
        color: c.textSecondary,
        fontSize: 13,
        marginTop: 8,
        lineHeight: 18,
    },

    // SET TABLE

    setHeader: {
        flexDirection: 'row',

        paddingBottom: 9,

        borderBottomWidth:
            StyleSheet.hairlineWidth,

        borderBottomColor: c.separator,
    },

    setNumberColumn: {
        width: 42,

        color: c.textFaint,

        fontSize: 9,
        fontWeight: '700',

        textAlign: 'center',
    },

    valueColumn: {
        flex: 1,

        color: c.textFaint,

        fontSize: 9,
        fontWeight: '700',

        textAlign: 'center',
    },

    volumeColumn: {
        width: 70,

        color: c.textFaint,

        fontSize: 9,
        fontWeight: '700',

        textAlign: 'right',
    },

    setRow: {
        flexDirection: 'row',

        alignItems: 'center',

        paddingVertical: 12,

        borderBottomWidth:
            StyleSheet.hairlineWidth,

        borderBottomColor: c.separator,
    },

    setRowWarmup: {
        opacity: 0.55,
    },

    lastSetRow: {
        borderBottomWidth: 0,
        paddingBottom: 2,
    },

    setNumber: {
        width: 42,

        color: c.textSecondary,

        fontSize: 14,
        fontWeight: '700',

        textAlign: 'center',
    },

    setNumberWarmup: {
        color: c.textFaint,
    },

    setValue: {
        flex: 1,

        color: c.text,

        fontSize: 15,
        fontWeight: '600',

        textAlign: 'center',

        fontVariant: ['tabular-nums'],
    },

    volumeValue: {
        width: 70,

        color: c.textMuted,

        fontSize: 12,

        textAlign: 'right',

        fontVariant: ['tabular-nums'],
    },

    // DELETE

    deleteButton: {
        backgroundColor: c.card,

        borderRadius: 14,

        paddingVertical: 15,

        alignItems: 'center',

        marginTop: 12,
    },

    deleteButtonPressed: {
        opacity: 0.65,
    },

    deleteText: {
        color: c.destructive,

        fontSize: 15,
        fontWeight: '600',
    },

    // NOT FOUND

    notFoundContainer: {
        flex: 1,

        backgroundColor: c.background,

        justifyContent: 'center',
        alignItems: 'center',

        padding: 24,
    },

    notFoundTitle: {
        color: c.text,

        fontSize: 24,
        fontWeight: '700',

        marginBottom: 20,
    },

    backButton: {
        backgroundColor: '#007AFF',

        paddingHorizontal: 20,
        paddingVertical: 12,

        borderRadius: 12,
    },

    backButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
});
}
