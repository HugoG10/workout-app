import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { AppColors } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type RowProps = {
    colors: AppColors;
    icon: IconName;
    iconColor?: string;
    label: string;
    value?: string;
    last?: boolean;
    destructive?: boolean;
    onPress: () => void;
};

export function SettingsRow({
    colors,
    icon,
    iconColor,
    label,
    value,
    last,
    destructive,
    onPress,
}: RowProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: colors.fill },
            ]}
        >
            <View
                style={[
                    styles.iconWrap,
                    {
                        backgroundColor:
                            iconColor ?? colors.tint,
                    },
                ]}
            >
                <Ionicons
                    name={icon}
                    size={16}
                    color="#fff"
                />
            </View>

            <View
                style={[
                    styles.rowBody,
                    !last && {
                        borderBottomWidth:
                            StyleSheet.hairlineWidth,
                        borderBottomColor: colors.separator,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.label,
                        {
                            color: destructive
                                ? colors.destructive
                                : colors.text,
                        },
                    ]}
                >
                    {label}
                </Text>

                <View style={styles.trailing}>
                    {value ? (
                        <Text
                            style={[
                                styles.value,
                                { color: colors.textMuted },
                            ]}
                            numberOfLines={1}
                        >
                            {value}
                        </Text>
                    ) : null}

                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textFaint}
                    />
                </View>
            </View>
        </Pressable>
    );
}

export function SettingsGroup({
    colors,
    children,
}: {
    colors: AppColors;
    children: ReactNode;
}) {
    return (
        <View
            style={[
                styles.group,
                { backgroundColor: colors.card },
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    group: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 28,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 14,
        minHeight: 52,
    },

    iconWrap: {
        width: 28,
        height: 28,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },

    rowBody: {
        flex: 1,
        minHeight: 52,
        marginLeft: 12,
        paddingRight: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },

    label: {
        flex: 1,
        fontSize: 17,
        fontWeight: '500',
    },

    trailing: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        maxWidth: '50%',
    },

    value: {
        fontSize: 15,
        flexShrink: 1,
    },
});
