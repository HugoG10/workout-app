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

import { useRoutines } from '@/context/routine-context';
import { useExerciseCatalog } from '@/context/exercise-catalog-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import { ScreenTip } from '@/components/screen-tip';

export default function CreateRoutineScreen() {
    const styles = useThemedStyles(createStyles);
    const { colors } = useAppTheme();

    const insets = useScreenInsets();
    const { addRoutine } = useRoutines();
    const { exercises } = useExerciseCatalog();

    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    const [selectedExercises, setSelectedExercises] =
        useState<string[]>([]);

    const filteredExercises = exercises.filter(
        (exercise) =>
            exercise.name
                .toLowerCase()
                .includes(search.toLowerCase())
    );

    const selectedDetails = selectedExercises
        .map((id) =>
            exercises.find((exercise) => exercise.id === id)
        )
        .filter(
            (exercise): exercise is NonNullable<typeof exercise> =>
                Boolean(exercise)
        );

    const availableExercises = filteredExercises.filter(
        (exercise) => !selectedExercises.includes(exercise.id)
    );

    function toggleExercise(exerciseId: string) {
        setSelectedExercises((current) => {
            const alreadySelected =
                current.includes(exerciseId);

            if (alreadySelected) {
                return current.filter(
                    (id) => id !== exerciseId
                );
            }

            return [...current, exerciseId];
        });
    }

    function saveRoutine() {
        if (name.trim() === '') {
            Alert.alert(
                'Name your routine',
                'Give this routine a name so you can find it later.'
            );
            return;
        }

        if (selectedExercises.length === 0) {
            Alert.alert(
                'Add an exercise',
                'Pick at least one exercise before saving.'
            );
            return;
        }

        addRoutine(
            name,
            selectedExercises
        );

        router.back();
    }

    const canSave =
        name.trim() !== '' &&
        selectedExercises.length > 0;

    return (
        <View style={styles.container}>
            {/* HEADER */}

            <View
                style={[
                    styles.header,
                    { paddingTop: insets.top + 4 },
                ]}
            >
                <Pressable
                    onPress={() => router.back()}
                >
                    <Text style={styles.cancel}>
                        Cancel
                    </Text>
                </Pressable>

                <Text style={styles.headerTitle}>
                    Create Routine
                </Text>

                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <ScreenTip
                    id="create-routine"
                    title="Build a routine"
                    body="Name it, then tap exercises to add them. Save once, and start the whole session from Workout."
                />

                {/* ROUTINE NAME */}

                <Text style={styles.sectionTitle}>
                    Routine Name
                </Text>

                <TextInput
                    style={styles.nameInput}
                    placeholder="Upper Body"
                    placeholderTextColor={colors.textFaint}
                    value={name}
                    onChangeText={setName}
                    maxLength={40}
                />

                <Text style={styles.sectionTitle}>
                    Selected
                </Text>

                {selectedDetails.length === 0 ? (
                    <Text style={styles.selectedCount}>
                        Tap exercises below to add them here.
                    </Text>
                ) : (
                    selectedDetails.map((exercise) => (
                        <Pressable
                            key={exercise.id}
                            style={[
                                styles.exerciseCard,
                                styles.exerciseCardSelected,
                            ]}
                            onPress={() =>
                                toggleExercise(exercise.id)
                            }
                        >
                            <View style={styles.exerciseInfo}>
                                <Text
                                    style={styles.exerciseName}
                                >
                                    {exercise.name}
                                </Text>

                                <Text
                                    style={
                                        styles.exerciseDetails
                                    }
                                >
                                    {exercise.primaryMuscle}
                                    {' • '}
                                    {exercise.equipment}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.checkbox,
                                    styles.checkboxSelected,
                                ]}
                            >
                                <Text
                                    style={styles.checkmark}
                                >
                                    ✓
                                </Text>
                            </View>
                        </Pressable>
                    ))
                )}

                <Text style={styles.sectionTitle}>
                    Add exercises
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

                <Pressable
                    onPress={() =>
                        router.push('/create-exercise')
                    }
                    style={styles.customLink}
                >
                    <Text style={styles.customLinkText}>
                        + Custom exercise
                    </Text>
                </Pressable>

                {availableExercises.map(
                    (exercise) => (
                        <Pressable
                            key={exercise.id}
                            style={styles.exerciseCard}
                            onPress={() =>
                                toggleExercise(
                                    exercise.id
                                )
                            }
                        >
                            <View style={styles.exerciseInfo}>
                                <Text
                                    style={styles.exerciseName}
                                >
                                    {exercise.name}
                                </Text>

                                <Text
                                    style={
                                        styles.exerciseDetails
                                    }
                                >
                                    {exercise.primaryMuscle}
                                    {' • '}
                                    {exercise.equipment}
                                </Text>
                            </View>

                            <View style={styles.checkbox} />
                        </Pressable>
                    )
                )}

                {availableExercises.length === 0 && (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                            {search.trim()
                                ? 'No exercises found.'
                                : 'All matching exercises are selected.'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* SAVE */}

            <View
                style={[
                    styles.bottomContainer,
                    {
                        paddingBottom: Math.max(
                            insets.bottom,
                            16
                        ),
                    },
                ]}
            >
                <Pressable
                    style={[
                        styles.saveButton,
                        !canSave &&
                        styles.saveButtonDisabled,
                    ]}
                    onPress={saveRoutine}
                >
                    <Text style={styles.saveButtonText}>
                        Save Routine
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.background,
    },

    header: {
        paddingHorizontal: 20,
        paddingBottom: 18,

        backgroundColor: c.background,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    cancel: {
        color: c.tint,
        fontSize: 16,
    },

    headerTitle: {
        color: c.text,
        fontSize: 18,
        fontWeight: '700',
    },

    headerSpacer: {
        width: 50,
    },

    content: {
        padding: 20,
        paddingBottom: 120,
    },

    sectionTitle: {
        color: c.text,
        fontSize: 18,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 10,
    },

    nameInput: {
        backgroundColor: c.card,
        color: c.text,

        paddingHorizontal: 16,
        paddingVertical: 15,

        borderRadius: 14,

        fontSize: 17,

        marginBottom: 28,
    },

    searchInput: {
        backgroundColor: c.card,
        color: c.text,

        paddingHorizontal: 16,
        paddingVertical: 14,

        borderRadius: 14,

        fontSize: 16,

        marginBottom: 12,
    },

    selectedCount: {
        color: c.textSecondary,
        fontSize: 14,
        marginBottom: 14,
    },

    customLink: {
        marginBottom: 14,
    },

    customLinkText: {
        color: c.tint,
        fontSize: 15,
        fontWeight: '600',
    },

    exerciseCard: {
        backgroundColor: c.card,

        padding: 16,

        borderRadius: 14,

        marginBottom: 10,

        flexDirection: 'row',
        alignItems: 'center',

        borderWidth: 2,
        borderColor: 'transparent',
    },

    exerciseCardSelected: {
        borderColor: c.tint,
        backgroundColor: c.tintSoft,
    },

    exerciseInfo: {
        flex: 1,
    },

    exerciseName: {
        color: c.text,
        fontSize: 17,
        fontWeight: '600',
    },

    exerciseDetails: {
        color: c.textSecondary,
        marginTop: 4,
    },

    checkbox: {
        width: 28,
        height: 28,

        borderRadius: 8,

        borderWidth: 2,
        borderColor: c.separator,

        justifyContent: 'center',
        alignItems: 'center',

        marginLeft: 12,
    },

    checkboxSelected: {
        backgroundColor: c.tint,
        borderColor: c.tint,
    },

    checkmark: {
        color: c.onTint,
        fontWeight: '700',
    },

    emptyCard: {
        backgroundColor: c.card,
        padding: 24,
        borderRadius: 14,
        alignItems: 'center',
    },

    emptyText: {
        color: c.textSecondary,
    },

    bottomContainer: {
        position: 'absolute',

        left: 0,
        right: 0,
        bottom: 0,

        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 34,

        backgroundColor: c.background,
    },

    saveButton: {
        backgroundColor: c.tint,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },

    saveButtonDisabled: {
        opacity: 0.4,
    },

    saveButtonText: {
        color: c.onTint,
        fontSize: 17,
        fontWeight: '700',
    },
});
}
