import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    Exercise,
    TrackingType,
    exercises as catalogExercises,
    trackingFor,
} from '@/data/exercises';

type CatalogContextType = {
    exercises: Exercise[];
    customExercises: Exercise[];
    getExercise: (id: string) => Exercise | undefined;
    addCustomExercise: (input: {
        name: string;
        primaryMuscle: string;
        equipment: string;
        tracking: TrackingType;
    }) => Exercise;
    deleteCustomExercise: (id: string) => void;
    replaceCustomExercises: (next: Exercise[]) => void;
    loading: boolean;
};

const CatalogContext =
    createContext<CatalogContextType | undefined>(
        undefined
    );

const STORAGE_KEY = 'custom-exercises';

export function ExerciseCatalogProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [customExercises, setCustomExercises] =
        useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustom();
    }, []);

    async function loadCustom() {
        try {
            const saved =
                await AsyncStorage.getItem(STORAGE_KEY);

            if (saved) {
                setCustomExercises(JSON.parse(saved));
            }
        } catch (error) {
            console.log(
                'Failed to load custom exercises:',
                error
            );
        } finally {
            setLoading(false);
        }
    }

    function persist(next: Exercise[]) {
        AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(next)
        ).catch((error) => {
            console.log(
                'Failed to save custom exercises:',
                error
            );
        });
    }

    const exercises = useMemo(
        () => [...customExercises, ...catalogExercises],
        [customExercises]
    );

    function getExercise(id: string) {
        return exercises.find(
            (exercise) => exercise.id === id
        );
    }

    function addCustomExercise(input: {
        name: string;
        primaryMuscle: string;
        equipment: string;
        tracking: TrackingType;
    }) {
        const exercise: Exercise = {
            id: `custom-${Date.now()}`,
            name: input.name.trim(),
            primaryMuscle: input.primaryMuscle,
            secondaryMuscles: [],
            equipment: input.equipment,
            difficulty: 'Beginner',
            category:
                input.tracking === 'weight_reps'
                    ? 'Strength'
                    : 'Bodyweight',
            tracking: input.tracking,
            isCustom: true,
            instructions: [],
            commonMistakes: [],
            tips: [],
        };

        setCustomExercises((current) => {
            const next = [exercise, ...current];
            persist(next);
            return next;
        });

        return exercise;
    }

    function deleteCustomExercise(id: string) {
        setCustomExercises((current) => {
            const next = current.filter(
                (exercise) => exercise.id !== id
            );
            persist(next);
            return next;
        });
    }

    function replaceCustomExercises(next: Exercise[]) {
        setCustomExercises(next);
        persist(next);
    }

    return (
        <CatalogContext.Provider
            value={{
                exercises,
                customExercises,
                getExercise,
                addCustomExercise,
                deleteCustomExercise,
                replaceCustomExercises,
                loading,
            }}
        >
            {children}
        </CatalogContext.Provider>
    );
}

export function useExerciseCatalog() {
    const context = useContext(CatalogContext);

    if (!context) {
        throw new Error(
            'useExerciseCatalog must be used inside ExerciseCatalogProvider'
        );
    }

    return context;
}

export { trackingFor };
