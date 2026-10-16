import { useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
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
    const [monthAnchor, setMonthAnchor] = useState(
        () => new Date()
    );
    const [selectedKey, setSelectedKey] = useState<string | null>(
        null
    );
    const calendar = monthCells(monthAnchor);
    const trained = trainedDayKeys(workouts);
    const today = dayKey(new Date());

    const visibleWorkouts = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const matched = needle
            ? workouts.filter((workout) => {
                  if (workout.name.toLowerCase().includes(needle)) {
                      return true;
                  }

                  return workout.exercises.some((exercise) =>
                      exercise.name.toLowerCase().includes(needle)
                  );
              })
            : workouts;

        if (!selectedKey) {
            return matched;
        }

        return matched.filter(
            (workout) => dayKey(workout.date) === selectedKey
        );
    }, [query, selectedKey, workouts]);

    const selectedLabel = selectedKey
        ? new Date(
              Number(selectedKey.slice(0, 4)),
              Number(selectedKey.slice(5, 7)) - 1,
              Number(selectedKey.slice(8, 10))
          ).toLocaleDateString([], {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
          })
        : null;

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

    function shiftMonth(delta: number) {
        setMonthAnchor(
            (current) =>
                new Date(
                    current.getFullYear(),
                    current.getMonth() + delta,
                    1
                )
        );
    }

    function selectDay(key: string) {
        Haptics.selectionAsync();
        setSelectedKey((current) =>
            current === key ? null : key
        );
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
                <SearchField
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search workouts or exercises"
                />
            )}

            <View style={styles.calendarCard}>
                <View style={styles.calendarHeader}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Previous month"
                        hitSlop={10}
                        onPress={() => shiftMonth(-1)}
                        style={styles.monthButton}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={18}
                            color={colors.text}
                        />
                    </Pressable>
                    <Text style={styles.calendarLabel}>
                        {calendar.label}
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Next month"
                        hitSlop={10}
                        onPress={() => shiftMonth(1)}
                        style={styles.monthButton}
                    >
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={colors.text}
                        />
                    </Pressable>
                </View>
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
                        const hasWorkout = trained.has(key);
                        const selected = selectedKey === key;
                        const isToday = key === today;

                        return (
                            <Pressable
                                key={key}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    hasWorkout
                                        ? `${day}, workout logged`
                                        : `${day}, no workout`
                                }
                                onPress={() => selectDay(key)}
                                style={styles.calendarCell}
                            >
                                <View
                                    style={[
                                        styles.dayCircle,
                                        isToday &&
                                            !selected &&
                                            styles.dayToday,
                                        selected && styles.daySelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.calendarDay,
                                            hasWorkout &&
                                                !selected &&
                                                styles.calendarDayOn,
                                            selected &&
                                                styles.calendarDaySelected,
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.dayDot,
                                        hasWorkout && styles.dayDotOn,
                                    ]}
                                />
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {selectedLabel ? (
                <View style={styles.daySummary}>
                    <View style={styles.daySummaryCopy}>
                        <Text style={styles.daySummaryTitle}>
                            {selectedLabel}
                        </Text>
                        <Text style={styles.daySummaryMeta}>
                            {visibleWorkouts.length === 0
                                ? 'No session saved'
                                : `${visibleWorkouts.length} ${
                                      visibleWorkouts.length === 1
                                          ? 'session'
                                          : 'sessions'
                                  }`}
                        </Text>
                    </View>
                    <Pressable
                        hitSlop={8}
                        onPress={() => setSelectedKey(null)}
                    >
                        <Text style={styles.clearDay}>Show all</Text>
                    </Pressable>
                </View>
            ) : null}

            {selectedKey && visibleWorkouts.length === 0 ? (
                <View style={styles.dayEmpty}>
                    <View style={styles.dayEmptyIcon}>
                        <Ionicons
                            name="calendar-outline"
                            size={22}
                            color={colors.textSecondary}
                        />
                    </View>
                    <Text style={styles.dayEmptyTitle}>
                        No workout logged
                    </Text>
                    <Text style={styles.dayEmptyText}>
                        {query.trim()
                            ? 'No saved session matches this search.'
                            : 'Nothing was saved for this day.'}
                    </Text>
                </View>
            ) : null}

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

            {workouts.length === 0 && !selectedKey && (
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
        borderRadius: 18,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.line,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 14,
        marginBottom: 16,
    },

    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    monthButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    calendarLabel: {
        color: c.text,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.2,
    },

    weekdayRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },

    weekday: {
        flex: 1,
        textAlign: 'center',
        color: c.textFaint,
        fontSize: 12,
        fontWeight: '600',
    },

    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    calendarCell: {
        width: '14.28%',
        alignItems: 'center',
        paddingVertical: 4,
    },

    dayCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },

    dayToday: {
        borderWidth: 1,
        borderColor: c.tint,
    },

    daySelected: {
        backgroundColor: c.text,
    },

    calendarDay: {
        color: c.text,
        fontSize: 15,
        fontWeight: '500',
        fontVariant: ['tabular-nums'],
    },

    calendarDayOn: {
        fontWeight: '700',
    },

    calendarDaySelected: {
        color: c.background,
        fontWeight: '700',
    },

    dayDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 3,
        backgroundColor: 'transparent',
    },

    dayDotOn: {
        backgroundColor: c.tint,
    },

    daySummary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 4,
        gap: 12,
    },

    daySummaryCopy: {
        flex: 1,
    },

    daySummaryTitle: {
        color: c.text,
        fontSize: 17,
        fontWeight: '700',
    },

    daySummaryMeta: {
        color: c.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },

    clearDay: {
        color: c.tint,
        fontSize: 15,
        fontWeight: '600',
    },

    dayEmpty: {
        backgroundColor: c.card,
        borderRadius: 18,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.line,
        paddingVertical: 28,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 18,
    },

    dayEmptyIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: c.fill,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },

    dayEmptyTitle: {
        color: c.text,
        fontSize: 17,
        fontWeight: '700',
    },

    dayEmptyText: {
        color: c.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 4,
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
