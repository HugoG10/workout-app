import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { TrackingType, trackingFor } from '@/data/exercises';
import { useExerciseCatalog } from '@/context/exercise-catalog-context';

export type WorkoutSet = {
    id: number;
    weight: string;
    reps: string;
    duration: string;
    completed: boolean;
    isWarmup: boolean;
};

export type WorkoutExercise = {
    id: string;
    name: string;
    primaryMuscle: string;
    secondaryMuscles: string[];
    tracking: TrackingType;
    notes: string;
    restSeconds?: number;
    sets: WorkoutSet[];
};

export type SetPrefill = {
    weight?: string;
    reps?: string;
    duration?: string;
    isWarmup?: boolean;
};

type WorkoutContextType = {
    workoutExercises: WorkoutExercise[];
    workoutStartedAt: number | null;
    restEndsAt: number | null;
    workoutName: string;
    isWorkoutActive: boolean;
    hydrated: boolean;

    addExercise: (
        exerciseId: string,
        prefill?: SetPrefill
    ) => void;

    removeExercise: (exerciseId: string) => void;

    moveExercise: (
        exerciseId: string,
        direction: 'up' | 'down'
    ) => void;

    addSet: (exerciseId: string, warmup?: boolean) => void;

    deleteSet: (exerciseId: string, setId: number) => void;

    duplicateSet: (exerciseId: string, setId: number) => void;

    toggleWarmup: (exerciseId: string, setId: number) => void;

    updateWeight: (
        exerciseId: string,
        setId: number,
        value: string
    ) => void;

    updateReps: (
        exerciseId: string,
        setId: number,
        value: string
    ) => void;

    updateDuration: (
        exerciseId: string,
        setId: number,
        value: string
    ) => void;

    updateNotes: (exerciseId: string, notes: string) => void;

    updateRestSeconds: (
        exerciseId: string,
        seconds: number
    ) => void;

    toggleCompleted: (
        exerciseId: string,
        setId: number
    ) => boolean;

    setRestEndsAt: (value: number | null) => void;

    clearWorkout: () => void;

    ensureWorkoutStarted: () => void;

    startEmptyWorkout: (name?: string) => void;

    startRoutine: (
        exerciseIds: string[],
        prefillByExerciseId?: Record<string, SetPrefill>,
        name?: string
    ) => void;

    startFromHistory: (
        exercises: WorkoutExercise[],
        name?: string
    ) => void;

    replaceExercise: (
        currentId: string,
        nextId: string,
        prefill?: SetPrefill
    ) => void;

    setWorkoutName: (name: string) => void;
};

const WorkoutContext =
    createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEY = 'active-workout';

function normalizeSet(raw: Partial<WorkoutSet> & { id: number }): WorkoutSet {
    return {
        id: raw.id,
        weight: raw.weight ?? '',
        reps: raw.reps ?? '',
        duration: raw.duration ?? '',
        completed: raw.completed ?? false,
        isWarmup: raw.isWarmup ?? false,
    };
}

function normalizeExercise(
    raw: Partial<WorkoutExercise> & { id: string; name: string }
): WorkoutExercise {
    return {
        id: raw.id,
        name: raw.name,
        primaryMuscle: raw.primaryMuscle ?? '',
        secondaryMuscles: raw.secondaryMuscles ?? [],
        tracking: raw.tracking ?? 'weight_reps',
        notes: raw.notes ?? '',
        restSeconds: raw.restSeconds,
        sets: (raw.sets ?? []).map((set) =>
            normalizeSet(set as WorkoutSet)
        ),
    };
}

