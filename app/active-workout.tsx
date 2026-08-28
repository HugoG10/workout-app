import {
    ActionSheetIOS,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';

import { useHistory } from '@/context/history-context';
import { useSettings } from '@/context/settings-context';
import { useWorkout } from '@/context/workout-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { MusicBar } from '@/components/music-bar';
import { ScreenTip } from '@/components/screen-tip';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import {
    formatClock,
    formatSetLabel,
    setHasData,
} from '@/lib/workout-stats';

export default function ActiveWorkoutScreen() {
    const styles = useThemedStyles(createStyles);
    const { colors } = useAppTheme();

    const insets = useScreenInsets();

    const {
        workoutExercises,
        workoutStartedAt,
        restEndsAt,
        addSet,
        deleteSet,
        duplicateSet,
        toggleWarmup,
        updateWeight,
        updateReps,
        updateDuration,
        updateNotes,
        toggleCompleted,
        removeExercise,
        moveExercise,
        clearWorkout,
        ensureWorkoutStarted,
        setRestEndsAt,
    } = useWorkout();

    const {
        saveWorkout,
        getPreviousExercise,
    } = useHistory();

    const {
        defaultRestTime,
        weightUnit,
        musicBarCollapsed,
        setMusicBarCollapsed,
    } = useSettings();

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        ensureWorkoutStarted();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!restEndsAt || restEndsAt > now) {
            return;
        }

        Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
        );
        setRestEndsAt(null);
    }, [now, restEndsAt]);

    const restTime = restEndsAt
        ? Math.max(0, Math.ceil((restEndsAt - now) / 1000))
        : 0;

    const workoutTime = workoutStartedAt
        ? Math.max(
            0,
            Math.floor(
                (now - workoutStartedAt) / 1000
            )
        )
        : 0;

    function handleSetCompleted(
        exerciseId: string,
        setId: number
    ) {
        const currentSet = workoutExercises
            .find((exercise) => exercise.id === exerciseId)
            ?.sets.find((set) => set.id === setId);

        const completed = toggleCompleted(exerciseId, setId);

        if (completed && currentSet && !currentSet.isWarmup) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setRestEndsAt(Date.now() + defaultRestTime * 1000);
        } else {
            Haptics.selectionAsync();
        }
    }

    function fillFromPrevious(
        exerciseId: string,
        setId: number,
        weight: string,
        reps: string,
        duration: string
    ) {
        updateWeight(exerciseId, setId, weight);
        updateReps(exerciseId, setId, reps);
        updateDuration(exerciseId, setId, duration);
        Haptics.selectionAsync();
    }

    function addRestTime() {
        const current = restEndsAt ?? Date.now();
        setRestEndsAt(current + 15000);
    }

    function subtractRestTime() {
        if (!restEndsAt) {
            return;
        }

        const next = restEndsAt - 15000;
        setRestEndsAt(next <= Date.now() ? null : next);
    }

    function handleCancelWorkout() {
        Alert.alert(
            'Cancel Workout?',
            'Your current workout will be discarded.',
            [
                {
                    text: 'Keep Workout',
                    style: 'cancel',
                },
                {
                    text: 'Cancel Workout',
                    style: 'destructive',

                    onPress: () => {
                        clearWorkout();
                        router.back();
                    },
                },
            ]
        );
    }

    function handleFinishWorkout() {
        const hasIncompleteSets =
            workoutExercises.some((exercise) =>
                exercise.sets.some((set) => {
                    const hasData = setHasData(
                        set,
                        exercise.tracking
                    );

                    return hasData && !set.completed;
                })
            );

        const cleanedExercises = workoutExercises
            .map((exercise) => ({
                ...exercise,
                sets: exercise.sets.filter((set) =>
                    setHasData(set, exercise.tracking)
                ),
            }))
            .filter((exercise) => exercise.sets.length > 0);

        if (cleanedExercises.length === 0) {
            Alert.alert(
                'No Completed Sets',
                'Log at least one set before finishing your workout.'
            );

            return;
        }

        function finishWorkout() {
            saveWorkout(
                cleanedExercises,
                workoutTime,
                weightUnit
            );

            clearWorkout();

            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );

            router.replace('/workout-recap');
        }

        if (hasIncompleteSets) {
            Alert.alert(
                'Incomplete Sets',
                'Some sets have weight or reps entered but are not marked complete. Finish the workout anyway?',
                [
                    {
                        text: 'Keep Working',
                        style: 'cancel',
                    },
                    {
                        text: 'Finish Anyway',
                        onPress: finishWorkout,
                    },
                ]
            );

            return;
        }

        finishWorkout();
    }

    function showSetMenu(
        exerciseId: string,
        setId: number
    ) {
        const currentSet = workoutExercises
            .find((exercise) => exercise.id === exerciseId)
            ?.sets.find((set) => set.id === setId);
        const warmup = currentSet?.isWarmup ?? false;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [
                        'Cancel',
                        'Duplicate Set',
                        warmup
                            ? 'Mark as Working Set'
                            : 'Mark as Warmup',
                        'Delete Set',
                    ],
                    cancelButtonIndex: 0,
                    destructiveButtonIndex: 3,
                },

                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        duplicateSet(exerciseId, setId);
                    }

                    if (buttonIndex === 2) {
                        toggleWarmup(exerciseId, setId);
                    }

                    if (buttonIndex === 3) {
                        deleteSet(exerciseId, setId);
                    }
                }
            );

            return;
        }

        Alert.alert('Set Options', undefined, [
            {
                text: 'Duplicate Set',
                onPress: () => duplicateSet(exerciseId, setId),
            },
            {
                text: warmup
                    ? 'Mark as Working Set'
                    : 'Mark as Warmup',
                onPress: () => toggleWarmup(exerciseId, setId),
            },
            {
                text: 'Delete Set',
                style: 'destructive',
                onPress: () => deleteSet(exerciseId, setId),
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    }

    function showExerciseMenu(
        exerciseId: string
    ) {
        const index = workoutExercises.findIndex(
            (exercise) => exercise.id === exerciseId
        );

        Alert.alert('Exercise Options', undefined, [
            ...(index > 0
                ? [
                      {
                          text: 'Move Up',
                          onPress: () =>
                              moveExercise(exerciseId, 'up'),
                      },
                  ]
                : []),
            ...(index < workoutExercises.length - 1
                ? [
                      {
                          text: 'Move Down',
                          onPress: () =>
                              moveExercise(exerciseId, 'down'),
                      },
                  ]
                : []),
            {
                text: 'Remove Exercise',
                style: 'destructive',
                onPress: () => removeExercise(exerciseId),
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    }

    return (
        <View style={styles.screen}>
            <View
                style={[
                    styles.topBar,
                    { paddingTop: insets.top + 6 },
                ]}
            >
                <Pressable
                    hitSlop={16}
                    style={styles.headerButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.close}>
                        Close
                    </Text>
                </Pressable>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>
                        Workout
                    </Text>

                    <Text style={styles.workoutTimer}>
                        {formatClock(workoutTime)}
                    </Text>
                </View>

                <Pressable
                    hitSlop={16}
                    style={styles.headerButton}
                    onPress={handleFinishWorkout}
                >
                    <Text style={styles.finish}>
                        Finish
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={
                    styles.content
                }
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                automaticallyAdjustKeyboardInsets
            >
                <ScreenTip
                    id="active-workout"
                    title="Log your sets"
                    body="Enter weight and reps, then tap the check. That starts rest. Use the chevron on the music bar to tuck it away."
                />

                {restTime > 0 ? (
                    <View style={styles.restCard}>
                        <View style={styles.restTop}>
                            <View>
                                <Text style={styles.restLabel}>
                                    RESTING
                                </Text>

                                <Text style={styles.restTimer}>
                                    {formatClock(restTime)}
                                </Text>
                            </View>

                            <View style={styles.restControls}>
                                <Pressable
                                    style={styles.restButton}
                                    onPress={subtractRestTime}
                                >
                                    <Text
                                        style={
                                            styles.restButtonText
                                        }
                                    >
                                        −15
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={styles.stopButton}
                                    onPress={() =>
                                        setRestEndsAt(null)
                                    }
                                >
                                    <Text
                                        style={
                                            styles.stopButtonText
                                        }
                                    >
                                        Skip
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={styles.restButton}
                                    onPress={addRestTime}
                                >
                                    <Text
                                        style={
                                            styles.restButtonText
                                        }
                                    >
                                        +15
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                ) : (
                    <Pressable
                        style={styles.restIdle}
                        onPress={() =>
                            setRestEndsAt(
                                Date.now() +
                                    defaultRestTime * 1000
                            )
                        }
                    >
                        <Text style={styles.restIdleLabel}>
                            Rest timer
                        </Text>

                        <Text style={styles.restIdleAction}>
                            Start {formatClock(defaultRestTime)}
                        </Text>
                    </Pressable>
                )}

                {workoutExercises.length === 0 && (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>
                            Start your workout
                        </Text>

                        <Text style={styles.emptyText}>
                            Add an exercise, then log weight and
                            reps. Tap Previous to reuse last time.
                        </Text>
                    </View>
                )}

                {workoutExercises.map(
                    (exercise) => {
                        const previousExercise =
                            getPreviousExercise(
                                exercise.id
                            );
                        const previousWorking =
                            (previousExercise?.sets ?? []).filter(
                                (set) => !set.isWarmup
                            );
                        const duration =
                            exercise.tracking === 'duration';

                        return (
                            <View
                                key={exercise.id}
                                style={
                                    styles.exerciseCard
                                }
                            >
                                <View
                                    style={
                                        styles.exerciseHeader
                                    }
                                >
                                    <View
                                        style={
                                            styles.exerciseInfo
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.exerciseName
                                            }
                                        >
                                            {exercise.name}
                                        </Text>

                                        <Text
                                            style={
                                                styles.muscleText
                                            }
                                        >
                                            {
                                                exercise.primaryMuscle
                                            }

                                            {exercise
                                                .secondaryMuscles
                                                .length > 0 &&
                                                ` • ${exercise.secondaryMuscles.join(
                                                    ' • '
                                                )}`}
                                        </Text>
                                    </View>

                                    <Pressable
                                        style={
                                            styles.exerciseMenu
                                        }
                                        onPress={() =>
                                            showExerciseMenu(
                                                exercise.id
                                            )
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.exerciseMenuText
                                            }
                                        >
                                            •••
                                        </Text>
                                    </Pressable>
                                </View>

                                <TextInput
                                    style={styles.notesInput}
                                    placeholder="Notes"
                                    placeholderTextColor={colors.textFaint}
                                    value={exercise.notes}
                                    onChangeText={(value) =>
                                        updateNotes(
                                            exercise.id,
                                            value
                                        )
                                    }
                                />

                                <View
                                    style={
                                        styles.columnHeader
                                    }
                                >
                                    <Text
                                        style={
                                            styles.setColumn
                                        }
                                    >
                                        SET
                                    </Text>

                                    <Text
                                        style={
                                            styles.previousColumn
                                        }
                                    >
                                        PREVIOUS
                                    </Text>

                                    {duration ? (
                                        <Text
                                            style={
                                                styles.inputColumn
                                            }
                                        >
                                            SEC
                                        </Text>
                                    ) : (
                                        <>
                                            <Text
                                                style={
                                                    styles.inputColumn
                                                }
                                            >
                                                {exercise.tracking ===
                                                'bodyweight'
                                                    ? '+WT'
                                                    : weightUnit ===
                                                        'lb'
                                                      ? 'LB'
                                                      : 'KG'}
                                            </Text>

                                            <Text
                                                style={
                                                    styles.inputColumn
                                                }
                                            >
                                                REPS
                                            </Text>
                                        </>
                                    )}

                                    <View
                                        style={
                                            styles.checkColumn
                                        }
                                    />

                                    <View
                                        style={
                                            styles.menuColumn
                                        }
                                    />
                                </View>

                                {exercise.sets.map(
                                    (set, index) => {
                                        const workingIndex =
                                            exercise.sets
                                                .slice(0, index)
                                                .filter(
                                                    (item) =>
                                                        !item.isWarmup
                                                ).length;

                                        const previousSet =
                                            set.isWarmup
                                                ? undefined
                                                : previousWorking[
                                                      workingIndex
                                                  ];

                                        const previousLabel =
                                            previousSet
                                                ? formatSetLabel(
                                                      previousSet,
                                                      exercise.tracking,
                                                      weightUnit
                                                  )
                                                : '—';

                                        const workingNumber =
                                            exercise.sets
                                                .slice(0, index + 1)
                                                .filter(
                                                    (item) =>
                                                        !item.isWarmup
                                                ).length;

                                        return (
                                            <View
                                                key={set.id}
                                                style={[
                                                    styles.setRow,

                                                    set.completed &&
                                                    styles.completedSetRow,
                                                ]}
                                            >
                                                <View
                                                    style={
                                                        styles.setNumberContainer
                                                    }
                                                >
                                                    <Text
                                                        style={[
                                                            styles.setNumber,
                                                            set.isWarmup &&
                                                                styles.warmupNumber,
                                                        ]}
                                                    >
                                                        {set.isWarmup
                                                            ? 'W'
                                                            : workingNumber}
                                                    </Text>
                                                </View>

                                                <Pressable
                                                    style={
                                                        styles.previousButton
                                                    }
                                                    disabled={
                                                        !previousSet
                                                    }
                                                    onPress={() => {
                                                        if (
                                                            !previousSet
                                                        ) {
                                                            return;
                                                        }

                                                        fillFromPrevious(
                                                            exercise.id,
                                                            set.id,
                                                            previousSet.weight,
                                                            previousSet.reps,
                                                            previousSet.duration ??
                                                                ''
                                                        );
                                                    }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.previousValue,
                                                            previousSet &&
                                                            styles.previousValueTappable,
                                                        ]}
                                                    >
                                                        {previousLabel}
                                                    </Text>
                                                </Pressable>

                                                {duration ? (
                                                    <TextInput
                                                        style={[
                                                            styles.input,
                                                            set.completed &&
                                                                styles.completedInput,
                                                        ]}
                                                        keyboardType="number-pad"
                                                        placeholder="—"
                                                        value={
                                                            set.duration
                                                        }
                                                        selectTextOnFocus
                                                        onChangeText={(
                                                            value
                                                        ) =>
                                                            updateDuration(
                                                                exercise.id,
                                                                set.id,
                                                                value
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <>
                                                        <TextInput
                                                            style={[
                                                                styles.input,
                                                                set.completed &&
                                                                    styles.completedInput,
                                                            ]}
                                                            keyboardType="decimal-pad"
                                                            placeholder="—"
                                                            value={
                                                                set.weight
                                                            }
                                                            selectTextOnFocus
                                                            onChangeText={(
                                                                value
                                                            ) =>
                                                                updateWeight(
                                                                    exercise.id,
                                                                    set.id,
                                                                    value
                                                                )
                                                            }
                                                        />

                                                        <TextInput
                                                            style={[
                                                                styles.input,
                                                                set.completed &&
                                                                    styles.completedInput,
                                                            ]}
                                                            keyboardType="number-pad"
                                                            placeholder="—"
                                                            value={
                                                                set.reps
                                                            }
                                                            selectTextOnFocus
                                                            onChangeText={(
                                                                value
                                                            ) =>
                                                                updateReps(
                                                                    exercise.id,
                                                                    set.id,
                                                                    value
                                                                )
                                                            }
                                                        />
                                                    </>
                                                )}

                                                <Pressable
                                                    style={[
                                                        styles.checkbox,

                                                        set.completed &&
                                                        styles.checkboxCompleted,
                                                    ]}
                                                    onPress={() =>
                                                        handleSetCompleted(
                                                            exercise.id,
                                                            set.id
                                                        )
                                                    }
                                                >
                                                    {set.completed && (
                                                        <Text
                                                            style={
                                                                styles.checkmark
                                                            }
                                                        >
                                                            ✓
                                                        </Text>
                                                    )}
                                                </Pressable>

                                                <Pressable
                                                    style={
                                                        styles.setMenu
                                                    }
                                                    onPress={() =>
                                                        showSetMenu(
                                                            exercise.id,
                                                            set.id
                                                        )
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.setMenuText
                                                        }
                                                    >
                                                        ⋯
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        );
                                    }
                                )}

                                <View style={styles.addSetRow}>
                                    <Pressable
                                        style={
                                            styles.addSetButton
                                        }
                                        onPress={() =>
                                            addSet(exercise.id)
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.addSetText
                                            }
                                        >
                                            + Set
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={
                                            styles.warmupButton
                                        }
                                        onPress={() =>
                                            addSet(
                                                exercise.id,
                                                true
                                            )
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.warmupButtonText
                                            }
                                        >
                                            + Warmup
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        );
                    }
                )}

                <Pressable
                    style={
                        styles.addExerciseButton
                    }
                    onPress={() =>
                        router.push(
                            '/exercise-picker'
                        )
                    }
                >
                    <Text
                        style={
                            styles.addExerciseText
                        }
                    >
                        + Add Exercise
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.discardButton}
                    onPress={handleCancelWorkout}
                >
                    <Text style={styles.discardText}>
                        Discard Workout
                    </Text>
                </Pressable>
            </ScrollView>

            <View
                style={[
                    styles.musicDock,
                    musicBarCollapsed &&
                        styles.musicDockCollapsed,
                    {
                        paddingBottom: Math.max(
                            insets.bottom,
                            10
                        ),
                    },
                ]}
            >
                <MusicBar
                    collapsed={musicBarCollapsed}
                    onToggleCollapse={() =>
                        setMusicBarCollapsed(
                            !musicBarCollapsed
                        )
                    }
                />
            </View>
        </View>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: c.background,
    },

    topBar: {
        paddingHorizontal: 20,
        paddingBottom: 14,

        backgroundColor: c.card,

        borderBottomWidth:
            StyleSheet.hairlineWidth,

        borderBottomColor: c.separator,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    headerCenter: {
        alignItems: 'center',
    },

    headerTitle: {
        color: c.text,
        fontSize: 17,
        fontWeight: '700',
    },

    workoutTimer: {
        color: c.textSecondary,
        fontSize: 13,
        marginTop: 2,
        fontVariant: ['tabular-nums'],
    },

    headerButton: {
        minHeight: 44,
        justifyContent: 'center',
        minWidth: 64,
    },

    close: {
        color: c.tint,
        fontSize: 16,
    },

    finish: {
        color: c.tint,
        fontSize: 16,
        fontWeight: '700',
    },

    container: {
        flex: 1,
    },

    content: {
        padding: 16,
        paddingBottom: 24,
    },

    restCard: {
        backgroundColor: '#1c1c1e',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },

    restTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    restLabel: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
    },

    restTimer: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '700',
        marginTop: 2,
        fontVariant: ['tabular-nums'],
    },

    restControls: {
        flexDirection: 'row',
        gap: 7,
    },

    restButton: {
        minWidth: 50,
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
    },

    restButtonText: {
        color: '#fff',
        fontWeight: '600',
    },

    stopButton: {
        backgroundColor: '#fff0ef',
        paddingVertical: 10,
        paddingHorizontal: 13,
        borderRadius: 10,
    },

    stopButtonText: {
        color: c.destructive,
        fontWeight: '600',
    },

    restIdle: {
        backgroundColor: c.card,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    restIdleLabel: {
        color: c.textSecondary,
        fontSize: 15,
        fontWeight: '600',
    },

    restIdleAction: {
        color: c.tint,
        fontSize: 15,
        fontWeight: '700',
    },

    emptyCard: {
        backgroundColor: c.card,
        borderRadius: 16,
        padding: 28,
        alignItems: 'center',
        marginBottom: 16,
    },

    emptyTitle: {
        color: c.text,
        fontSize: 20,
        fontWeight: '700',
    },

    emptyText: {
        color: c.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },

    exerciseCard: {
        backgroundColor: c.card,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
    },

    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 22,
    },

    exerciseInfo: {
        flex: 1,
        paddingRight: 10,
    },

    exerciseName: {
        color: c.text,
        fontSize: 22,
        fontWeight: '700',
    },

    muscleText: {
        color: c.textMuted,
        fontSize: 13,
        marginTop: 4,
    },

    notesInput: {
        backgroundColor: c.fill,
        color: c.text,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        marginBottom: 14,
    },

    exerciseMenu: {
        width: 38,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },

    exerciseMenuText: {
        color: c.textMuted,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },

    columnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 7,
    },

    setColumn: {
        width: 34,
        color: c.textFaint,
        fontSize: 9,
        fontWeight: '700',
        textAlign: 'center',
    },

    previousColumn: {
        width: 70,
        color: c.textFaint,
        fontSize: 9,
        fontWeight: '700',
        textAlign: 'center',
    },

    inputColumn: {
        flex: 1,
        color: c.textFaint,
        fontSize: 9,
        fontWeight: '700',
        textAlign: 'center',
    },

    checkColumn: {
        width: 38,
    },

    menuColumn: {
        width: 30,
    },

    setRow: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 7,
    },

    completedSetRow: {
        backgroundColor: c.successSoft,
    },

    setNumberContainer: {
        width: 34,
        alignItems: 'center',
    },

    setNumber: {
        fontSize: 15,
        fontWeight: '700',
        color: c.text,
    },

    warmupNumber: {
        color: c.tint,
        fontSize: 13,
        fontWeight: '800',
    },

    previousButton: {
        width: 70,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 42,
    },

    previousValue: {
        color: c.textFaint,
        fontSize: 11,
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
    },

    previousValueTappable: {
        color: c.tint,
        fontWeight: '600',
    },

    input: {
        flex: 1,
        minHeight: 42,

        backgroundColor: c.fill,

        marginHorizontal: 3,
        paddingHorizontal: 4,

        borderRadius: 10,

        color: c.text,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },

    completedInput: {
        backgroundColor: 'transparent',
    },

    checkbox: {
        width: 34,
        height: 34,

        borderRadius: 10,

        borderWidth: 2,
        borderColor: c.separator,

        marginLeft: 3,

        alignItems: 'center',
        justifyContent: 'center',
    },

    checkboxCompleted: {
        backgroundColor: c.success,
        borderColor: c.success,
    },

    checkmark: {
        color: c.onTint,
        fontSize: 16,
        fontWeight: '800',
    },

    setMenu: {
        width: 30,
        height: 40,

        alignItems: 'center',
        justifyContent: 'center',
    },

    setMenuText: {
        color: c.textFaint,
        fontSize: 20,
        marginTop: -5,
    },

    addSetRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 7,
    },

    addSetButton: {
        flex: 1,
        backgroundColor: c.tintSoft,
        borderRadius: 11,
        paddingVertical: 12,
    },

    addSetText: {
        color: c.tint,
        fontWeight: '700',
        textAlign: 'center',
    },

    warmupButton: {
        flex: 1,
        backgroundColor: c.fill,
        borderRadius: 11,
        paddingVertical: 12,
    },

    warmupButtonText: {
        color: c.textSecondary,
        fontWeight: '700',
        textAlign: 'center',
    },

    addExerciseButton: {
        backgroundColor: c.tint,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 2,
    },

    addExerciseText: {
        color: c.onTint,
        fontSize: 17,
        fontWeight: '700',
    },

    discardButton: {
        alignItems: 'center',
        paddingVertical: 18,
    },

    discardText: {
        color: c.destructive,
        fontSize: 15,
        fontWeight: '600',
    },

    musicDock: {
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: c.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: c.separator,
    },

    musicDockCollapsed: {
        paddingTop: 6,
    },
});
}

