import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const APPLE_HEALTH_ENABLED_KEY = 'apple-health-enabled';
export const BODY_WEIGHT_LB_KEY = 'body-weight-lb';

export type AppleHealthAvailability =
    | 'ready'
    | 'expo-go'
    | 'unavailable';

export type HealthWorkoutPayload = {
    id: number;
    date: string;
    name: string;
    durationSeconds: number;
};

const WRITE_TYPES = [
    'HKWorkoutTypeIdentifier',
    'HKQuantityTypeIdentifierActiveEnergyBurned',
] as const;

const TRADITIONAL_STRENGTH_TRAINING = 50;

type HealthKitModule = typeof import('@kingstinct/react-native-healthkit');

let cachedKit: HealthKitModule | null | undefined;

export function isExpoGo() {
    return (
        Constants.appOwnership === 'expo' ||
        Constants.executionEnvironment === 'storeClient'
    );
}

export function appleHealthAvailability(): AppleHealthAvailability {
    if (Platform.OS !== 'ios') {
        return 'unavailable';
    }

    if (isExpoGo()) {
        return 'expo-go';
    }

    return 'ready';
}

export function canUseAppleHealth() {
    return appleHealthAvailability() === 'ready';
}

export function appleHealthStatusLabel(enabled: boolean) {
    const availability = appleHealthAvailability();

    if (availability === 'expo-go') {
        return 'Needs build';
    }

    if (availability !== 'ready') {
        return 'iPhone only';
    }

    return enabled ? 'On' : 'Off';
}

function loadHealthKit() {
    if (cachedKit !== undefined) {
        return cachedKit;
    }

    if (!canUseAppleHealth()) {
        cachedKit = null;
        return null;
    }

    try {
        cachedKit = require('@kingstinct/react-native-healthkit') as HealthKitModule;
        return cachedKit;
    } catch (error) {
        console.log('Apple Health module missing:', error);
        cachedKit = null;
        return null;
    }
}

export async function isAppleHealthEnabled() {
    try {
        const value = await AsyncStorage.getItem(
            APPLE_HEALTH_ENABLED_KEY
        );
        return value === 'true';
    } catch {
        return false;
    }
}

async function storedBodyWeightLb() {
    try {
        const value = await AsyncStorage.getItem(BODY_WEIGHT_LB_KEY);
        const parsed = Number(value);
        return parsed > 0 ? parsed : null;
    } catch {
        return null;
    }
}

function estimatedActiveEnergyKcal(
    durationSeconds: number,
    bodyWeightLb: number | null
) {
    const minutes = Math.max(1, durationSeconds / 60);

    if (!bodyWeightLb) {
        return Math.round(minutes * 6);
    }

    const kg = bodyWeightLb / 2.2046226218;
    return Math.max(1, Math.round(6 * kg * (minutes / 60)));
}

export async function beginLiveHealthWorkout() {
    const enabled = await isAppleHealthEnabled();

    if (!enabled || !canUseAppleHealth()) {
        return false;
    }

    const kit = loadHealthKit();

    if (!kit || !kit.isHealthDataAvailable()) {
        return false;
    }

    try {
        const allowed = await ensureWriteAccess(kit);

        if (!allowed) {
            return false;
        }

        const activityType =
            kit.WorkoutActivityType.traditionalStrengthTraining ??
            TRADITIONAL_STRENGTH_TRAINING;

        await kit.startWatchApp({
            activityType,
            locationType: kit.WorkoutSessionLocationType.indoor,
        });

        return true;
    } catch (error) {
        console.log('Apple Watch session did not start:', error);
        return false;
    }
}

function workoutWindow(workout: HealthWorkoutPayload) {
    const end = new Date(workout.date);
    const safeEnd = Number.isNaN(end.getTime()) ? new Date() : end;
    const seconds = Math.max(60, workout.durationSeconds || 0);
    const start = new Date(safeEnd.getTime() - seconds * 1000);

    return { start, end: safeEnd };
}

async function ensureWriteAccess(kit: HealthKitModule) {
    await kit.requestAuthorization({
        toShare: [...WRITE_TYPES],
    });

    return (
        kit.authorizationStatusFor('HKWorkoutTypeIdentifier') ===
        kit.AuthorizationStatus.sharingAuthorized
    );
}

export async function connectAppleHealth(): Promise<
    'connected' | 'expo-go' | 'unavailable' | 'denied'
> {
    const availability = appleHealthAvailability();

    if (availability === 'expo-go') {
        return 'expo-go';
    }

    if (availability !== 'ready') {
        return 'unavailable';
    }

    const kit = loadHealthKit();

    if (!kit || !kit.isHealthDataAvailable()) {
        return 'unavailable';
    }

    try {
        const allowed = await ensureWriteAccess(kit);
        return allowed ? 'connected' : 'denied';
    } catch (error) {
        console.log('Apple Health connect failed:', error);
        return 'unavailable';
    }
}

export async function syncFinishedWorkout(
    workout: HealthWorkoutPayload
) {
    const enabled = await isAppleHealthEnabled();

    if (!enabled || !canUseAppleHealth()) {
        return false;
    }

    const kit = loadHealthKit();

    if (!kit || !kit.isHealthDataAvailable()) {
        return false;
    }

    try {
        const allowed = await ensureWriteAccess(kit);

        if (!allowed) {
            return false;
        }

        const { start, end } = workoutWindow(workout);
        const activityType =
            kit.WorkoutActivityType.traditionalStrengthTraining ??
            TRADITIONAL_STRENGTH_TRAINING;
        const bodyWeightLb = await storedBodyWeightLb();

        await kit.saveWorkoutSample(
            activityType,
            [],
            start,
            end,
            {
                energyBurned: estimatedActiveEnergyKcal(
                    workout.durationSeconds,
                    bodyWeightLb
                ),
            },
            {
                HKMetadataKeyIndoorWorkout: true,
                HKMetadataKeySyncIdentifier: `workout-app-${workout.id}`,
                HKMetadataKeySyncVersion: 1,
            }
        );

        return true;
    } catch (error) {
        console.log('Apple Health sync failed:', error);
        return false;
    }
}

export async function syncWorkoutsToAppleHealth(
    workouts: HealthWorkoutPayload[]
) {
    let saved = 0;

    for (const workout of workouts) {
        const ok = await syncFinishedWorkout(workout);

        if (ok) {
            saved += 1;
        }
    }

    return saved;
}
