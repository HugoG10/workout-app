import { dayKey } from '@/lib/workout-stats';

type RecoveryWorkout = {
    date: string;
    exercises: {
        primaryMuscle: string;
        secondaryMuscles?: string[];
        sets: { isWarmup?: boolean }[];
    }[];
};

export type MuscleRecovery = {
    muscle: string;
    recovered: number;
};

const RECOVERY_DAYS = 7;

export function muscleRecovery(
    workouts: RecoveryWorkout[],
    now = Date.now()
): MuscleRecovery[] {
    const fatigue: Record<string, number> = {};
    const windowMs = RECOVERY_DAYS * 24 * 60 * 60 * 1000;

    for (const workout of workouts) {
        const age = now - new Date(workout.date).getTime();

        if (age < 0 || age > windowMs) {
            continue;
        }

        const freshness = 1 - age / windowMs;

        for (const exercise of workout.exercises) {
            const working = exercise.sets.filter(
                (set) => !set.isWarmup
            ).length;

            if (working === 0) {
                continue;
            }

            const hit = Math.min(1, working / 8);
            const load = freshness * hit;

            addFatigue(fatigue, exercise.primaryMuscle, load);
            for (const muscle of exercise.secondaryMuscles ?? []) {
                addFatigue(fatigue, muscle, load * 0.45);
            }
        }
    }

    return Object.entries(fatigue)
        .map(([muscle, value]) => ({
            muscle,
            recovered: Math.max(0, Math.round((1 - value) * 100)),
        }))
        .sort((left, right) => left.recovered - right.recovered);
}

function addFatigue(
    fatigue: Record<string, number>,
    muscle: string,
    amount: number
) {
    const name = muscle.trim();

    if (!name) {
        return;
    }

    fatigue[name] = Math.min(1, (fatigue[name] ?? 0) + amount);
}

export function trainedDayKeys(workouts: { date: string }[]) {
    return new Set(workouts.map((workout) => dayKey(workout.date)));
}

export function monthCells(anchor = new Date()) {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const pad = firstWeekday === 0 ? 6 : firstWeekday - 1;
    const cells: Array<number | null> = [
        ...Array.from({ length: pad }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    return {
        year,
        month,
        label: anchor.toLocaleDateString([], {
            month: 'long',
            year: 'numeric',
        }),
        cells,
    };
}
