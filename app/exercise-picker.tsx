import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { useExerciseCatalog } from '@/context/exercise-catalog-context';
import { useHistory } from '@/context/history-context';
import { useWorkout } from '@/context/workout-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import { prefillFromPrevious } from '@/lib/workout-stats';

export default function ExercisePickerScreen() {
    const styles = useThemedStyles(createStyles);
    const { colors } = useAppTheme();

    const insets = useScreenInsets();
    const { exercises } = useExerciseCatalog();
    const { addExercise, workoutExercises } =
        useWorkout();
    const { getPreviousExercise } = useHistory();

    const [search, setSearch] = useState('');

    const addedIds = useMemo(
        () =>
            new Set(
                workoutExercises.map(
                    (exercise) => exercise.id
                )
            ),
        [workoutExercises]
    );

    const filteredExercises = exercises.filter(
        (exercise) => {
            const searchText =
                search.trim().toLowerCase();

            if (searchText === '') {
                return true;
            }

            return (
                exercise.name
                    .toLowerCase()
                    .includes(searchText) ||
                exercise.primaryMuscle
                    .toLowerCase()
                    .includes(searchText) ||
                exercise.equipment
                    .toLowerCase()
                    .includes(searchText)
            );
        }
    );

    function selectExercise(exerciseId: string) {
        if (addedIds.has(exerciseId)) {
            return;
        }

        const previous =
            getPreviousExercise(exerciseId);

        addExercise(
            exerciseId,
            prefillFromPrevious(previous?.sets)
        );

        router.back();
    }

    return (
        <View style={styles.screen}>
            <View
                style={[
                    styles.header,
                    { paddingTop: insets.top + 4 },
                ]}
            >
                <Pressable
                    hitSlop={10}
                    onPress={() => router.back()}
                >
                    <Text style={styles.cancel}>
                        Cancel
                    </Text>
                </Pressable>

                <Text style={styles.title}>
                    Add Exercise
                </Text>

                <Pressable
                    hitSlop={10}
                    onPress={() =>
                        router.push('/create-exercise')
                    }
                >
                    <Text style={styles.custom}>
                        Custom
                    </Text>
                </Pressable>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search exercises..."
                    placeholderTextColor={colors.textFaint}
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                />

                {search.length > 0 && (
                    <Pressable
                        hitSlop={8}
                        onPress={() => setSearch('')}
                    >
                        <Text style={styles.clearSearch}>
                            ×
                        </Text>
                    </Pressable>
                )}
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                {filteredExercises.map((exercise) => {
                    const added = addedIds.has(
                        exercise.id
                    );

                    return (
                        <Pressable
                            key={exercise.id}
                            disabled={added}
                            style={[
                                styles.card,
                                added && styles.cardAdded,
                            ]}
                            onPress={() =>
                                selectExercise(exercise.id)
                            }
                        >
                            <View style={styles.cardInfo}>
                                <Text
                                    style={styles.exerciseName}
                                >
                                    {exercise.name}
                                </Text>

                                <Text style={styles.details}>
                                    {exercise.primaryMuscle} •{' '}
                                    {exercise.equipment}
                                </Text>
                            </View>

                            {added ? (
                                <Text style={styles.addedLabel}>
                                    Added
                                </Text>
                            ) : (
                                <Text style={styles.addLabel}>
                                    Add
                                </Text>
                            )}
                        </Pressable>
                    );
                })}

                {filteredExercises.length === 0 && (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                            No exercises match “{search}”.
                        </Text>

                        <Pressable
                            onPress={() =>
                                router.push('/create-exercise')
                            }
                        >
                            <Text style={styles.customEmpty}>
                                Create a custom exercise
                            </Text>
                        </Pressable>
                    </View>
                )}
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

    header: {
        paddingHorizontal: 20,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: c.background,
    },

    cancel: {
        color: c.tint,
        fontSize: 16,
    },

    title: {
        color: c.text,
        fontSize: 18,
        fontWeight: '700',
    },

    custom: {
        color: c.tint,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'right',
        minWidth: 50,
    },

    headerSpacer: {
        width: 50,
    },

    searchContainer: {
        marginHorizontal: 20,
        marginBottom: 12,
        minHeight: 48,
        backgroundColor: c.card,
        borderRadius: 14,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
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

    container: {
        flex: 1,
    },

    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    card: {
        backgroundColor: c.card,
        padding: 16,
        borderRadius: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    cardAdded: {
        opacity: 0.55,
    },

    cardInfo: {
        flex: 1,
        paddingRight: 12,
    },

    exerciseName: {
        color: c.text,
        fontSize: 17,
        fontWeight: '600',
    },

    details: {
        color: c.textSecondary,
        marginTop: 4,
    },

    addLabel: {
        color: c.tint,
        fontWeight: '700',
    },

    addedLabel: {
        color: c.textMuted,
        fontWeight: '600',
    },

    emptyCard: {
        backgroundColor: c.card,
        padding: 24,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
    },

    emptyText: {
        color: c.textSecondary,
        textAlign: 'center',
    },

    customEmpty: {
        color: c.tint,
        fontSize: 15,
        fontWeight: '600',
        marginTop: 12,
    },
});
}

