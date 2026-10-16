import { TrackingType } from '@/data/exercises';
import { WeightUnit } from '@/context/settings-context';

export type LoggedSet = {
    weight?: string;
    reps?: string;
    duration?: string;
    rir?: string;
    isWarmup?: boolean;
    completed?: boolean;
};

export type LoggedExercise = {
    id: string;
    name: string;
    tracking?: TrackingType;
    sets: LoggedSet[];
};

const KG_TO_LB = 2.2046226218;

export function toPounds(
    weight: number,
    unit: WeightUnit
) {
    return unit === 'kg' ? weight * KG_TO_LB : weight;
}

export function fromPounds(
    weightInPounds: number,
    unit: WeightUnit
) {
    return unit === 'kg'
        ? weightInPounds / KG_TO_LB
        : weightInPounds;
}

export function isWorkingSet(set: LoggedSet) {
    return !set.isWarmup;
}

export function firstWorkingSet<T extends LoggedSet>(
    sets: T[]
) {
    return sets.find((set) => isWorkingSet(set)) ?? sets[0];
}

export function bumpNumber(value: string, delta: number) {
    const current = Number(value) || 0;
    const next = Math.max(0, current + delta);
    const rounded = Math.round(next * 10) / 10;

    if (Number.isInteger(rounded)) {
        return String(rounded);
    }

    return rounded.toFixed(1);
}

export function nextWeightHint(
    exercise: LoggedExercise,
    unit: WeightUnit
) {
    const last = [...exercise.sets]
        .reverse()
        .find(
            (set) =>
                isWorkingSet(set) &&
                Number(set.weight) > 0 &&
                Number(set.reps) > 0
        );

    if (!last || exercise.tracking === 'duration') {
        return null;
    }

    const weight = Number(last.weight);
    const reps = Number(last.reps);
    const rir = Number(last.rir);
    const hasRir = (last.rir ?? '').trim() !== '' && !Number.isNaN(rir);
    const rirLabel = last.rir === '4' ? '4+' : last.rir;

    if (hasRir && rir < 3) {
        return `${exercise.name} · last ${weight} × ${reps}, RIR ${rirLabel} → stay at ${weight}`;
    }

    if (reps < 5) {
        return null;
    }

    const step = unit === 'kg' ? 2.5 : 5;
    const heavier = bumpNumber(String(weight), step);

    return `${exercise.name} · last ${weight} × ${reps}${
        hasRir ? `, RIR ${rirLabel}` : ''
    } → try ${heavier}`;
}

export function nextWeightHints(
    workouts: { exercises: LoggedExercise[] }[],
    unit: WeightUnit,
    limit = 2
) {
    const latest = workouts[0];

    if (!latest) {
        return [];
    }

    return latest.exercises
        .map((exercise) => nextWeightHint(exercise, unit))
        .filter((hint): hint is string => Boolean(hint))
        .slice(0, limit);
}

export function prefillFromPrevious(sets?: LoggedSet[]) {
    if (!sets?.length) {
        return undefined;
    }

    const set = firstWorkingSet(sets);

    if (!set) {
        return undefined;
    }

    const weight = (set.weight ?? '').trim();
    const reps = (set.reps ?? '').trim();
    const duration = (set.duration ?? '').trim();

    if (!weight && !reps && !duration) {
        return undefined;
    }

    return {
        weight: set.weight ?? '',
        reps: set.reps ?? '',
        duration: set.duration ?? '',
    };
}

export function setHasData(
    set: LoggedSet,
    tracking: TrackingType = 'weight_reps'
) {
    if (tracking === 'duration') {
        return (set.duration ?? '').trim() !== '';
    }

    if (tracking === 'bodyweight') {
        return (set.reps ?? '').trim() !== '';
    }

    return (
        (set.weight ?? '').trim() !== '' &&
        (set.reps ?? '').trim() !== ''
    );
}

export function formatClock(seconds: number) {
    const safe = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safe / 60);
    const remainder = safe % 60;

    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export function formatDurationLong(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes} min`;
    }

    return `${remainder}s`;
}

export function formatSetLabel(
    set: LoggedSet,
    tracking: TrackingType = 'weight_reps',
    unit: WeightUnit = 'lb'
) {
    if (tracking === 'duration') {
        const seconds = Number(set.duration) || 0;
        return seconds > 0 ? `${seconds}s` : '—';
    }

    const reps = (set.reps ?? '').trim();
    const weight = (set.weight ?? '').trim();

    if (tracking === 'bodyweight') {
        if (weight && reps) {
            return `${weight} ${unit} × ${reps}`;
        }

        return reps ? `${reps} reps` : '—';
    }

    if (weight && reps) {
        return `${weight} × ${reps}`;
    }

    return '—';
}

export function setVolume(
    set: LoggedSet,
    unit: WeightUnit,
    fallbackWeight = 0
) {
    if (set.isWarmup) {
        return 0;
    }

    const entered = Number(set.weight) || 0;
    const weight = entered > 0 ? entered : fallbackWeight;
    const reps = Number(set.reps) || 0;

    return toPounds(weight, unit) * reps;
}

export function workoutVolumeLb(
    exercises: LoggedExercise[],
    unit: WeightUnit,
    bodyWeightLb?: number | null
) {
    const fallback =
        bodyWeightLb && bodyWeightLb > 0
            ? fromPounds(bodyWeightLb, unit)
            : 0;

    return exercises.reduce((total, exercise) => {
        const bodyweightFallback =
            exercise.tracking === 'bodyweight' ? fallback : 0;

        return (
            total +
            exercise.sets.reduce(
                (sum, set) =>
                    sum + setVolume(set, unit, bodyweightFallback),
                0
            )
        );
    }, 0);
}

export function workingSetCount(exercises: LoggedExercise[]) {
    return exercises.reduce(
        (total, exercise) =>
            total +
            exercise.sets.filter(
                (set) => isWorkingSet(set)
            ).length,
        0
    );
}

export function estimatedOneRepMaxLb(
    weight: number,
    reps: number,
    unit: WeightUnit
) {
    if (weight <= 0 || reps < 1 || reps > 12) {
        return 0;
    }

    return toPounds(weight, unit) * (1 + reps / 30);
}

export function bestWorkingSet(
    exercise: LoggedExercise,
    unit: WeightUnit
) {
    let best:
        | {
              weight: number;
              reps: number;
              estimatedLb: number;
          }
        | undefined;

    for (const set of exercise.sets) {
        if (!isWorkingSet(set)) {
            continue;
        }

        const weight = Number(set.weight) || 0;
        const reps = Number(set.reps) || 0;
        const estimatedLb = estimatedOneRepMaxLb(
            weight,
            reps,
            unit
        );

        if (estimatedLb <= 0) {
            continue;
        }

        if (!best || estimatedLb > best.estimatedLb) {
            best = { weight, reps, estimatedLb };
        }
    }

    return best;
}

export function startOfWeek(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    const offset = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - offset);
    return start;
}

export function dayKey(date: Date | string) {
    const value = typeof date === 'string' ? new Date(date) : date;
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}
