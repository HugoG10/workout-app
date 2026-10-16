import { Alert } from 'react-native';

import { Routine } from '@/context/routine-context';

export function promptSaveAsRoutine({
    name,
    exerciseIds,
    routines,
    addRoutine,
    updateRoutine,
}: {
    name: string;
    exerciseIds: string[];
    routines: Routine[];
    addRoutine: (name: string, exerciseIds: string[]) => void;
    updateRoutine: (
        routineId: string,
        name: string,
        exerciseIds: string[]
    ) => void;
}) {
    const title = name.trim() || 'Workout';

    if (exerciseIds.length === 0) {
        Alert.alert(
            'Nothing to save',
            'This workout has no exercises.'
        );
        return;
    }

    const existing = routines.find(
        (routine) =>
            routine.name.trim().toLowerCase() === title.toLowerCase()
    );

    function saved(message: string) {
        Alert.alert('Routine saved', message);
    }

    if (!existing) {
        addRoutine(title, exerciseIds);
        saved(`${title} is on the Workout tab.`);
        return;
    }

    Alert.alert(
        'Routine already exists',
        `"${existing.name}" is already saved.`,
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Update',
                onPress: () => {
                    updateRoutine(
                        existing.id,
                        existing.name,
                        exerciseIds
                    );
                    saved(`${existing.name} now matches this session.`);
                },
            },
            {
                text: 'Save a copy',
                onPress: () => {
                    addRoutine(`${title} 2`, exerciseIds);
                    saved(`${title} 2 is on the Workout tab.`);
                },
            },
        ]
    );
}
