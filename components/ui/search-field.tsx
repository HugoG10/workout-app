import { Pressable, StyleSheet, TextInput, View, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Layout } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type Props = {
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    style?: ViewStyle;
};

export function SearchField({
    value,
    onChangeText,
    placeholder,
    style,
}: Props) {
    const { colors } = useAppTheme();

    return (
        <View
            style={[
                styles.field,
                { backgroundColor: colors.card },
                style,
            ]}
        >
            <Ionicons
                name="search"
                size={18}
                color={colors.textFaint}
            />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textFaint}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, { color: colors.text }]}
            />
            {value.length > 0 ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    hitSlop={8}
                    onPress={() => onChangeText('')}
                >
                    <Ionicons
                        name="close-circle"
                        size={18}
                        color={colors.textFaint}
                    />
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 44,
        borderRadius: Layout.radiusSm,
        paddingHorizontal: 12,
        marginBottom: 14,
    },

    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
});
