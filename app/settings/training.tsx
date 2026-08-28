import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useSettings } from '@/context/settings-context';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function TrainingSettingsScreen() {
    const { colors } = useAppTheme();
    const {
        weightUnit,
        setWeightUnit,
        defaultRestTime,
        setDefaultRestTime,
    } = useSettings();

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
                UNITS
            </Text>

            <View
                style={[
                    styles.card,
                    { backgroundColor: colors.card },
                ]}
            >
                <Text
                    style={[styles.title, { color: colors.text }]}
                >
                    Weight Unit
                </Text>
                <Text
                    style={[
                        styles.description,
                        { color: colors.textSecondary },
                    ]}
                >
                    Used when logging sets.
                </Text>

                <View
                    style={[
                        styles.segment,
                        { backgroundColor: colors.fill },
                    ]}
                >
                    {(['lb', 'kg'] as const).map((unit) => {
                        const selected = weightUnit === unit;

                        return (
                            <Pressable
                                key={unit}
                                onPress={() => setWeightUnit(unit)}
                                style={[
                                    styles.segmentButton,
                                    selected && {
                                        backgroundColor: colors.tint,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.segmentText,
                                        {
                                            color: selected
                                                ? colors.onTint
                                                : colors.textSecondary,
                                        },
                                    ]}
                                >
                                    {unit.toUpperCase()}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <Text
                style={[
                    styles.section,
                    { color: colors.textMuted },
                ]}
            >
                REST TIMER
            </Text>

            <View
                style={[
                    styles.card,
                    { backgroundColor: colors.card },
                ]}
            >
                <Text
                    style={[styles.title, { color: colors.text }]}
                >
                    Default Rest
                </Text>
                <Text
                    style={[
                        styles.description,
                        { color: colors.textSecondary },
                    ]}
                >
                    Starts after you complete a set.
                </Text>

                <View
                    style={[
                        styles.restGrid,
                        { backgroundColor: colors.fill },
                    ]}
                >
                    {[60, 90, 120, 180, 240].map((seconds) => {
                    const selected =
                        defaultRestTime === seconds;

                    return (
                        <Pressable
                            key={seconds}
                            onPress={() =>
                                setDefaultRestTime(seconds)
                            }
                            style={[
                                styles.restButton,
                                selected && {
                                    backgroundColor: colors.tint,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.segmentText,
                                    {
                                        color: selected
                                            ? colors.onTint
                                            : colors.textSecondary,
                                    },
                                ]}
                            >
                                {seconds}s
                            </Text>
                        </Pressable>
                    );
                })}
                </View>

                <Text
                    style={[
                        styles.description,
                        { color: colors.textSecondary, marginTop: 14 },
                    ]}
                >
                    Or set a custom rest in seconds.
                </Text>

                <View
                    style={[
                        styles.customRow,
                        { backgroundColor: colors.fill },
                    ]}
                >
                    <TextInput
                        keyboardType="number-pad"
                        value={String(defaultRestTime)}
                        onChangeText={(value) => {
                            const parsed = Number(value);
                            if (!Number.isNaN(parsed) && parsed > 0) {
                                setDefaultRestTime(parsed);
                            }
                        }}
                        style={[
                            styles.customInput,
                            { color: colors.text },
                        ]}
                    />
                    <Text
                        style={[
                            styles.customSuffix,
                            { color: colors.textMuted },
                        ]}
                    >
                        seconds
                    </Text>
                </View>
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
        padding: 16,
        marginBottom: 28,
    },

    title: {
        fontSize: 17,
        fontWeight: '700',
    },

    description: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 4,
        marginBottom: 14,
    },

    segment: {
        flexDirection: 'row',
        borderRadius: 11,
        padding: 3,
        gap: 3,
    },

    segmentButton: {
        flex: 1,
        paddingVertical: 9,
        borderRadius: 9,
        alignItems: 'center',
    },

    restGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 11,
        padding: 3,
        gap: 3,
    },

    restButton: {
        flexGrow: 1,
        flexBasis: '30%',
        minWidth: 72,
        paddingVertical: 9,
        borderRadius: 9,
        alignItems: 'center',
    },

    segmentText: {
        fontSize: 12,
        fontWeight: '700',
    },

    customRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 11,
        paddingHorizontal: 12,
    },

    customInput: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        paddingVertical: 12,
    },

    customSuffix: {
        fontSize: 14,
        fontWeight: '600',
    },
});
