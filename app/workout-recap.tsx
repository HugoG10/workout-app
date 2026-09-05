import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Link } from 'expo-router';

import { useHistory } from '@/context/history-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import { formatDurationLong } from '@/lib/workout-stats';

export default function WorkoutRecapScreen() {
    const styles = useThemedStyles(createStyles);
    const { colors } = useAppTheme();
    const insets = useScreenInsets();
    const { lastRecap, workouts, updateWorkout } = useHistory();
    const [name, setName] = useState(lastRecap?.name ?? 'Workout');

    function commitName(value: string) {
        const next = value.trim() || 'Workout';
        setName(next);

        const saved = workouts.find(
            (item) => item.id === lastRecap?.workoutId
        );

        if (saved) {
            updateWorkout({ ...saved, name: next });
        }
    }

    const actions = (
        <View
            style={[
                styles.actions,
                { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
        >
            <Link href="/(tabs)" dismissTo asChild>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Done</Text>
                </Pressable>
            </Link>

            <Link href="/history" dismissTo asChild>
                <Pressable style={styles.secondary}>
                    <Text style={styles.secondaryText}>View history</Text>
                </Pressable>
            </Link>
        </View>
    );

    if (!lastRecap) {
        return (
            <View
                style={[
                    styles.screen,
                    { paddingTop: insets.top + 24 },
                ]}
            >
                <Text style={styles.title}>Workout saved</Text>
                {actions}
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + 24 },
                ]}
            >
                <Text style={styles.kicker}>WORKOUT COMPLETE</Text>
                <TextInput
                    style={styles.title}
                    value={name}
                    onChangeText={setName}
                    onEndEditing={(event) =>
                        commitName(event.nativeEvent.text)
                    }
                    placeholder="Workout"
                    placeholderTextColor={colors.textFaint}
                />

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
            </ScrollView>

            {actions}
        </View>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: c.background,
        },
        scroll: {
            flex: 1,
        },
        content: {
            padding: 24,
            paddingBottom: 24,
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
        actions: {
            paddingHorizontal: 24,
            paddingTop: 8,
            backgroundColor: c.background,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: c.separator,
        },
        button: {
            backgroundColor: c.tint,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
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
