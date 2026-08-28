import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { AppearanceMode } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';
import { useAppTheme } from '@/hooks/use-app-theme';

const OPTIONS: {
    mode: AppearanceMode;
    label: string;
    detail: string;
    icon: keyof typeof Ionicons.glyphMap;
}[] = [
    {
        mode: 'system',
        label: 'System',
        detail: 'Match your phone',
        icon: 'phone-portrait-outline',
    },
    {
        mode: 'light',
        label: 'Light',
        detail: 'Always light',
        icon: 'sunny-outline',
    },
    {
        mode: 'dark',
        label: 'Dark',
        detail: 'Always dark',
        icon: 'moon-outline',
    },
];

export default function AppearanceScreen() {
    const { colors } = useAppTheme();
    const { appearance, setAppearance } = useSettings();

    return (
        <ScrollView
            style={[
                styles.screen,
                { backgroundColor: colors.background },
            ]}
            contentContainerStyle={styles.content}
        >
            <Text
                style={[
                    styles.section,
                    { color: colors.textMuted },
                ]}
            >
                THEME
            </Text>

            <View
                style={[
                    styles.card,
                    { backgroundColor: colors.card },
                ]}
            >
                {OPTIONS.map((option, index) => {
                    const selected = appearance === option.mode;
                    const last = index === OPTIONS.length - 1;

                    return (
                        <Pressable
                            key={option.mode}
                            onPress={() =>
                                setAppearance(option.mode)
                            }
                            style={({ pressed }) => [
                                styles.row,
                                pressed && {
                                    backgroundColor: colors.fill,
                                },
                            ]}
                        >
                            <Ionicons
                                name={option.icon}
                                size={22}
                                color={colors.tint}
                                style={styles.icon}
                            />

                            <View
                                style={[
                                    styles.body,
                                    !last && {
                                        borderBottomWidth:
                                            StyleSheet.hairlineWidth,
                                        borderBottomColor:
                                            colors.separator,
                                    },
                                ]}
                            >
                                <View style={styles.copy}>
                                    <Text
                                        style={[
                                            styles.label,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.detail,
                                            {
                                                color: colors.textSecondary,
                                            },
                                        ]}
                                    >
                                        {option.detail}
                                    </Text>
                                </View>

                                {selected ? (
                                    <Ionicons
                                        name="checkmark"
                                        size={22}
                                        color={colors.tint}
                                    />
                                ) : null}
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },

    content: {
        padding: 16,
        paddingTop: 12,
    },

    section: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.4,
        marginLeft: 16,
        marginBottom: 8,
    },

    card: {
        borderRadius: 14,
        overflow: 'hidden',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        minHeight: 64,
    },

    icon: {
        marginRight: 12,
    },

    body: {
        flex: 1,
        minHeight: 64,
        paddingRight: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },

    copy: {
        flex: 1,
        paddingVertical: 12,
    },

    label: {
        fontSize: 17,
        fontWeight: '600',
    },

    detail: {
        fontSize: 13,
        marginTop: 2,
    },
});