export function WorkoutProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { getExercise } = useExerciseCatalog();

    const [workoutExercises, setWorkoutExercises] = useState<
        WorkoutExercise[]
    >([]);
    const [workoutStartedAt, setWorkoutStartedAt] = useState<
        number | null
    >(null);
    const [restEndsAt, setRestEndsAtState] = useState<
        number | null
    >(null);
    const [workoutName, setWorkoutNameState] = useState('Workout');
    const [hydrated, setHydrated] = useState(false);
    const skipSave = useRef(true);

    useEffect(() => {
        loadActiveWorkout();
    }, []);

    useEffect(() => {
        if (!hydrated || skipSave.current) {
            skipSave.current = false;
            return;
        }

        persistActiveWorkout();
    }, [workoutExercises, workoutStartedAt, restEndsAt, workoutName, hydrated]);

    async function loadActiveWorkout() {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);

            if (saved) {
                const parsed = JSON.parse(saved) as {
                    workoutExercises?: Partial<WorkoutExercise>[];
                    workoutStartedAt?: number | null;
                    restEndsAt?: number | null;
                    workoutName?: string;
                };

                if (parsed.workoutStartedAt) {
                    setWorkoutExercises(
                        (parsed.workoutExercises ?? []).map((item) =>
                            normalizeExercise(
                                item as WorkoutExercise
                            )
                        )
                    );
                    setWorkoutStartedAt(parsed.workoutStartedAt);
                    setRestEndsAtState(parsed.restEndsAt ?? null);
                    setWorkoutNameState(
                        parsed.workoutName?.trim() || 'Workout'
                    );
                }
            }
        } catch (error) {
            console.log('Failed to load active workout:', error);
        } finally {
            setHydrated(true);
        }
    }

    function persistActiveWorkout() {
        if (!workoutStartedAt) {
            AsyncStorage.removeItem(STORAGE_KEY).catch((error) => {
                console.log('Failed to clear active workout:', error);
            });
            return;
        }

        AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                workoutExercises,
                workoutStartedAt,
                restEndsAt,
                workoutName,
            })
        ).catch((error) => {
            console.log('Failed to save active workout:', error);
        });
    }

    function createSet(prefill?: SetPrefill): WorkoutSet {
        return {
            id: Date.now() + Math.random(),
            weight: prefill?.weight ?? '',
            reps: prefill?.reps ?? '',
            duration: prefill?.duration ?? '',
            completed: false,
            isWarmup: prefill?.isWarmup ?? false,
        };
    }

    function exerciseFromCatalog(
        exerciseId: string,
        prefill?: SetPrefill
    ): WorkoutExercise | null {
        const selected = getExercise(exerciseId);

        if (!selected) {
            return null;
        }

        return {
            id: selected.id,
            name: selected.name,
            primaryMuscle: selected.primaryMuscle,
            secondaryMuscles: selected.secondaryMuscles,
            tracking: trackingFor(selected),
            notes: '',
            restSeconds: undefined,
            sets: [createSet(prefill)],
        };
    }

    function ensureWorkoutStarted() {
        setWorkoutStartedAt((current) => current ?? Date.now());
    }

    function setWorkoutName(name: string) {
        setWorkoutNameState(name);
    }

    function startEmptyWorkout(name?: string) {
        setWorkoutExercises([]);
        setWorkoutStartedAt(Date.now());
        setRestEndsAtState(null);
        setWorkoutNameState(name?.trim() || 'Workout');
    }

    function addExercise(exerciseId: string, prefill?: SetPrefill) {
        const next = exerciseFromCatalog(exerciseId, prefill);

        if (!next) {
            return;
        }

        ensureWorkoutStarted();

        setWorkoutExercises((current) => {
            if (current.some((item) => item.id === next.id)) {
                return current;
            }

            return [...current, next];
        });
    }

    function startRoutine(
        exerciseIds: string[],
        prefillByExerciseId?: Record<string, SetPrefill>,
        name?: string
    ) {
        const routineExercises = exerciseIds
            .map((exerciseId) =>
                exerciseFromCatalog(
                    exerciseId,
                    prefillByExerciseId?.[exerciseId]
                )
            )
            .filter((item): item is WorkoutExercise => item !== null);

        setWorkoutExercises(routineExercises);
        setWorkoutStartedAt(Date.now());
        setRestEndsAtState(null);
        setWorkoutNameState(name?.trim() || 'Workout');
    }

    function startFromHistory(
        exercises: WorkoutExercise[],
        name?: string
    ) {
        setWorkoutExercises(
            exercises.map((exercise) => ({
                ...exercise,
                secondaryMuscles: [...exercise.secondaryMuscles],
                notes: exercise.notes ?? '',
                sets: exercise.sets.map((set) => ({
                    ...set,
                    id: Date.now() + Math.random(),
                    completed: false,
                })),
            }))
        );
        setWorkoutStartedAt(Date.now());
        setRestEndsAtState(null);
        setWorkoutNameState(name?.trim() || 'Workout');
    }

    function replaceExercise(
        currentId: string,
        nextId: string,
        prefill?: SetPrefill
    ) {
        const next = exerciseFromCatalog(nextId, prefill);

        if (!next) {
            return;
        }

        setWorkoutExercises((current) =>
            current.map((exercise) => {
                if (exercise.id !== currentId) {
                    return exercise;
                }

                const sameTracking =
                    exercise.tracking === next.tracking;

                return {
                    ...next,
                    notes: exercise.notes,
                    restSeconds: exercise.restSeconds,
                    sets: sameTracking
                        ? exercise.sets.map((set) => ({
                              ...set,
                              completed: false,
                          }))
                        : next.sets,
                };
            })
        );
    }

    function removeExercise(exerciseId: string) {
        setWorkoutExercises((current) =>
            current.filter((exercise) => exercise.id !== exerciseId)
        );
    }

    function moveExercise(
        exerciseId: string,
        direction: 'up' | 'down'
    ) {
        setWorkoutExercises((current) => {
            const index = current.findIndex(
                (exercise) => exercise.id === exerciseId
            );

            if (index < 0) {
                return current;
            }

            const target = direction === 'up' ? index - 1 : index + 1;

            if (target < 0 || target >= current.length) {
                return current;
            }

            const next = [...current];
            const [item] = next.splice(index, 1);
            next.splice(target, 0, item);
            return next;
        });
    }

    function addSet(exerciseId: string, warmup = false) {
        setWorkoutExercises((current) =>
            current.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                const lastSet =
                    exercise.sets[exercise.sets.length - 1];

                return {
                    ...exercise,
                    sets: [
                        ...exercise.sets,
                        createSet(
                            lastSet
                                ? {
                                      weight: lastSet.weight,
                                      reps: lastSet.reps,
                                      duration: lastSet.duration,
                                      isWarmup: warmup,
                                  }
                                : { isWarmup: warmup }
                        ),
                    ],
                };
            })
        );
    }

    function mapSet(
        exerciseId: string,
        setId: number,
        updater: (set: WorkoutSet) => WorkoutSet
    ) {
        setWorkoutExercises((current) =>
            current.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                return {
                    ...exercise,
                    sets: exercise.sets.map((set) =>
                        set.id === setId ? updater(set) : set
                    ),
                };
            })
        );
    }

    function deleteSet(exerciseId: string, setId: number) {
        setWorkoutExercises((current) =>
            current.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                return {
                    ...exercise,
                    sets: exercise.sets.filter((set) => set.id !== setId),
                };
            })
        );
    }

    function duplicateSet(exerciseId: string, setId: number) {
        setWorkoutExercises((current) =>
            current.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                const source = exercise.sets.find(
                    (set) => set.id === setId
                );

                if (!source) {
                    return exercise;
                }

                const copy: WorkoutSet = {
                    ...source,
                    id: Date.now() + Math.random(),
                    completed: false,
                };

                const index = exercise.sets.findIndex(
                    (set) => set.id === setId
                );
                const sets = [...exercise.sets];
                sets.splice(index + 1, 0, copy);

                return { ...exercise, sets };
            })
        );
    }

    function toggleWarmup(exerciseId: string, setId: number) {
        mapSet(exerciseId, setId, (set) => ({
            ...set,
            isWarmup: !set.isWarmup,
        }));
    }

    function updateWeight(
        exerciseId: string,
        setId: number,
        value: string
    ) {
        mapSet(exerciseId, setId, (set) => ({ ...set, weight: value }));
    }

    function updateReps(
        exerciseId: string,
        setId: number,
        value: string
    ) {
        mapSet(exerciseId, setId, (set) => ({ ...set, reps: value }));
    }

    function updateDuration(
        exerciseId: string,
        setId: number,
        value: string
    ) {
        mapSet(exerciseId, setId, (set) => ({
            ...set,
            duration: value,
        }));
    }

    function updateRestSeconds(
        exerciseId: string,
        seconds: number
    ) {
        setWorkoutExercises((current) =>
            current.map((exercise) =>
                exercise.id === exerciseId
                    ? { ...exercise, restSeconds: seconds }
                    : exercise
            )
        );
    }

    function updateNotes(exerciseId: string, notes: string) {
        setWorkoutExercises((current) =>
            current.map((exercise) =>
                exercise.id === exerciseId
                    ? { ...exercise, notes }
                    : exercise
            )
        );
    }

    function toggleCompleted(
        exerciseId: string,
        setId: number
    ): boolean {
        let becameCompleted = false;

        setWorkoutExercises((current) =>
            current.map((exercise) => {
                if (exercise.id !== exerciseId) {
                    return exercise;
                }

                return {
                    ...exercise,
                    sets: exercise.sets.map((set) => {
                        if (set.id !== setId) {
                            return set;
                        }

                        const completed = !set.completed;

                        if (completed) {
                            becameCompleted = true;
                        }

                        return { ...set, completed };
                    }),
                };
            })
        );

        return becameCompleted;
    }

    function setRestEndsAt(value: number | null) {
        setRestEndsAtState(value);
    }

    function clearWorkout() {
        setWorkoutExercises([]);
        setWorkoutStartedAt(null);
        setRestEndsAtState(null);
        setWorkoutNameState('Workout');
    }

    const isWorkoutActive = workoutStartedAt !== null;

    return (
        <WorkoutContext.Provider
            value={{
                workoutExercises,
                workoutStartedAt,
                restEndsAt,
                workoutName,
                isWorkoutActive,
                hydrated,
                addExercise,
                removeExercise,
                moveExercise,
                addSet,
                deleteSet,
                duplicateSet,
                toggleWarmup,
                updateWeight,
                updateReps,
                updateDuration,
                updateNotes,
                updateRestSeconds,
                toggleCompleted,
                setRestEndsAt,
                clearWorkout,
                ensureWorkoutStarted,
                startEmptyWorkout,
                startRoutine,
                startFromHistory,
                replaceExercise,
                setWorkoutName,
            }}
        >
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkout() {
    const context = useContext(WorkoutContext);

    if (!context) {
        throw new Error(
            'useWorkout must be used inside WorkoutProvider'
        );
    }

    return context;
}
