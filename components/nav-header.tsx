import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useScreenInsets } from '@/hooks/use-screen-insets';

type Props = {
    backLabel?: string;
    title?: string;
};

export function NavHeader({
    backLabel = 'Back',
    title,
}: Props) {
    const insets = useScreenInsets();

    function handleBack() {
        Haptics.selectionAsync();
        router.back();
    }

    return (
        <View
            style={[
                styles.bar,
                { paddingTop: insets.top },
            ]}
        >
            <Pressable
                onPress={handleBack}
                hitSlop={8}
                style={({ pressed }) => [
                    styles.backButton,
                    pressed && styles.pressed,
                ]}
            >
                <Ionicons
                    name="chevron-back"
                    size={28}
                    color="#007AFF"
                />
                <Text
                    style={styles.backLabel}
                    numberOfLines={1}
                >
                    {backLabel}
                </Text>
            </Pressable>

            {title ? (
                <Text
                    style={styles.title}
                    numberOfLines={1}
                >
                    {title}
                </Text>
            ) : (
                <View style={styles.titleSpacer} />
            )}

            <View style={styles.trailing} />
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        backgroundColor: '#f5f5f7',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ddd',
        paddingHorizontal: 6,
        paddingBottom: 10,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
    },

    backButton: {
        minWidth: 88,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
    },

    backLabel: {
        color: '#007AFF',
        fontSize: 17,
        fontWeight: '500',
        marginLeft: -2,
    },

    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1c1e',
        paddingHorizontal: 4,
    },

    titleSpacer: {
        flex: 1,
    },

    trailing: {
        minWidth: 88,
    },

    pressed: {
        opacity: 0.55,
    },
});
