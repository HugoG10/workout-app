import { useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { router } from 'expo-router';

import { useHistory } from '@/context/history-context';
import { useSettings } from '@/context/settings-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import { ScreenTip } from '@/components/screen-tip';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SearchField } from '@/components/ui/search-field';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { monthCells, trainedDayKeys } from '@/lib/recovery';
import {
    dayKey,
    formatDurationLong,
    fromPounds,
    workingSetCount,
    workoutVolumeLb,
} from '@/lib/workout-stats';

export default function HistoryScreen() {
    const styles = useThemedStyles(createStyles);
    const { colors } = useAppTheme();

    const insets = useScreenInsets();
    const { workouts, getWeekStats } = useHistory();
    const { weightUnit } = useSettings();
    const week = getWeekStats(weightUnit);
    const [query, setQuery] = useState('');
    const calendar = monthCells();
    const trained = trainedDayKeys(workouts);
    const today = dayKey(new Date());

    const visibleWorkouts = useMemo(() => {
        const needle = query.trim().toLowerCase();

        if (!needle) {
            return workouts;
        }

        return workouts.filter((workout) => {
            if (workout.name.toLowerCase().includes(needle)) {
                return true;
            }

            return workout.exercises.some((exercise) =>
                exercise.name.toLowerCase().includes(needle)
            );
        });
    }, [query, workouts]);

    function formatDuration(seconds: number) {
        return formatDurationLong(seconds);
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString(
            [],
            {
                month: 'short',
                day: 'numeric',
            }
        );
    }

    function formatTime(date: string) {
        return new Date(date).toLocaleTimeString(
            [],
            {
                hour: 'numeric',
                minute: '2-digit',
            }
        );
    }

    function getTotalSets(
        exercises: typeof workouts[number]['exercises']
    ) {
        return workingSetCount(exercises);
    }

    function getTotalVolume(
        exercises: typeof workouts[number]['exercises'],
        unit: 'lb' | 'kg'
    ) {
        return fromPounds(workoutVolumeLb(exercises, unit), unit);
    }

    function getMonthLabel(date: string) {
        return new Date(date)
            .toLocaleDateString([], {
                month: 'long',
                year: 'numeric',
            })
            .toUpperCase();
    }

    let previousMonth = '';

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + 4 },
            ]}
            showsVerticalScrollIndicator={false}
        >
            <ScreenHeader
                title="History"
                subtitle="Your finished sessions."
            />

            <ScreenTip
                id="history"
                title="Your sessions"
                body="Finished workouts land here. Tap one to see every set you logged."
            />

            {workouts.length > 0 && (
                <>
                    <SearchField
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search workouts or exercises"
                    />

                    <View style={styles.calendarCard}>
                        <Text style={styles.calendarLabel}>
                            {calendar.label.toUpperCase()}
                        </Text>
                        <View style={styles.weekdayRow}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(
                                (day, index) => (
                                    <Text
                                        key={`${day}-${index}`}
                                        style={styles.weekday}
                                    >
                                        {day}
                                    </Text>
                                )
                            )}
                        </View>
                        <View style={styles.calendarGrid}>
                            {calendar.cells.map((day, index) => {
                                if (!day) {
                                    return (
                                        <View
                                            key={`empty-${index}`}
                                            style={styles.calendarCell}
                                        />
                                    );
                                }

                                const key = dayKey(
                                    new Date(
                                        calendar.year,
                                        calendar.month,
                                        day
                                    )
                                );

                                return (
                                    <View
                                        key={key}
                                        style={[
                                            styles.calendarCell,
                                            trained.has(key) &&
                                                styles.calendarTrained,
                                            key === today &&
                                                styles.calendarToday,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.calendarDay,
                                                trained.has(key) &&
                                                    styles.calendarDayOn,
                                            ]}
                                        >
                                            {day}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </>
            )}

            {workouts.length > 0 && (
                <View style={styles.weekRow}>
                    <View style={styles.weekCard}>
                        <Text style={styles.weekValue}>
                            {week.workouts}
                        </Text>
                        <Text style={styles.weekLabel}>THIS WEEK</Text>
                    </View>
                    <View style={styles.weekCard}>
                        <Text style={styles.weekValue}>
                            {Math.round(week.volume).toLocaleString()}
                        </Text>
                        <Text style={styles.weekLabel}>
                            {week.unit.toUpperCase()} VOL
                        </Text>
                    </View>
                    <View style={styles.weekCard}>
                        <Text style={styles.weekValue}>
                            {week.streak}
                        </Text>
                        <Text style={styles.weekLabel}>STREAK</Text>
                    </View>
                </View>
            )}

            {/* EMPTY STATE */}

            {workouts.length === 0 && (
                <View style={styles.emptyCard}>
                    <View style={styles.emptyIcon}>
                        <Text style={styles.emptyIconText}>
                            ✓
                        </Text>
                    </View>

                    <Text style={styles.emptyTitle}>
                        No workouts yet
                    </Text>

                    <Text style={styles.emptyText}>
                        Finish your first workout and it will
                        appear here.
                    </Text>

                    <Pressable
                        style={styles.emptyButton}
                        onPress={() =>
                            router.push('/')
                        }
                    >
                        <Text style={styles.emptyButtonText}>
                            Start a Workout
                        </Text>
                    </Pressable>
                </View>
            )}

            {/* WORKOUTS */}

            {visibleWorkouts.map((workout) => {
                const unit =
                    workout.weightUnit ?? 'lb';

                const totalSets =
                    getTotalSets(
                        workout.exercises
                    );

                const totalVolume =
                    getTotalVolume(
                        workout.exercises,
                        unit
                    );

                const monthLabel =
                    getMonthLabel(
                        workout.date
                    );

                const showMonth =
                    monthLabel !== previousMonth;

                previousMonth =
                    monthLabel;

                return (
                    <View key={workout.id}>
                        {showMonth && (
                            <Text
                                style={
                                    styles.monthLabel
                                }
                            >
                                {monthLabel}
                            </Text>
                        )}

                        <Pressable
                            style={({ pressed }) => [
                                styles.workoutCard,

                                pressed &&
                                styles.workoutCardPressed,
                            ]}
                            onPress={() =>
                                router.push({
                                    pathname:
                                        '/history/[id]',

                                    params: {
                                        id: workout.id.toString(),
                                    },
                                })
                            }
                        >
                            {/* CARD HEADER */}

                            <View
                                style={
                                    styles.cardHeader
                                }
                            >
                                <View
                                    style={
                                        styles.cardHeaderInfo
                                    }
                                >
                                    <Text
                                        style={
                                            styles.workoutDate
                                        }
                                    >
                                        {workout.name}
                                    </Text>

                                    <Text
                                        style={
                                            styles.workoutMeta
                                        }
                                    >
                                        {formatDate(
                                            workout.date
                                        )}
                                        {' • '}
                                        {formatTime(
                                            workout.date
                                        )}
                                    </Text>

                                    <Text
                                        style={
                                            styles.workoutMeta
                                        }
                                    >
                                        {formatDuration(
                                            workout.durationSeconds
                                        )}
                                        {' • '}
                                        {
                                            workout.exercises
                                                .length
                                        }{' '}
                                        {workout.exercises
                                            .length === 1
                                            ? 'exercise'
                                            : 'exercises'}
                                    </Text>
                                </View>

                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color={colors.textFaint}
                                />
                            </View>

                            {/* STATS */}

                            <View
                                style={
                                    styles.statsRow
                                }
                            >
                                <View
                                    style={
                                        styles.statCard
                                    }
                                >
                                    <Text
                                        style={
                                            styles.statValue
                                        }
                                    >
                                        {totalSets}
                                    </Text>

                                    <Text
                                        style={
                                            styles.statLabel
                                        }
                                    >
                                        SETS
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.statCard
                                    }
                                >
                                    <Text
                                        style={
                                            styles.statValue
                                        }
                                    >
                                        {Math.round(
                                            totalVolume
                                        ).toLocaleString()}
                                    </Text>

                                    <Text
                                        style={
                                            styles.statLabel
                                        }
                                    >
                                        {unit.toUpperCase()}{' '}
                                        VOLUME
                                    </Text>
                                </View>
                            </View>

                            {/* EXERCISES */}

                            <View
                                style={
                                    styles.exercisePreview
                                }
                            >
                                {workout.exercises
                                    .slice(0, 4)
                                    .map(
                                        (
                                            exercise,
                                            index
                                        ) => (
                                            <View
                                                key={
                                                    exercise.id
                                                }
                                                style={
                                                    styles.exerciseRow
                                                }
                                            >
                                                <View
                                                    style={
                                                        styles.exerciseNumber
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.exerciseNumberText
                                                        }
                                                    >
                                                        {index + 1}
                                                    </Text>
                                                </View>

                                                <Text
                                                    style={
                                                        styles.exerciseName
                                                    }
                                                    numberOfLines={
                                                        1
                                                    }
                                                >
                                                    {
                                                        exercise.name
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.setCount
                                                    }
                                                >
                                                    {
                                                        exercise
                                                            .sets
                                                            .length
                                                    }{' '}
                                                    {exercise.sets
                                                        .length ===
                                                        1
                                                        ? 'set'
                                                        : 'sets'}
                                                </Text>
                                            </View>
                                        )
                                    )}

                                {workout.exercises
                                    .length > 4 && (
                                        <Text
                                            style={
                                                styles.moreText
                                            }
                                        >
                                            +{' '}
                                            {workout
                                                .exercises
                                                .length - 4}{' '}
                                            more exercises
                                        </Text>
                                    )}
                            </View>
                        </Pressable>
                    </View>
                );
            })}
        </ScrollView>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
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
        letterSpacing: -0.5,
    },

    subtitle: {
        color: c.textSecondary,
        fontSize: 16,
        marginTop: 4,
        marginBottom: 10,
    },

    search: {
        backgroundColor: c.card,
        color: c.text,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 14,
    },

    calendarCard: {
        backgroundColor: c.card,
        borderRadius: 16,
        padding: 14,
        marginBottom: 22,
    },

    calendarLabel: {
        color: c.textMuted,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 10,
    },

    weekdayRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },

    weekday: {
        flex: 1,
        textAlign: 'center',
        color: c.textFaint,
        fontSize: 11,
        fontWeight: '700',
    },

    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    calendarCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },

    calendarTrained: {
        backgroundColor: c.tintSoft,
    },

    calendarToday: {
        borderWidth: 1,
        borderColor: c.tint,
    },

    calendarDay: {
        color: c.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },

    calendarDayOn: {
        color: c.tint,
        fontWeight: '800',
    },

    weekRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 22,
    },

    weekCard: {
        flex: 1,
        backgroundColor: c.card,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
    },

    weekValue: {
        color: c.text,
        fontSize: 20,
        fontWeight: '700',
    },

    weekLabel: {
        color: c.textFaint,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginTop: 5,
        textAlign: 'center',
    },

    // MONTH

    monthLabel: {
        color: c.textMuted,

        fontSize: 11,
        fontWeight: '700',

        letterSpacing: 0.9,

        marginTop: 4,
        marginBottom: 10,
    },

    // CARD

    workoutCard: {
        backgroundColor: c.card,

        borderRadius: 18,

        padding: 18,

        marginBottom: 22,
    },

    workoutCardPressed: {
        opacity: 0.75,
    },

    cardHeader: {
        flexDirection: 'row',

        justifyContent:
            'space-between',

        alignItems: 'center',
    },

    cardHeaderInfo: {
        flex: 1,
    },

    workoutDate: {
        color: c.text,

        fontSize: 18,
        fontWeight: '700',
    },

    workoutMeta: {
        color: c.textMuted,

        fontSize: 13,

        marginTop: 4,
    },

    arrow: {
        color: c.textFaint,

        fontSize: 29,

        marginLeft: 12,
    },

    // STATS

    statsRow: {
        flexDirection: 'row',

        gap: 10,

        marginTop: 18,
    },

    statCard: {
        flex: 1,

        backgroundColor: c.background,

        borderRadius: 12,

        padding: 13,
    },

    statValue: {
        color: c.text,

        fontSize: 19,
        fontWeight: '700',
    },

    statLabel: {
        color: c.textFaint,

        fontSize: 9,
        fontWeight: '700',

        letterSpacing: 0.7,

        marginTop: 3,
    },

    // EXERCISES

    exercisePreview: {
        borderTopWidth:
            StyleSheet.hairlineWidth,

        borderTopColor: '#e5e5e5',

        marginTop: 17,
        paddingTop: 14,
    },

    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',

        marginBottom: 10,
    },

    exerciseNumber: {
        width: 25,
        height: 25,

        borderRadius: 8,

        backgroundColor: c.fill,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 10,
    },

    exerciseNumberText: {
        color: c.textMuted,

        fontSize: 11,
        fontWeight: '700',
    },

    exerciseName: {
        flex: 1,

        color: c.text,

        fontSize: 14,
        fontWeight: '600',
    },

    setCount: {
        color: c.textFaint,

        fontSize: 12,

        marginLeft: 10,
    },

    moreText: {
        color: c.tint,

        fontSize: 12,
        fontWeight: '600',

        marginTop: 2,
    },

    // EMPTY

    emptyCard: {
        backgroundColor: c.card,

        borderRadius: 18,

        padding: 30,

        alignItems: 'center',
    },

    emptyIcon: {
        width: 52,
        height: 52,

        borderRadius: 16,

        backgroundColor: c.tintSoft,

        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: 15,
    },

    emptyIconText: {
        color: c.tint,

        fontSize: 23,
        fontWeight: '800',
    },

    emptyTitle: {
        color: c.text,

        fontSize: 19,
        fontWeight: '700',
    },

    emptyText: {
        color: c.textSecondary,

        textAlign: 'center',

        lineHeight: 20,

        marginTop: 6,
    },

    emptyButton: {
        backgroundColor: c.tintSoft,
        paddingHorizontal: 18,
        paddingVertical: 11,
        borderRadius: 11,
        marginTop: 18,
    },

    emptyButtonText: {
        color: c.tint,
        fontWeight: '700',
    },
});
}
