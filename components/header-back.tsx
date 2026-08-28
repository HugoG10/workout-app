import {
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';

type Props = {
    label: string;
    fallback: Href;
};

export function HeaderBack({
    label,
    fallback,
}: Props) {
    function handlePress() {
        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.replace(fallback);
    }

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Go back to ${label}`}
            hitSlop={20}
            onPress={handlePress}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
            ]}
        >
            <Ionicons
                name="chevron-back"
                size={28}
                color="#007AFF"
            />
            <Text style={styles.label}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 44,
        paddingRight: 20,
        marginLeft: -6,
    },
    label: {
        color: '#007AFF',
        fontSize: 17,
        fontWeight: '500',
    },
    pressed: {
        opacity: 0.55,
    },
});
