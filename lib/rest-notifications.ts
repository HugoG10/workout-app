import { AppState, Platform } from 'react-native';

import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'rest-timer';
const REST_ID_KEY = 'rest-complete';

Notifications.setNotificationHandler({
    handleNotification: async () => {
        const active = AppState.currentState === 'active';

        return {
            shouldPlaySound: !active,
            shouldSetBadge: false,
            shouldShowBanner: !active,
            shouldShowList: true,
        };
    },
});

let scheduledId: string | null = null;

export async function ensureRestAlertPermission() {
    if (Platform.OS === 'web') {
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: 'Rest timer',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    const existing = await Notifications.getPermissionsAsync();

    if (existing.granted) {
        return true;
    }

    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
}

export async function scheduleRestAlert(endsAt: number) {
    if (Platform.OS === 'web') {
        return;
    }

    await cancelRestAlert();

    const seconds = Math.max(
        1,
        Math.ceil((endsAt - Date.now()) / 1000)
    );
    const allowed = await ensureRestAlertPermission();

    if (!allowed) {
        return;
    }

    scheduledId = await Notifications.scheduleNotificationAsync({
        identifier: REST_ID_KEY,
        content: {
            title: 'Rest over',
            body: 'Time for your next set.',
            sound: true,
            ...(Platform.OS === 'android'
                ? { channelId: CHANNEL_ID }
                : {}),
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
        },
    });
}

export async function cancelRestAlert() {
    if (Platform.OS === 'web') {
        return;
    }

    try {
        if (scheduledId) {
            await Notifications.cancelScheduledNotificationAsync(
                scheduledId
            );
        }

        await Notifications.cancelScheduledNotificationAsync(REST_ID_KEY);
        await Notifications.dismissNotificationAsync(REST_ID_KEY);
    } catch {
        // Notification may already be gone.
    }

    scheduledId = null;
}
