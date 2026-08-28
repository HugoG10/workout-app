import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { WeightUnit } from '@/context/settings-context';
import { WorkoutExercise } from '@/context/workout-context';
import {
    bestWorkingSet,
    dayKey,
    fromPounds,
    isWorkingSet,
    startOfWeek,
    toPounds,
    workoutVolumeLb,
    workingSetCount,
} from '@/lib/workout-stats';

export type SavedWorkout = {
    id: number;
    date: string;
    durationSeconds: number;
    weightUnit: WeightUnit;
    exercises: WorkoutExercise[];
};

export type ExercisePR = {
    heaviestWeight: number;
    bestWeight: number;
    bestReps: number;
    estimatedOneRepMax: number;
    highestVolumeSet: number;
    totalSessions: number;
    unit: WeightUnit;
};

export type ExerciseProgressPoint = {
    date: string;
    weight: number;
    reps: number;
    estimatedOneRepMax: number;
    unit: WeightUnit;
};

export type WorkoutRecap = {
    durationSeconds: number;
    volume: number;
    setCount: number;
    exerciseCount: number;
    unit: WeightUnit;
    prs: { name: string; detail: string }[];
    insight: string | null;
};

export type WeekStats = {
    workouts: number;
    volume: number;
    sets: number;
    streak: number;
    unit: WeightUnit;
};

type HistoryContextType = {
    workouts: SavedWorkout[];
    lastRecap: WorkoutRecap | null;

    getPreviousExercise: (
        exerciseId: string
    ) => WorkoutExercise | undefined;

    getExercisePR: (
        exerciseId: string,
        displayUnit: WeightUnit
    ) => ExercisePR | undefined;

    getExerciseProgress: (
        exerciseId: string,
        displayUnit: WeightUnit
    ) => ExerciseProgressPoint[];

    getWeekStats: (displayUnit: WeightUnit) => WeekStats;

    saveWorkout: (
        exercises: WorkoutExercise[],
        durationSeconds: number,
        weightUnit: WeightUnit
    ) => WorkoutRecap;

    deleteWorkout: (workoutId: number) => void;

    clearHistory: () => void;

    replaceWorkouts: (next: SavedWorkout[]) => void;

    loading: boolean;
};

const HistoryContext =
    createContext<HistoryContextType | undefined>(undefined);

function normalizeWorkout(
    workout: Partial<SavedWorkout>
): SavedWorkout {
    return {
        id: workout.id ?? Date.now(),
        date: workout.date ?? new Date().toISOString(),
        durationSeconds: workout.durationSeconds ?? 0,
        weightUnit: workout.weightUnit ?? 'lb',
        exercises: (workout.exercises ?? []).map((exercise) => ({
            ...exercise,
            notes: exercise.notes ?? '',
            tracking: exercise.tracking ?? 'weight_reps',
            sets: exercise.sets.map((set) => ({
                ...set,
                duration: set.duration ?? '',
                isWarmup: set.isWarmup ?? false,
            })),
        })),
    };
}
const STORAGE_KEY = 'workout-history';
const RECAP_KEY = 'last-workout-recap';

