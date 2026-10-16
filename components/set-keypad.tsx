import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';
import { bumpNumber } from '@/lib/workout-stats';

type Field = 'weight' | 'reps' | 'duration';

type Props = {
    visible: boolean;
    title: string;
    value: string;
    field: Field;
    unitLabel?: string;
    copyLabel?: string;
    onChange: (value: string) => void;
    onCopyLast?: () => void;
    onClose: () => void;
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

export function SetKeypad({
    visible,
    title,
    value,
    field,
    unitLabel,
    copyLabel,
    onChange,
    onCopyLast,
    onClose,
}: Props) {
    const insets = useSafeAreaInsets();
    const { colors } = useAppTheme();

    const increments =
        field === 'weight'
            ? [2.5, 5]
            : field === 'reps'
              ? [1, 5]
              : [15, 30];

    function append(key: string) {
        if (key === '⌫') {
            onChange(value.slice(0, -1));
            return;
        }

        if (key === '.') {
            if (field === 'reps' || value.includes('.')) {
                return;
            }

            onChange(value === '' ? '0.' : `${value}.`);
            return;
        }

        if (value === '0' && key !== '.') {
            onChange(key);
            return;
        }

        if (value.replace('.', '').length >= 6) {
            return;
        }

        onChange(`${value}${key}`);
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.root}>
                <Pressable
                    style={styles.backdrop}
                    onPress={onClose}
                />

            <View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: colors.card,
                        paddingBottom: Math.max(insets.bottom, 16),
                    },
                ]}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {title}
                    </Text>
                    <Pressable onPress={onClose} hitSlop={10}>
                        <Text style={[styles.done, { color: colors.tint }]}>
                            Done
                        </Text>
                    </Pressable>
                </View>

                <Text style={[styles.value, { color: colors.text }]}>
                    {value || '0'}
                    {unitLabel ? (
                        <Text
                            style={[
                                styles.unit,
                                { color: colors.textMuted },
                            ]}
                        >
                            {' '}
                            {unitLabel}
                        </Text>
                    ) : null}
                </Text>

                <View style={styles.increments}>
                    {increments.map((amount) => (
                        <Pressable
                            key={amount}
                            style={[
                                styles.chip,
                                { backgroundColor: colors.fill },
                            ]}
                            onPress={() =>
                                onChange(bumpNumber(value, amount))
                            }
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    { color: colors.tint },
                                ]}
                            >
                                +{amount}
                            </Text>
                        </Pressable>
                    ))}

                    {onCopyLast ? (
                        <Pressable
                            style={[
                                styles.chip,
                                { backgroundColor: colors.tintSoft },
                            ]}
                            onPress={onCopyLast}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    { color: colors.tint },
                                ]}
                            >
                                {copyLabel ?? 'Copy last'}
                            </Text>
                        </Pressable>
                    ) : null}
                </View>

                <View style={styles.grid}>
                    {KEYS.map((key) => (
                        <Pressable
                            key={key}
                            style={[
                                styles.key,
                                { backgroundColor: colors.fill },
                            ]}
                            onPress={() => append(key)}
                        >
                            <Text
                                style={[
                                    styles.keyText,
                                    { color: colors.text },
                                ]}
                            >
                                {key}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },

    sheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 14,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    title: {
        fontSize: 15,
        fontWeight: '700',
    },

    done: {
        fontSize: 16,
        fontWeight: '700',
    },

    value: {
        fontSize: 40,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
        textAlign: 'center',
        marginBottom: 12,
    },

    unit: {
        fontSize: 18,
        fontWeight: '600',
    },

    increments: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
    },

    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },

    chipText: {
        fontSize: 14,
        fontWeight: '700',
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    key: {
        width: '31.5%',
        minHeight: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    keyText: {
        fontSize: 22,
        fontWeight: '600',
    },
});
