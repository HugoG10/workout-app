import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { AppColors } from '@/constants/theme';

type Props = {
    uri?: string | null;
    initials: string;
    colors: AppColors;
    size?: number;
    editable?: boolean;
    onPress?: () => void;
};

export function ProfileAvatar({
    uri,
    initials,
    colors,
    size = 92,
    editable = false,
    onPress,
}: Props) {
    const radius = size / 2;

    return (
        <Pressable
            accessibilityRole={
                onPress ? 'button' : undefined
            }
            accessibilityLabel={
                uri
                    ? 'Change profile photo'
                    : 'Add a profile photo'
            }
            disabled={!onPress}
            onPress={onPress}
            style={({ pressed }) => [
                {
                    width: size,
                    height: size,
                    borderRadius: radius,
                },
                pressed && onPress && styles.pressed,
            ]}
        >
            {uri ? (
                <Image
                    source={{ uri }}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: radius,
                        backgroundColor: colors.fill,
                    }}
                />
            ) : (
                <View
                    style={[
                        styles.fallback,
                        {
                            width: size,
                            height: size,
                            borderRadius: radius,
                            backgroundColor: colors.tint,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.initials,
                            {
                                color: colors.onTint,
                                fontSize: size * 0.34,
                            },
                        ]}
                    >
                        {initials}
                    </Text>
                </View>
            )}

            {editable ? (
                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor: colors.tint,
                            borderColor: colors.background,
                        },
                    ]}
                >
                    <Ionicons
                        name="camera"
                        size={14}
                        color={colors.onTint}
                    />
                </View>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    fallback: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    initials: {
        fontWeight: '700',
    },

    badge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },

    pressed: {
        opacity: 0.8,
    },
});
