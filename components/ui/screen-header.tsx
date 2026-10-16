import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Layout } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type Props = {
    title: string;
    subtitle?: string;
    right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, right }: Props) {
    const { colors } = useAppTheme();

    return (
        <View style={styles.wrap}>
            <View style={styles.copy}>
                <Text
                    style={[styles.title, { color: colors.text }]}
                    numberOfLines={2}
                >
                    {title}
                </Text>
                {subtitle ? (
                    <Text
                        style={[
                            styles.subtitle,
                            { color: colors.textSecondary },
                        ]}
                    >
                        {subtitle}
                    </Text>
                ) : null}
            </View>
            {right}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
    },

    copy: {
        flex: 1,
    },

    title: {
        fontSize: Layout.titleSize,
        fontWeight: '700',
        letterSpacing: -0.6,
    },

    subtitle: {
        fontSize: 16,
        lineHeight: 22,
        marginTop: 4,
    },
});
