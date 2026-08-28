import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { router } from 'expo-router';
import { useState } from 'react';

import { useExerciseCatalog } from '@/context/exercise-catalog-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import { ScreenTip } from '@/components/screen-tip';

const muscleGroups = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Quadriceps',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Core',
];

const equipmentOptions = [
    'All',
    'Barbell',
    'Dumbbell',
    'Cable',
    'Machine',
    'Bodyweight',
    'Ab Wheel',
];

const difficultyOptions = [
    'All',
    'Beginner',
    'Intermediate',
    'Advanced',
];

export default function ExercisesScreen() {
    const styles = useThemedStyles(createStyles);
    const { colors } = useAppTheme();
    const {
        exercises,
        deleteCustomExercise,
    } = useExerciseCatalog();

    const insets = useScreenInsets();
    const [search, setSearch] = useState('');

    const [selectedMuscle, setSelectedMuscle] =
        useState('All');

    const [
        selectedEquipment,
        setSelectedEquipment,
    ] = useState('All');

    const [
        selectedDifficulty,
        setSelectedDifficulty,
    ] = useState('All');

    const [
        showAdvancedFilters,
        setShowAdvancedFilters,
    ] = useState(false);

    const filteredExercises =
        exercises.filter((exercise) => {
            const searchText =
                search.trim().toLowerCase();

            const matchesSearch =
                exercise.name
                    .toLowerCase()
                    .includes(searchText) ||
                exercise.primaryMuscle
                    .toLowerCase()
                    .includes(searchText) ||
                exercise.equipment
                    .toLowerCase()
                    .includes(searchText);

            const matchesMuscle =
                selectedMuscle === 'All' ||
                exercise.primaryMuscle ===
                selectedMuscle ||
                exercise.secondaryMuscles.includes(
                    selectedMuscle
                );

            const matchesEquipment =
                selectedEquipment === 'All' ||
                exercise.equipment ===
                selectedEquipment ||
                (selectedEquipment === 'Dumbbell' &&
                    (exercise.equipment ===
                        'Dumbbell' ||
                        exercise.equipment ===
                        'Dumbbells'));

            const matchesDifficulty =
                selectedDifficulty === 'All' ||
                exercise.difficulty ===
                selectedDifficulty;

            return (
                matchesSearch &&
                matchesMuscle &&
                matchesEquipment &&
                matchesDifficulty
            );
        });

    const advancedFiltersActive =
        selectedEquipment !== 'All' ||
        selectedDifficulty !== 'All';

    const filtersActive =
        search.trim() !== '' ||
        selectedMuscle !== 'All' ||
        advancedFiltersActive;

    function clearFilters() {
        setSearch('');
        setSelectedMuscle('All');
        setSelectedEquipment('All');
        setSelectedDifficulty('All');
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + 4 },
            ]}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
        >
            {/* HEADER */}

            <View style={styles.titleRow}>
                <Text style={styles.title}>
                    Exercises
                </Text>

                <Pressable
                    onPress={() =>
                        router.push('/create-exercise')
                    }
                    hitSlop={8}
                >
                    <Text style={styles.customLinkText}>
                        + Custom
                    </Text>
                </Pressable>
            </View>

            <Text style={styles.subtitle}>
                Find an exercise and learn proper form.
            </Text>

            <ScreenTip
                id="exercises"
                title="Learn an exercise"
                body="Tap any movement for form, muscles, and your strength progress."
                style={{ marginHorizontal: 20 }}
            />

            {/* SEARCH */}

            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>
                    ⌕
                </Text>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search exercises..."
                    placeholderTextColor={colors.textFaint}
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {search.length > 0 && (
                    <Pressable
                        hitSlop={8}
                        onPress={() =>
                            setSearch('')
                        }
                    >
                        <Text style={styles.clearSearch}>
                            ×
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* MUSCLE FILTER */}

            <ScrollView
                horizontal
                nestedScrollEnabled
                directionalLockEnabled
                keyboardShouldPersistTaps="always"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                    styles.filterScroll
                }
                style={styles.filterContainer}
            >
                {muscleGroups.map((muscle) => {
                    const selected =
                        selectedMuscle === muscle;

                    return (
                        <Pressable
                            key={muscle}
                            style={[
                                styles.filterChip,

                                selected &&
                                styles.filterChipSelected,
                            ]}
                            onPress={() =>
                                setSelectedMuscle(
                                    muscle
                                )
                            }
                        >
                            <Text
                                style={[
                                    styles.filterChipText,

                                    selected &&
                                    styles.filterChipTextSelected,
                                ]}
                            >
                                {muscle}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            {/* FILTER CONTROLS */}

            <View style={styles.filterHeader}>
                <Text style={styles.resultCount}>
                    {filteredExercises.length}{' '}
                    {filteredExercises.length === 1
                        ? 'exercise'
                        : 'exercises'}
                </Text>

                <View style={styles.filterActions}>
                    {filtersActive && (
                        <Pressable
                            hitSlop={8}
                            onPress={clearFilters}
                        >
                            <Text style={styles.clearText}>
                                Clear
                            </Text>
                        </Pressable>
                    )}

                    <Pressable
                        style={[
                            styles.advancedButton,

                            advancedFiltersActive &&
                            styles.advancedButtonActive,
                        ]}
                        onPress={() =>
                            setShowAdvancedFilters(
                                (current) => !current
                            )
                        }
                    >
                        <Text
                            style={[
                                styles.advancedButtonText,

                                advancedFiltersActive &&
                                styles.advancedButtonTextActive,
                            ]}
                        >
                            Filters
                            {advancedFiltersActive
                                ? ' •'
                                : ''}
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* ADVANCED FILTERS */}

            {showAdvancedFilters && (
                <View
                    style={
                        styles.advancedFiltersCard
                    }
                >
                    <Text
                        style={
                            styles.advancedLabel
                        }
                    >
                        EQUIPMENT
                    </Text>

                    <View style={styles.wrapRow}>
                        {equipmentOptions.map(
                            (equipment) => {
                                const selected =
                                    selectedEquipment ===
                                    equipment;

                                return (
                                    <Pressable
                                        key={equipment}
                                        style={[
                                            styles.smallChip,

                                            selected &&
                                            styles.smallChipSelected,
                                        ]}
                                        onPress={() =>
                                            setSelectedEquipment(
                                                equipment
                                            )
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.smallChipText,

                                                selected &&
                                                styles.smallChipTextSelected,
                                            ]}
                                        >
                                            {equipment}
                                        </Text>
                                    </Pressable>
                                );
                            }
                        )}
                    </View>

                    <Text
                        style={[
                            styles.advancedLabel,
                            styles.difficultyLabel,
                        ]}
                    >
                        DIFFICULTY
                    </Text>

                    <View style={styles.wrapRow}>
                        {difficultyOptions.map(
                            (difficulty) => {
                                const selected =
                                    selectedDifficulty ===
                                    difficulty;

                                return (
                                    <Pressable
                                        key={difficulty}
                                        style={[
                                            styles.smallChip,

                                            selected &&
                                            styles.smallChipSelected,
                                        ]}
                                        onPress={() =>
                                            setSelectedDifficulty(
                                                difficulty
                                            )
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.smallChipText,

                                                selected &&
                                                styles.smallChipTextSelected,
                                            ]}
                                        >
                                            {difficulty}
                                        </Text>
                                    </Pressable>
                                );
                            }
                        )}
                    </View>
                </View>
            )}

            {/* EXERCISE CARDS */}

            {filteredExercises.map(
                (exercise) => (
                    <Pressable
                        key={exercise.id}
                        accessibilityRole="button"
                        accessibilityLabel={exercise.name}
                        style={({ pressed }) => [
                            styles.exerciseCard,

                            pressed &&
                            styles.exerciseCardPressed,
                        ]}
                        onPress={() => {
                            router.push(
                                `/exercise/${exercise.id}`
                            );
                        }}
                        onLongPress={() => {
                            if (!exercise.isCustom) {
                                return;
                            }

                            Alert.alert(
                                'Delete exercise?',
                                `Remove "${exercise.name}" from your custom list?`,
                                [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: () =>
                                            deleteCustomExercise(
                                                exercise.id
                                            ),
                                    },
                                ]
                            );
                        }}
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
                                {exercise.isCustom
                                    ? '  · Custom'
                                    : ''}
                            </Text>

                            <Text
                                style={
                                    styles.exerciseMuscle
                                }
                            >
                                {exercise.primaryMuscle}

                                {exercise
                                    .secondaryMuscles
                                    .length > 0 &&
                                    ` • ${exercise.secondaryMuscles
                                        .slice(0, 2)
                                        .join(' • ')}`}
                            </Text>

                            <View
                                style={
                                    styles.exerciseMeta
                                }
                            >
                                <View
                                    style={styles.metaBadge}
                                >
                                    <Text
                                        style={
                                            styles.metaText
                                        }
                                    >
                                        {exercise.equipment}
                                    </Text>
                                </View>

                                <View
                                    style={styles.metaBadge}
                                >
                                    <Text
                                        style={
                                            styles.metaText
                                        }
                                    >
                                        {
                                            exercise.difficulty
                                        }
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.arrow}>
                            ›
                        </Text>
                    </Pressable>
                )
            )}

            {/* EMPTY */}

            {filteredExercises.length === 0 && (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>
                        No exercises found
                    </Text>

                    <Text style={styles.emptyText}>
                        Try changing your search or filters.
                    </Text>

                    <Pressable
                        style={styles.resetButton}
                        onPress={clearFilters}
                    >
                        <Text
                            style={
                                styles.resetButtonText
                            }
                        >
                            Reset Filters
                        </Text>
                    </Pressable>
                </View>
            )}
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
        paddingBottom: 60,
    },

    titleRow: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },

    title: {
        flex: 1,
        color: c.text,
        fontSize: 36,
        fontWeight: '700',
        letterSpacing: -0.5,
    },

    customLinkText: {
        color: c.tint,
        fontSize: 16,
        fontWeight: '600',
    },

    subtitle: {
        paddingHorizontal: 20,

        color: c.textSecondary,
        fontSize: 16,

        marginTop: 4,
        marginBottom: 22,
    },

    // SEARCH

    searchContainer: {
        marginHorizontal: 20,

        minHeight: 48,

        backgroundColor: c.card,

        borderRadius: 14,

        paddingHorizontal: 14,

        flexDirection: 'row',
        alignItems: 'center',
    },

    searchIcon: {
        color: c.textFaint,
        fontSize: 23,
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        color: c.text,
        fontSize: 16,

        paddingVertical: 12,
    },

    clearSearch: {
        color: c.textFaint,
        fontSize: 25,
        paddingLeft: 8,
    },

    // MUSCLE FILTER

    filterContainer: {
        marginTop: 16,
        flexGrow: 0,
    },

    filterScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },

    filterChip: {
        backgroundColor: c.card,

        paddingHorizontal: 15,
        paddingVertical: 9,

        borderRadius: 20,
    },

    filterChipSelected: {
        backgroundColor: c.tint,
    },

    filterChipText: {
        color: c.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },

    filterChipTextSelected: {
        color: c.onTint,
    },

    // FILTER HEADER

    filterHeader: {
        marginTop: 18,
        marginBottom: 12,

        paddingHorizontal: 20,

        flexDirection: 'row',

        justifyContent:
            'space-between',

        alignItems: 'center',
    },

    resultCount: {
        color: c.textMuted,
        fontSize: 13,
    },

    filterActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    clearText: {
        color: c.tint,
        fontSize: 13,
        fontWeight: '600',
    },

    advancedButton: {
        backgroundColor: c.card,

        paddingHorizontal: 12,
        paddingVertical: 7,

        borderRadius: 10,
    },

    advancedButtonActive: {
        backgroundColor: c.tintSoft,
    },

    advancedButtonText: {
        color: c.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },

    advancedButtonTextActive: {
        color: c.tint,
    },

    // ADVANCED

    advancedFiltersCard: {
        backgroundColor: c.card,

        marginHorizontal: 20,
        marginBottom: 14,

        padding: 16,

        borderRadius: 16,
    },

    advancedLabel: {
        color: c.textFaint,

        fontSize: 10,
        fontWeight: '700',

        letterSpacing: 0.8,

        marginBottom: 9,
    },

    difficultyLabel: {
        marginTop: 17,
    },

    wrapRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 7,
    },

    smallChip: {
        backgroundColor: c.fill,

        paddingHorizontal: 12,
        paddingVertical: 8,

        borderRadius: 10,
    },

    smallChipSelected: {
        backgroundColor: c.tint,
    },

    smallChipText: {
        color: c.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },

    smallChipTextSelected: {
        color: c.onTint,
    },

    // EXERCISE

    exerciseCard: {
        backgroundColor: c.card,

        marginHorizontal: 20,
        marginBottom: 10,

        padding: 17,

        borderRadius: 16,

        flexDirection: 'row',

        alignItems: 'center',
    },

    exerciseCardPressed: {
        opacity: 0.7,
    },

    exerciseInfo: {
        flex: 1,
    },

    exerciseName: {
        color: c.text,

        fontSize: 17,
        fontWeight: '700',
    },

    exerciseMuscle: {
        color: c.textMuted,

        fontSize: 13,

        marginTop: 4,
    },

    exerciseMeta: {
        flexDirection: 'row',

        gap: 6,

        marginTop: 11,
    },

    metaBadge: {
        backgroundColor: c.fill,

        paddingHorizontal: 9,
        paddingVertical: 5,

        borderRadius: 8,
    },

    metaText: {
        color: c.textSecondary,

        fontSize: 11,
        fontWeight: '600',
    },

    arrow: {
        color: c.textFaint,

        fontSize: 29,

        marginLeft: 12,
    },

    // EMPTY

    emptyCard: {
        backgroundColor: c.card,

        marginHorizontal: 20,

        padding: 28,

        borderRadius: 16,

        alignItems: 'center',
    },

    emptyTitle: {
        color: c.text,
        fontSize: 18,
        fontWeight: '700',
    },

    emptyText: {
        color: c.textSecondary,

        marginTop: 5,

        textAlign: 'center',
    },

    resetButton: {
        backgroundColor: c.tintSoft,

        paddingHorizontal: 16,
        paddingVertical: 10,

        borderRadius: 10,

        marginTop: 16,
    },

    resetButtonText: {
        color: c.tint,
        fontWeight: '700',
    },
});
}
