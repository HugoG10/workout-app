import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { useWorkout } from '@/context/workout-context';
import {
    cancelRestAlert,
    scheduleRestAlert,
} from '@/lib/rest-notifications';

export function AutoLock() {
    const { isUnlocked, lock } = useAuth();
    const { lockAfterSeconds } = useSettings();
    const backgroundedAt = useRef<number | null>(null);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'background') {
                backgroundedAt.current = Date.now();

                if (isUnlocked && lockAfterSeconds === 0) {
                    lock();
                }

                return;
            }

            if (state !== 'active' || !isUnlocked) {
                return;
            }

            if (
                lockAfterSeconds > 0 &&
                backgroundedAt.current &&
                Date.now() - backgroundedAt.current >=
                    lockAfterSeconds * 1000
            ) {
                lock();
            }

            backgroundedAt.current = null;
        });

        return () => sub.remove();
    }, [isUnlocked, lock, lockAfterSeconds]);

    return null;
}

export function RestNotifier() {
    const { restEndsAt } = useWorkout();
    const { restAlertsEnabled } = useSettings();

    useEffect(() => {
        if (
            !restAlertsEnabled ||
            !restEndsAt ||
            restEndsAt <= Date.now()
        ) {
            cancelRestAlert();
            return;
        }

        scheduleRestAlert(restEndsAt);

        return () => {
            cancelRestAlert();
        };
    }, [restEndsAt, restAlertsEnabled]);

    return null;
}