export function HistoryProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
    const [lastRecap, setLastRecap] = useState<WorkoutRecap | null>(
        null
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkouts();
    }, []);

    async function loadWorkouts() {
        try {
            const [savedData, savedRecap] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEY),
                AsyncStorage.getItem(RECAP_KEY),
            ]);

            if (savedData) {
                const parsedWorkouts = JSON.parse(savedData);

                setWorkouts(
                    parsedWorkouts.map(
                        (workout: Partial<SavedWorkout>) =>
                            normalizeWorkout(workout)
                    )
                );
            }

            if (savedRecap) {
                setLastRecap(JSON.parse(savedRecap));
            }
        } catch (error) {
            console.log('Failed to load workouts:', error);
        } finally {
            setLoading(false);
        }
    }

    function saveToStorage(updatedWorkouts: SavedWorkout[]) {
        AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedWorkouts)
        ).catch((error) => {
            console.log('Failed to save workouts:', error);
        });
    }

    function persistRecap(recap: WorkoutRecap | null) {
        setLastRecap(recap);

        if (!recap) {
            AsyncStorage.removeItem(RECAP_KEY).catch(() => {});
            return;
        }

        AsyncStorage.setItem(RECAP_KEY, JSON.stringify(recap)).catch(
            (error) => {
                console.log('Failed to save recap:', error);
            }
        );
    }

    function getPreviousExercise(
        exerciseId: string
    ): WorkoutExercise | undefined {
        for (const workout of workouts) {
            const exercise = workout.exercises.find(
                (item) => item.id === exerciseId
            );

            if (exercise) {
                return exercise;
            }
        }

        return undefined;
    }

    function getExercisePR(
        exerciseId: string,
        displayUnit: WeightUnit
    ): ExercisePR | undefined {
        let heaviestWeightLb = 0;
        let bestWeightLb = 0;
        let bestReps = 0;
        let estimatedOneRepMaxLb = 0;
        let highestVolumeSetLb = 0;
        let totalSessions = 0;

        for (const workout of workouts) {
            const exercise = workout.exercises.find(
                (item) => item.id === exerciseId
            );

            if (!exercise) {
                continue;
            }

            totalSessions += 1;
            const workoutUnit = workout.weightUnit ?? 'lb';

            for (const set of exercise.sets) {
                if (!isWorkingSet(set)) {
                    continue;
                }

                const rawWeight = Number(set.weight) || 0;
                const reps = Number(set.reps) || 0;

                if (rawWeight <= 0 || reps <= 0) {
                    continue;
                }

                const weightLb = toPounds(rawWeight, workoutUnit);

                if (weightLb > heaviestWeightLb) {
                    heaviestWeightLb = weightLb;
                }

                if (reps >= 1 && reps <= 12) {
                    const estimatedLb = weightLb * (1 + reps / 30);

                    if (estimatedLb > estimatedOneRepMaxLb) {
                        estimatedOneRepMaxLb = estimatedLb;
                        bestWeightLb = weightLb;
                        bestReps = reps;
                    }
                }

                const setVolumeLb = weightLb * reps;

                if (setVolumeLb > highestVolumeSetLb) {
                    highestVolumeSetLb = setVolumeLb;
                }
            }
        }

        if (totalSessions === 0) {
            return undefined;
        }

        return {
            heaviestWeight: fromPounds(heaviestWeightLb, displayUnit),
            bestWeight: fromPounds(bestWeightLb, displayUnit),
            bestReps,
            estimatedOneRepMax: fromPounds(
                estimatedOneRepMaxLb,
                displayUnit
            ),
            highestVolumeSet: fromPounds(
                highestVolumeSetLb,
                displayUnit
            ),
            totalSessions,
            unit: displayUnit,
        };
    }

    function getExerciseProgress(
        exerciseId: string,
        displayUnit: WeightUnit
    ): ExerciseProgressPoint[] {
        const progress: ExerciseProgressPoint[] = [];

        for (const workout of workouts) {
            const exercise = workout.exercises.find(
                (item) => item.id === exerciseId
            );

            if (!exercise) {
                continue;
            }

            const best = bestWorkingSet(
                exercise,
                workout.weightUnit ?? 'lb'
            );

            if (!best) {
                continue;
            }

            progress.push({
                date: workout.date,
                weight: fromPounds(toPounds(best.weight, workout.weightUnit ?? 'lb'), displayUnit),
                reps: best.reps,
                estimatedOneRepMax: fromPounds(
                    best.estimatedLb,
                    displayUnit
                ),
                unit: displayUnit,
            });
        }

        return progress.sort(
            (a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }

    function getStreak() {
        const days = [
            ...new Set(workouts.map((workout) => dayKey(workout.date))),
        ].sort();

        if (days.length === 0) {
            return 0;
        }

        const today = dayKey(new Date());
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = dayKey(yesterdayDate);

        let cursor = days.includes(today) ? today : yesterday;

        if (!days.includes(cursor)) {
            return 0;
        }

        let streak = 0;

        while (days.includes(cursor)) {
            streak += 1;
            const previous = new Date(`${cursor}T12:00:00`);
            previous.setDate(previous.getDate() - 1);
            cursor = dayKey(previous);
        }

        return streak;
    }

    function getWeekStats(displayUnit: WeightUnit): WeekStats {
        const weekStart = startOfWeek();

        const weekly = workouts.filter(
            (workout) => new Date(workout.date) >= weekStart
        );

        const volumeLb = weekly.reduce(
            (total, workout) =>
                total +
                workoutVolumeLb(
                    workout.exercises,
                    workout.weightUnit ?? 'lb'
                ),
            0
        );

        const sets = weekly.reduce(
            (total, workout) =>
                total + workingSetCount(workout.exercises),
            0
        );

        return {
            workouts: weekly.length,
            volume: fromPounds(volumeLb, displayUnit),
            sets,
            streak: getStreak(),
            unit: displayUnit,
        };
    }

    function buildRecap(
        exercises: WorkoutExercise[],
        durationSeconds: number,
        weightUnit: WeightUnit
    ): WorkoutRecap {
        const prs: WorkoutRecap['prs'] = [];
        let insight: string | null = null;
        let bestDelta = 0;

        for (const exercise of exercises) {
            const previous = getPreviousExercise(exercise.id);
            const currentBest = bestWorkingSet(exercise, weightUnit);
            const existingPr = getExercisePR(exercise.id, weightUnit);

            if (currentBest) {
                const estimated = fromPounds(
                    currentBest.estimatedLb,
                    weightUnit
                );

                if (
                    existingPr &&
                    estimated > existingPr.estimatedOneRepMax + 0.25
                ) {
                    prs.push({
                        name: exercise.name,
                        detail: `Est. 1RM ${Math.round(estimated)} ${weightUnit}`,
                    });
                } else if (
                    existingPr &&
                    currentBest.weight > existingPr.heaviestWeight + 0.25
                ) {
                    prs.push({
                        name: exercise.name,
                        detail: `${currentBest.weight} ${weightUnit} × ${currentBest.reps}`,
                    });
                } else if (!existingPr) {
                    prs.push({
                        name: exercise.name,
                        detail: 'First logged session',
                    });
                }
            }

            if (previous && currentBest) {
                const previousBest = bestWorkingSet(
                    previous,
                    weightUnit
                );

                if (previousBest) {
                    const delta = currentBest.weight - previousBest.weight;

                    if (delta > bestDelta) {
                        bestDelta = delta;
                        const sign = delta > 0 ? '+' : '';
                        insight = `${exercise.name} ${sign}${delta.toFixed(delta % 1 === 0 ? 0 : 1)} ${weightUnit} vs last time`;
                    }
                }
            }
        }

        if (!insight && prs.length > 0) {
            insight = `${prs[0].name} PR`;
        }

        return {
            durationSeconds,
            volume: fromPounds(
                workoutVolumeLb(exercises, weightUnit),
                weightUnit
            ),
            setCount: workingSetCount(exercises),
            exerciseCount: exercises.length,
            unit: weightUnit,
            prs,
            insight,
        };
    }

    function saveWorkout(
        exercises: WorkoutExercise[],
        durationSeconds: number,
        weightUnit: WeightUnit
    ) {
        const recap = buildRecap(
            exercises,
            durationSeconds,
            weightUnit
        );

        const workout: SavedWorkout = {
            id: Date.now(),
            date: new Date().toISOString(),
            durationSeconds,
            weightUnit,
            exercises,
        };

        setWorkouts((currentWorkouts) => {
            const updatedWorkouts = [workout, ...currentWorkouts];
            saveToStorage(updatedWorkouts);
            return updatedWorkouts;
        });

        persistRecap(recap);
        return recap;
    }

    function deleteWorkout(workoutId: number) {
        setWorkouts((currentWorkouts) => {
            const updatedWorkouts = currentWorkouts.filter(
                (workout) => workout.id !== workoutId
            );
            saveToStorage(updatedWorkouts);
            return updatedWorkouts;
        });
    }

    function clearHistory() {
        setWorkouts([]);
        persistRecap(null);
        AsyncStorage.removeItem(STORAGE_KEY).catch((error) => {
            console.log('Failed to clear history:', error);
        });
    }

    function replaceWorkouts(next: SavedWorkout[]) {
        const normalized = next.map((workout) =>
            normalizeWorkout(workout)
        );
        setWorkouts(normalized);
        saveToStorage(normalized);
    }

    return (
        <HistoryContext.Provider
            value={{
                workouts,
                lastRecap,
                getPreviousExercise,
                getExercisePR,
                getExerciseProgress,
                getWeekStats,
                saveWorkout,
                deleteWorkout,
                clearHistory,
                replaceWorkouts,
                loading,
            }}
        >
            {children}
        </HistoryContext.Provider>
    );
}

export function useHistory() {
    const context = useContext(HistoryContext);

    if (!context) {
        throw new Error(
            'useHistory must be used inside HistoryProvider'
        );
    }

    return context;
}
