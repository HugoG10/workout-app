import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRef } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';

type Props = {
    label: string;
    fallback: Href;
    onBeforeBack?: () => void;
};

export function ScreenBackBar({
    label,
    fallback,
    onBeforeBack,
}: Props) {
    const insets = useSafeAreaInsets();
    const { colors } = useAppTheme();
    const leaving = useRef(false);

    function handlePress() {
        if (leaving.current) {
            return;
        }

        leaving.current = true;
        onBeforeBack?.();

        if (router.canDismiss()) {
            router.dismiss();
            return;
        }

        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.navigate(fallback);
    }

    return (
        <View
            style={[
                styles.wrap,
                {
                    paddingTop: insets.top,
                    backgroundColor: colors.background,
                    borderBottomColor: colors.separator,
                },
            ]}
        >
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Go back to ${label}`}
                activeOpacity={0.55}
                delayPressIn={0}
                hitSlop={12}
                onPressIn={handlePress}
                style={styles.button}
            >
                <Ionicons
                    name="chevron-back"
                    size={28}
                    color={colors.tint}
                />
                <Text style={[styles.label, { color: colors.tint }]}>
                    {label}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        zIndex: 100,
        elevation: 100,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    button: {
        minHeight: 52,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },

    label: {
        fontSize: 17,
        fontWeight: '600',
    },
});
