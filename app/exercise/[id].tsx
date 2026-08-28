import MuscleModel from '@/components/muscle-model/MuscleModel';
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

import { useExerciseCatalog } from '@/context/exercise-catalog-context';
import { useHistory } from '@/context/history-context';
import { useSettings } from '@/context/settings-context';
import { useWorkout } from '@/context/workout-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import { ScreenTip } from '@/components/screen-tip';
import { prefillFromPrevious } from '@/lib/workout-stats';

export default function ExerciseDetailScreen() {
    const styles = useThemedStyles(createStyles);

    const params = useLocalSearchParams<{
        id: string | string[];
    }>();

    const id = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const { getExercise } = useExerciseCatalog();

    const {
        getExercisePR,
        getExerciseProgress,
        getPreviousExercise,
    } = useHistory();

    const { weightUnit } = useSettings();

    const {
        isWorkoutActive,
        addExercise,
        startEmptyWorkout,
    } = useWorkout();

    const exercise = getExercise(id);

    if (!exercise) {
        return (
            <View style={styles.notFoundContainer}>
                <ScreenBackBar
                    label="Exercises"
                    fallback="/exercises"
                />

                <Text style={styles.notFoundTitle}>
                    Exercise not found
                </Text>

                <Pressable
                    style={styles.backButton}
                    onPress={() =>
                        router.replace('/exercises')
                    }
                >
                    <Text style={styles.backButtonText}>
                        Go Back
                    </Text>
                </Pressable>
            </View>
        );
    }

    const pr = getExercisePR(
        exercise.id,
        weightUnit
    );

    const progress = getExerciseProgress(
        exercise.id,
        weightUnit
    );

    // Keep the chart readable if there are
    // lots of workouts.
    const recentProgress =
        progress.slice(-8);

    function formatWeight(
        weight: number
    ) {
        if (weightUnit === 'kg') {
            return weight.toFixed(1);
        }

        return Math.round(
            weight
        ).toString();
    }

    function formatShortDate(
        date: string
    ) {
        return new Date(
            date
        ).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
        });
    }

    const firstProgress =
        progress[0];

    const latestProgress =
        progress[
        progress.length - 1
        ];

    const progressChange =
        firstProgress &&
            latestProgress
            ? latestProgress.estimatedOneRepMax -
            firstProgress.estimatedOneRepMax
            : 0;

    const chartValues =
        recentProgress.map(
            (point) =>
                point.estimatedOneRepMax
        );

    const chartMin =
        chartValues.length > 0
            ? Math.min(
                ...chartValues
            )
            : 0;

    const chartMax =
        chartValues.length > 0
            ? Math.max(
                ...chartValues
            )
            : 0;

    const chartRange =
        chartMax - chartMin || 1;

    const exerciseId = exercise.id;
    const exerciseName = exercise.name;

    const previous = getPreviousExercise(
        exerciseId
    );
    const prefill = prefillFromPrevious(previous?.sets);

    function handleAddToWorkout() {
        addExercise(exerciseId, prefill);

        Alert.alert(
            'Added to workout',
            `${exerciseName} is in your current session.`,
            [
                {
                    text: 'Stay here',
                    style: 'cancel',
                },
                {
                    text: 'Go to workout',
                    onPress: () =>
                        router.push(
                            '/active-workout'
                        ),
                },
            ]
        );
    }

    function handleStartWorkout() {
        startEmptyWorkout();
        addExercise(exerciseId, prefill);
        router.push('/active-workout');
    }

    return (
        <View style={styles.screen}>
            <ScreenBackBar
                label="Exercises"
                fallback="/exercises"
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
                {exercise.name}
            </Text>

            <Text style={styles.subtitle}>
                {exercise.primaryMuscle}
                {' • '}
                {exercise.equipment}
            </Text>

            <ScreenTip
                id="exercise-detail"
                title="Form and progress"
                body="Start a workout with this, or add it to the session you already have. Scroll for form, mistakes, and muscles."
            />

            <View style={styles.badgeRow}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {exercise.difficulty}
                    </Text>
                </View>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {exercise.category}
                    </Text>
                </View>
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.workoutButton,
                    pressed && styles.workoutButtonPressed,
                ]}
                onPress={
                    isWorkoutActive
                        ? handleAddToWorkout
                        : handleStartWorkout
                }
            >
                <Text style={styles.workoutButtonText}>
                    {isWorkoutActive
                        ? 'Add to Current Workout'
                        : 'Start Workout with This'}
                </Text>
            </Pressable>

            {/* YOUR PROGRESS */}

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    Your Progress
                </Text>

                {pr && (
                    <Text style={styles.sessionsText}>
                        {pr.totalSessions}{' '}
                        {pr.totalSessions === 1
                            ? 'session'
                            : 'sessions'}
                    </Text>
                )}
            </View>

            {pr ? (
                <>
                    <View style={styles.progressGrid}>
                        <View style={styles.progressCard}>
                            <Text style={styles.progressLabel}>
                                HEAVIEST
                            </Text>

                            <Text style={styles.progressValue}>
                                {formatWeight(
                                    pr.heaviestWeight
                                )}
                            </Text>

                            <Text style={styles.progressUnit}>
                                {pr.unit}
                            </Text>
                        </View>

                        <View style={styles.progressCard}>
                            <Text style={styles.progressLabel}>
                                EST. 1RM
                            </Text>

                            <Text style={styles.progressValue}>
                                {formatWeight(
                                    pr.estimatedOneRepMax
                                )}
                            </Text>

                            <Text style={styles.progressUnit}>
                                {pr.unit}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.bestSetCard}>
                        <View>
                            <Text style={styles.bestSetLabel}>
                                BEST 1RM SET
                            </Text>

                            <Text style={styles.bestSetValue}>
                                {formatWeight(
                                    pr.bestWeight
                                )}{' '}
                                {pr.unit}
                                {' × '}
                                {pr.bestReps}
                            </Text>
                        </View>

                        <Text style={styles.trophy}>
                            🏆
                        </Text>
                    </View>

                    {/* STRENGTH PROGRESS */}

                    <Text style={styles.sectionTitle}>
                        Strength Progress
                    </Text>

                    <View style={styles.chartCard}>
                        {progress.length === 1 ? (
                            <View style={styles.singleSession}>
                                <Text style={styles.singleValue}>
                                    {formatWeight(
                                        progress[0]
                                            .estimatedOneRepMax
                                    )}{' '}
                                    {weightUnit}
                                </Text>

                                <Text style={styles.singleLabel}>
                                    Estimated 1RM
                                </Text>

                                <Text style={styles.singleHint}>
                                    Complete another session to start
                                    seeing your strength trend.
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* CHART */}

                                <View style={styles.chart}>
                                    {recentProgress.map(
                                        (point, index) => {
                                            const normalized =
                                                (point.estimatedOneRepMax -
                                                    chartMin) /
                                                chartRange;

                                            const barHeight =
                                                35 +
                                                normalized *
                                                105;

                                            const isLatest =
                                                index ===
                                                recentProgress.length -
                                                1;

                                            return (
                                                <View
                                                    key={`${point.date}-${index}`}
                                                    style={
                                                        styles.chartColumn
                                                    }
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chartValue,

                                                            isLatest &&
                                                            styles.chartValueLatest,
                                                        ]}
                                                    >
                                                        {formatWeight(
                                                            point.estimatedOneRepMax
                                                        )}
                                                    </Text>

                                                    <View
                                                        style={
                                                            styles.chartBarArea
                                                        }
                                                    >
                                                        <View
                                                            style={[
                                                                styles.chartBar,

                                                                {
                                                                    height:
                                                                        barHeight,
                                                                },

                                                                isLatest &&
                                                                styles.chartBarLatest,
                                                            ]}
                                                        />
                                                    </View>

                                                    <Text
                                                        style={
                                                            styles.chartDate
                                                        }
                                                        numberOfLines={1}
                                                    >
                                                        {formatShortDate(
                                                            point.date
                                                        )}
                                                    </Text>
                                                </View>
                                            );
                                        }
                                    )}
                                </View>

                                {/* TREND */}

                                <View style={styles.trendDivider} />

                                <View style={styles.trendRow}>
                                    <View>
                                        <Text style={styles.trendLabel}>
                                            ESTIMATED 1RM CHANGE
                                        </Text>

                                        <Text
                                            style={[
                                                styles.trendValue,

                                                progressChange > 0 &&
                                                styles.trendPositive,

                                                progressChange < 0 &&
                                                styles.trendNegative,
                                            ]}
                                        >
                                            {progressChange > 0
                                                ? '+'
                                                : ''}
                                            {formatWeight(
                                                progressChange
                                            )}{' '}
                                            {weightUnit}
                                        </Text>
                                    </View>

                                    <View style={styles.trendDates}>
                                        <Text style={styles.trendDate}>
                                            {formatShortDate(
                                                firstProgress.date
                                            )}
                                        </Text>

                                        <Text style={styles.trendArrow}>
                                            →
                                        </Text>

                                        <Text style={styles.trendDate}>
                                            {formatShortDate(
                                                latestProgress.date
                                            )}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </>
            ) : (
                <View style={styles.noProgressCard}>
                    <Text style={styles.noProgressTitle}>
                        No workout data yet
                    </Text>

                    <Text style={styles.noProgressText}>
                        Log this exercise in a workout to start
                        tracking your progress.
                    </Text>
                </View>
            )}

            {/* OVERVIEW */}

            <Text style={styles.sectionTitle}>
                Overview
            </Text>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>
                            PRIMARY
                        </Text>

                        <Text style={styles.infoValue}>
                            {exercise.primaryMuscle}
                        </Text>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>
                            EQUIPMENT
                        </Text>

                        <Text style={styles.infoValue}>
                            {exercise.equipment}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.infoLabel}>
                    SECONDARY MUSCLES
                </Text>

                <Text style={styles.infoValue}>
                    {exercise.secondaryMuscles.length > 0
                        ? exercise.secondaryMuscles.join(' • ')
                        : 'None'}
                </Text>
            </View>

            {exercise.instructions.length > 0 && (
                <>
            <Text style={styles.sectionTitle}>
                How to Perform
            </Text>

            <View style={styles.contentCard}>
                {exercise.instructions.map(
                    (instruction, index) => (
                        <View
                            key={index}
                            style={[
                                styles.instructionRow,

                                index ===
                                exercise.instructions.length -
                                1 &&
                                styles.lastRow,
                            ]}
                        >
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>
                                    {index + 1}
                                </Text>
                            </View>

                            <Text style={styles.instructionText}>
                                {instruction}
                            </Text>
                        </View>
                    )
                )}
            </View>
                </>
            )}

            {exercise.commonMistakes.length > 0 && (
                <>
            <Text style={styles.sectionTitle}>
                Common Mistakes
            </Text>

            <View style={styles.contentCard}>
                {exercise.commonMistakes.map(
                    (mistake, index) => (
                        <View
                            key={index}
                            style={[
                                styles.listRow,

                                index ===
                                exercise.commonMistakes.length -
                                1 &&
                                styles.lastRow,
                            ]}
                        >
                            <View style={styles.warningDot}>
                                <Text style={styles.warningText}>
                                    !
                                </Text>
                            </View>

                            <Text style={styles.listText}>
                                {mistake}
                            </Text>
                        </View>
                    )
                )}
            </View>
                </>
            )}

            {exercise.tips.length > 0 && (
                <>
            <Text style={styles.sectionTitle}>
                Tips
            </Text>

            <View style={styles.contentCard}>
                {exercise.tips.map(
                    (tip, index) => (
                        <View
                            key={index}
                            style={[
                                styles.listRow,

                                index ===
                                exercise.tips.length -
                                1 &&
                                styles.lastRow,
                            ]}
                        >
                            <View style={styles.tipDot}>
                                <Text style={styles.tipText}>
                                    ✓
                                </Text>
                            </View>

                            <Text style={styles.listText}>
                                {tip}
                            </Text>
                        </View>
                    )
                )}
            </View>
                </>
            )}

            {/* MUSCLES WORKED */}

            <Text style={styles.sectionTitle}>
                Muscles Worked
            </Text>

            <MuscleModel
                primaryMuscles={
                    exercise.modelPrimaryMuscles ??
                    [exercise.primaryMuscle]
                }
                secondaryMuscles={
                    exercise.modelSecondaryMuscles ??
                    exercise.secondaryMuscles
                }
            />
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

    title: {
        color: c.text,
        fontSize: 36,
        fontWeight: '700',
        letterSpacing: -0.7,
    },

    subtitle: {
        color: c.textSecondary,
        fontSize: 16,
        marginTop: 5,
    },

    badgeRow: {
        flexDirection: 'row',
        gap: 7,
        marginTop: 14,
        marginBottom: 18,
    },

    badge: {
        backgroundColor: c.tintSoft,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 9,
    },

    badgeText: {
        color: c.tint,
        fontSize: 12,
        fontWeight: '700',
    },

    workoutButton: {
        backgroundColor: c.tint,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 28,
    },

    workoutButtonPressed: {
        opacity: 0.8,
    },

    workoutButtonText: {
        color: c.onTint,
        fontSize: 16,
        fontWeight: '700',
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },

    sectionTitle: {
        color: c.text,
        fontSize: 21,
        fontWeight: '700',
        marginBottom: 12,
    },

    sessionsText: {
        color: c.textFaint,
        fontSize: 12,
    },

    // PROGRESS CARDS

    progressGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },

    progressCard: {
        flex: 1,
        backgroundColor: c.card,
        borderRadius: 16,
        padding: 18,
    },

    progressLabel: {
        color: c.textFaint,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.7,
    },

    progressValue: {
        color: c.text,
        fontSize: 29,
        fontWeight: '700',
        marginTop: 6,
    },

    progressUnit: {
        color: c.textSecondary,
        fontSize: 12,
        marginTop: 1,
    },

    bestSetCard: {
        backgroundColor: c.card,
        borderRadius: 16,
        padding: 18,
        marginBottom: 30,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    bestSetLabel: {
        color: c.textFaint,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.7,
    },

    bestSetValue: {
        color: c.text,
        fontSize: 18,
        fontWeight: '700',
        marginTop: 5,
    },

    trophy: {
        fontSize: 27,
    },

    noProgressCard: {
        backgroundColor: c.card,
        padding: 20,
        borderRadius: 16,
        marginBottom: 30,
    },

    noProgressTitle: {
        color: c.text,
        fontSize: 17,
        fontWeight: '700',
    },

    noProgressText: {
        color: c.textSecondary,
        lineHeight: 20,
        marginTop: 5,
    },

    // CHART

    chartCard: {
        backgroundColor: c.card,
        borderRadius: 18,
        padding: 18,
        marginBottom: 30,
    },

    chart: {
        height: 205,

        flexDirection: 'row',
        alignItems: 'flex-end',

        gap: 5,
    },

    chartColumn: {
        flex: 1,
        height: '100%',

        alignItems: 'center',
        justifyContent: 'flex-end',
    },

    chartValue: {
        color: c.textFaint,
        fontSize: 9,
        fontWeight: '600',
        marginBottom: 5,
    },

    chartValueLatest: {
        color: c.tint,
        fontWeight: '800',
    },

    chartBarArea: {
        height: 140,
        width: '100%',

        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    chartBar: {
        width: '55%',
        maxWidth: 24,

        backgroundColor: c.chartBar,

        borderRadius: 7,
    },

    chartBarLatest: {
        backgroundColor: c.tint,
    },

    chartDate: {
        color: c.textFaint,
        fontSize: 8,
        marginTop: 7,
    },

    trendDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: c.separatorSoft,
        marginVertical: 17,
    },

    trendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },

    trendLabel: {
        color: c.textFaint,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.6,
    },

    trendValue: {
        color: c.textSecondary,
        fontSize: 20,
        fontWeight: '700',
        marginTop: 5,
    },

    trendPositive: {
        color: c.success,
    },

    trendNegative: {
        color: c.destructive,
    },

    trendDates: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    trendDate: {
        color: c.textFaint,
        fontSize: 10,
    },

    trendArrow: {
        color: c.textFaint,
        fontSize: 12,
    },

    singleSession: {
        alignItems: 'center',
        paddingVertical: 16,
    },

    singleValue: {
        color: c.text,
        fontSize: 30,
        fontWeight: '700',
    },

    singleLabel: {
        color: c.textSecondary,
        fontSize: 13,
        marginTop: 4,
    },

    singleHint: {
        color: c.textFaint,
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
        marginTop: 14,
        maxWidth: 250,
    },

    // OVERVIEW

    infoCard: {
        backgroundColor: c.card,
        padding: 18,
        borderRadius: 16,
        marginBottom: 30,
    },

    infoRow: {
        flexDirection: 'row',
        gap: 16,
    },

    infoBlock: {
        flex: 1,
    },

    infoLabel: {
        color: c.textFaint,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.7,
        marginBottom: 5,
    },

    infoValue: {
        color: c.text,
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 21,
    },

    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: c.separator,
        marginVertical: 17,
    },

    // CONTENT

    contentCard: {
        backgroundColor: c.card,
        padding: 18,
        borderRadius: 16,
        marginBottom: 30,
    },

    instructionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',

        paddingBottom: 17,
        marginBottom: 17,

        borderBottomWidth:
            StyleSheet.hairlineWidth,

        borderBottomColor: c.separator,
    },

    stepNumber: {
        width: 30,
        height: 30,
        borderRadius: 10,

        backgroundColor: c.tintSoft,

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 13,
    },

    stepNumberText: {
        color: c.tint,
        fontSize: 13,
        fontWeight: '800',
    },

    instructionText: {
        flex: 1,
        color: c.text,
        fontSize: 15,
        lineHeight: 22,
        paddingTop: 3,
    },

    listRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',

        paddingBottom: 15,
        marginBottom: 15,

        borderBottomWidth:
            StyleSheet.hairlineWidth,

        borderBottomColor: c.separator,
    },

    lastRow: {
        borderBottomWidth: 0,
        paddingBottom: 0,
        marginBottom: 0,
    },

    warningDot: {
        width: 25,
        height: 25,
        borderRadius: 8,
        backgroundColor: c.dangerSoft,

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 12,
    },

    warningText: {
        color: c.destructive,
        fontSize: 14,
        fontWeight: '800',
    },

    tipDot: {
        width: 25,
        height: 25,
        borderRadius: 8,
        backgroundColor: c.successSoft,

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 12,
    },

    tipText: {
        color: c.success,
        fontSize: 13,
        fontWeight: '800',
    },

    listText: {
        flex: 1,
        color: c.text,
        fontSize: 15,
        lineHeight: 21,
        paddingTop: 2,
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
        backgroundColor: c.tint,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },

    backButtonText: {
        color: c.onTint,
        fontWeight: '700',
    },
});
}
