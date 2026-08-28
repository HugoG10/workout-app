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

import {
    router,
    useLocalSearchParams,
} from 'expo-router';

import {
    useEffect,
    useState,
} from 'react';

import { Ionicons } from '@expo/vector-icons';

import { useRoutines } from '@/context/routine-context';
import { useExerciseCatalog } from '@/context/exercise-catalog-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';

export default function EditRoutineScreen() {
    const styles = useThemedStyles(createStyles);
    const { colors } = useAppTheme();

    const insets = useScreenInsets();
    const { id } = useLocalSearchParams<{
        id: string;
    }>();

    const {
        routines,
        updateRoutine,
        deleteRoutine,
        duplicateRoutine,
    } = useRoutines();

    const { exercises } = useExerciseCatalog();

    const routine = routines.find(
        (item) => item.id === id
    );

    const [name, setName] = useState('');

    const [
        selectedExercises,
        setSelectedExercises,
    ] = useState<string[]>([]);

    const [search, setSearch] =
        useState('');

    useEffect(() => {
        if (!routine) {
            return;
        }

        setName(routine.name);

        setSelectedExercises(
            routine.exerciseIds
        );
    }, [routine]);

    if (!routine) {
        return (
            <View style={styles.notFoundContainer}>
                <Text style={styles.notFoundTitle}>
                    Routine not found
                </Text>

                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>
                        Go Back
                    </Text>
                </Pressable>
            </View>
        );
    }

    const routineId = routine.id;
    const routineName = routine.name;

    const filteredExercises =
        exercises.filter((exercise) =>
            exercise.name
                .toLowerCase()
                .includes(search.toLowerCase())
        );

    const selectedDetails = selectedExercises
        .map((exerciseId) =>
            exercises.find(
                (exercise) => exercise.id === exerciseId
            )
        )
        .filter(
            (exercise): exercise is NonNullable<typeof exercise> =>
                Boolean(exercise)
        );

    const availableExercises = filteredExercises.filter(
        (exercise) =>
            !selectedExercises.includes(exercise.id)
    );

    function toggleExercise(
        exerciseId: string
    ) {
        setSelectedExercises((current) => {
            if (current.includes(exerciseId)) {
                return current.filter(
                    (item) => item !== exerciseId
                );
            }

            return [
                ...current,
                exerciseId,
            ];
        });
    }

    function saveChanges() {
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

        updateRoutine(
            routineId,
            name,
            selectedExercises
        );

        router.back();
    }

    function confirmDelete() {
        Alert.alert(
            'Delete Routine?',
            `Are you sure you want to delete "${routineName}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },

                {
                    text: 'Delete',
                    style: 'destructive',

                    onPress: () => {
                        deleteRoutine(routineId);

                        router.back();
                    },
                },
            ]
        );
    }

    function handleDuplicate() {
        const copyId = duplicateRoutine(routineId);

        if (!copyId) {
            return;
        }

        router.replace({
            pathname: '/routine/[id]',
            params: { id: copyId },
        });
    }

    function showMoreOptions() {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [
                        'Duplicate',
                        'Delete',
                        'Cancel',
                    ],
                    destructiveButtonIndex: 1,
                    cancelButtonIndex: 2,
                },
                (index) => {
                    if (index === 0) {
                        handleDuplicate();
                        return;
                    }

                    if (index === 1) {
                        confirmDelete();
                    }
                }
            );
            return;
        }

        Alert.alert(
            routineName,
            undefined,
            [
                {
                    text: 'Duplicate',
                    onPress: handleDuplicate,
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDelete,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
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
                    style={styles.headerSide}
                >
                    <Text style={styles.cancel}>
                        Cancel
                    </Text>
                </Pressable>

                <Text style={styles.headerTitle}>
                    Edit Routine
                </Text>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="More routine actions"
                    hitSlop={10}
                    onPress={showMoreOptions}
                    style={styles.moreButton}
                >
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={22}
                        color={colors.text}
                    />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* ROUTINE NAME */}

                <Text style={styles.sectionTitle}>
                    Routine Name
                </Text>

                <TextInput
                    style={styles.nameInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Routine name"
                    placeholderTextColor={colors.textFaint}
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

                            <View
                                style={[
                                    styles.checkbox,
                                    styles.checkboxSelected,
                                ]}
                            >
                                <Text style={styles.checkmark}>
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
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search exercises..."
                    placeholderTextColor={colors.textFaint}
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
                    onPress={saveChanges}
                >
                    <Text style={styles.saveButtonText}>
                        Save Changes
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

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    headerSide: {
        minWidth: 72,
        minHeight: 44,
        justifyContent: 'center',
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

    moreButton: {
        minWidth: 72,
        minHeight: 44,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },

    content: {
        padding: 20,
        paddingBottom: 140,
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
        padding: 20,
        borderRadius: 14,
        marginBottom: 10,
    },

    emptyText: {
        color: c.textSecondary,
        textAlign: 'center',
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

    notFoundContainer: {
        flex: 1,

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
        fontWeight: '600',
    },
});
}
