import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export type Routine = {
    id: string;
    name: string;
    exerciseIds: string[];
};

type RoutineContextType = {
    routines: Routine[];

    addRoutine: (
        name: string,
        exerciseIds: string[]
    ) => void;

    updateRoutine: (
        routineId: string,
        name: string,
        exerciseIds: string[]
    ) => void;

    deleteRoutine: (
        routineId: string
    ) => void;

    duplicateRoutine: (
        routineId: string
    ) => string | null;

    replaceRoutines: (next: Routine[]) => void;

    loading: boolean;
};

const RoutineContext =
    createContext<RoutineContextType | undefined>(
        undefined
    );

const STORAGE_KEY = 'workout-routines';

const defaultRoutines: Routine[] = [
    {
        id: 'push-day',
        name: 'Push Day',
        exerciseIds: [
            'bench-press',
            'incline-dumbbell-press',
            'lateral-raise',
            'tricep-pushdown',
        ],
    },

    {
        id: 'pull-day',
        name: 'Pull Day',
        exerciseIds: [
            'pull-up',
            'barbell-row',
            'lat-pulldown',
            'dumbbell-bicep-curl',
        ],
    },

    {
        id: 'leg-day',
        name: 'Leg Day',
        exerciseIds: [
            'barbell-squat',
            'romanian-deadlift',
            'leg-press',
            'standing-calf-raise',
        ],
    },
];

export function RoutineProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [routines, setRoutines] =
        useState<Routine[]>(defaultRoutines);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        loadRoutines();
    }, []);

    async function loadRoutines() {
        try {
            const savedData =
                await AsyncStorage.getItem(
                    STORAGE_KEY
                );

            if (savedData) {
                const parsedRoutines: Routine[] =
                    JSON.parse(savedData);

                setRoutines(parsedRoutines);
            }
        } catch (error) {
            console.log(
                'Failed to load routines:',
                error
            );
        } finally {
            setLoading(false);
        }
    }

    async function saveToStorage(
        updatedRoutines: Routine[]
    ) {
        try {
            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(updatedRoutines)
            );
        } catch (error) {
            console.log(
                'Failed to save routines:',
                error
            );
        }
    }

    function addRoutine(
        name: string,
        exerciseIds: string[]
    ) {
        const newRoutine: Routine = {
            id: `routine-${Date.now()}`,
            name: name.trim(),
            exerciseIds,
        };

        setRoutines((currentRoutines) => {
            const updatedRoutines = [
                ...currentRoutines,
                newRoutine,
            ];

            saveToStorage(updatedRoutines);

            return updatedRoutines;
        });
    }

    function updateRoutine(
        routineId: string,
        name: string,
        exerciseIds: string[]
    ) {
        setRoutines((currentRoutines) => {
            const updatedRoutines =
                currentRoutines.map((routine) => {
                    if (routine.id !== routineId) {
                        return routine;
                    }

                    return {
                        ...routine,
                        name: name.trim(),
                        exerciseIds,
                    };
                });

            saveToStorage(updatedRoutines);

            return updatedRoutines;
        });
    }

    function deleteRoutine(
        routineId: string
    ) {
        setRoutines((currentRoutines) => {
            const updatedRoutines =
                currentRoutines.filter(
                    (routine) =>
                        routine.id !== routineId
                );

            saveToStorage(updatedRoutines);

            return updatedRoutines;
        });
    }

    function duplicateRoutine(
        routineId: string
    ) {
        const source = routines.find(
            (routine) => routine.id === routineId
        );

        if (!source) {
            return null;
        }

        const copy: Routine = {
            id: `routine-${Date.now()}`,
            name: `${source.name} Copy`,
            exerciseIds: [...source.exerciseIds],
        };

        setRoutines((currentRoutines) => {
            const updatedRoutines = [
                ...currentRoutines,
                copy,
            ];

            saveToStorage(updatedRoutines);

            return updatedRoutines;
        });

        return copy.id;
    }

    function replaceRoutines(next: Routine[]) {
        setRoutines(next);
        saveToStorage(next);
    }

    return (
        <RoutineContext.Provider
            value={{
                routines,
                addRoutine,
                updateRoutine,
                deleteRoutine,
                duplicateRoutine,
                replaceRoutines,
                loading,
            }}
        >
            {children}
        </RoutineContext.Provider>
    );
}

export function useRoutines() {
    const context =
        useContext(RoutineContext);

    if (!context) {
        throw new Error(
            'useRoutines must be used inside RoutineProvider'
        );
    }

    return context;
}