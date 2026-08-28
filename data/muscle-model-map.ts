const MODEL_GROUPS = new Set([
    'chest',
    'frontDelts',
    'sideDelts',
    'rearDelts',
    'traps',
    'rhomboids',
    'teresMajor',
    'rotatorCuff',
    'biceps',
    'triceps',
    'brachialis',
    'forearms',
    'obliques',
    'lowerBack',
    'glutes',
    'gluteMedius',
    'gluteMinimus',
    'quads',
    'hamstrings',
    'adductors',
    'calves',
    'tibialisAnterior',
    'lats',
    'abs',
]);

export const muscleModelMap: Record<
    string,
    string[]
> = {
    Back: [
        'traps',
        'rhomboids',
        'teresMajor',
        'lowerBack',
        'lats',
    ],

    Biceps: [
        'biceps',
        'brachialis',
    ],

    Calves: [
        'calves',
    ],

    Chest: [
        'chest',
    ],

    Core: [
        'obliques',
        'abs',
    ],

    Forearms: [
        'forearms',
    ],

    Glutes: [
        'glutes',
        'gluteMedius',
        'gluteMinimus',
    ],

    Hamstrings: [
        'hamstrings',
    ],

    'Hip Flexors': [],

    Lats: [
        'lats',
    ],

    Quadriceps: [
        'quads',
    ],

    'Rear Delts': [
        'rearDelts',
    ],

    Shoulders: [
        'frontDelts',
        'sideDelts',
        'rearDelts',
    ],

    Triceps: [
        'triceps',
    ],

    'Upper Back': [
        'traps',
        'rhomboids',
        'teresMajor',
        'rotatorCuff',
    ],

    'Upper Chest': [
        'chest',
        'frontDelts',
    ],
};

export function getModelMuscleGroups(
    muscles: string[]
): string[] {
    const groups = muscles.flatMap(
        (muscle) => {
            // Already a direct 3D model group.
            if (MODEL_GROUPS.has(muscle)) {
                return [muscle];
            }

            // Human-readable exercise muscle name.
            return muscleModelMap[muscle] ?? [];
        }
    );

    return [...new Set(groups)];
}