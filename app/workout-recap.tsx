import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { useHistory } from '@/context/history-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import { formatDurationLong } from '@/lib/workout-stats';

export default function WorkoutRecapScreen() {
    const styles = useThemedStyles(createStyles);
    const insets = useScreenInsets();
    const { lastRecap } = useHistory();

    if (!lastRecap) {
        return (
            <View
                style={[
                    styles.screen,
                    { paddingTop: insets.top + 24 },
                ]}
            >
                <Text style={styles.title}>Workout saved</Text>
                <Pressable
                    style={styles.button}
                    onPress={() => router.replace('/')}
                >
                    <Text style={styles.buttonText}>Done</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + 24 },
            ]}
        >
            <Text style={styles.kicker}>WORKOUT COMPLETE</Text>
            <Text style={styles.title}>Nice work</Text>

            {lastRecap.insight ? (
                <View style={styles.insight}>
                    <Text style={styles.insightText}>
                        {lastRecap.insight}
                    </Text>
                </View>
            ) : null}

            <View style={styles.stats}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {formatDurationLong(lastRecap.durationSeconds)}
                    </Text>
                    <Text style={styles.statLabel}>TIME</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {Math.round(lastRecap.volume).toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>
                        VOLUME {lastRecap.unit.toUpperCase()}
                    </Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {lastRecap.setCount}
                    </Text>
                    <Text style={styles.statLabel}>SETS</Text>
                </View>
            </View>

            {lastRecap.prs.length > 0 ? (
                <View style={styles.prCard}>
                    <Text style={styles.sectionTitle}>PRs</Text>
                    {lastRecap.prs.map((pr) => (
                        <View key={pr.name} style={styles.prRow}>
                            <Text style={styles.prName}>{pr.name}</Text>
                            <Text style={styles.prDetail}>{pr.detail}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.emptyPrs}>
                    No PRs this session. The work still counts.
                </Text>
            )}

            <Pressable
                style={styles.button}
                onPress={() => router.replace('/')}
            >
                <Text style={styles.buttonText}>Done</Text>
            </Pressable>

            <Pressable
                onPress={() => router.replace('/history')}
                style={styles.secondary}
            >
                <Text style={styles.secondaryText}>View history</Text>
            </Pressable>
        </ScrollView>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: c.background,
        },
        content: {
            padding: 24,
            paddingBottom: 60,
        },
        kicker: {
            color: c.success,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 1,
        },
        title: {
            color: c.text,
            fontSize: 36,
            fontWeight: '700',
            marginTop: 8,
        },
        insight: {
            backgroundColor: c.tintSoft,
            borderRadius: 16,
            padding: 16,
            marginTop: 20,
        },
        insightText: {
            color: c.text,
            fontSize: 17,
            fontWeight: '700',
            lineHeight: 24,
        },
        stats: {
            flexDirection: 'row',
            gap: 10,
            marginTop: 22,
        },
        stat: {
            flex: 1,
            backgroundColor: c.card,
            borderRadius: 16,
            padding: 14,
        },
        statValue: {
            color: c.text,
            fontSize: 20,
            fontWeight: '700',
        },
        statLabel: {
            color: c.textFaint,
            fontSize: 10,
            fontWeight: '700',
            marginTop: 6,
            letterSpacing: 0.5,
        },
        prCard: {
            backgroundColor: c.card,
            borderRadius: 18,
            padding: 18,
            marginTop: 22,
        },
        sectionTitle: {
            color: c.text,
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 12,
        },
        prRow: {
            marginBottom: 12,
        },
        prName: {
            color: c.text,
            fontSize: 16,
            fontWeight: '700',
        },
        prDetail: {
            color: c.textSecondary,
            marginTop: 2,
        },
        emptyPrs: {
            color: c.textSecondary,
            marginTop: 22,
            lineHeight: 22,
        },
        button: {
            backgroundColor: c.tint,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 28,
        },
        buttonText: {
            color: c.onTint,
            fontSize: 17,
            fontWeight: '700',
        },
        secondary: {
            alignItems: 'center',
            paddingVertical: 16,
        },
        secondaryText: {
            color: c.tint,
            fontWeight: '700',
        },
    });
}
