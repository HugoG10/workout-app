import {
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useSettings, type TipId } from '@/context/settings-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';

type Props = {
    id: TipId;
    title: string;
    body: string;
    style?: ViewStyle;
};

export function ScreenTip({
    id,
    title,
    body,
    style,
}: Props) {
    const styles = useThemedStyles(createStyles);
    const { loading, isTipSeen, dismissTip } =
        useSettings();

    if (loading || isTipSeen(id)) {
        return null;
    }

    return (
        <View style={[styles.card, style]}>
            <View style={styles.top}>
                <View style={styles.icon}>
                    <Ionicons
                        name="bulb"
                        size={16}
                        color="#fff"
                    />
                </View>

                <Text style={styles.title}>
                    {title}
                </Text>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss tip"
                    hitSlop={8}
                    onPress={() => dismissTip(id)}
                    style={({ pressed }) => [
                        styles.gotIt,
                        pressed && styles.pressed,
                    ]}
                >
                    <Text style={styles.gotItText}>
                        Got it
                    </Text>
                </Pressable>
            </View>

            <Text style={styles.body}>
                {body}
            </Text>
        </View>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
        card: {
            backgroundColor: c.tintSoft,
            borderRadius: 16,
            padding: 14,
            marginTop: 14,
            marginBottom: 18,
        },

        top: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        icon: {
            width: 26,
            height: 26,
            borderRadius: 8,
            backgroundColor: c.tint,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
        },

        title: {
            flex: 1,
            color: c.text,
            fontSize: 15,
            fontWeight: '700',
        },

        gotIt: {
            paddingLeft: 8,
            paddingVertical: 4,
        },

        gotItText: {
            color: c.tint,
            fontSize: 14,
            fontWeight: '700',
        },

        body: {
            color: c.textSecondary,
            fontSize: 14,
            lineHeight: 20,
            marginTop: 8,
            marginLeft: 36,
        },

        pressed: {
            opacity: 0.7,
        },
    });
}
