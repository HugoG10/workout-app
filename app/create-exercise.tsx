import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { router } from 'expo-router';

import { useExerciseCatalog } from '@/context/exercise-catalog-context';
import { TrackingType } from '@/data/exercises';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';

const MUSCLES = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Quadriceps',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Core',
];

const EQUIPMENT = [
    'Barbell',
    'Dumbbell',
    'Cable',
    'Machine',
    'Bodyweight',
    'Other',
];

const TRACKING: { id: TrackingType; label: string; hint: string }[] =
    [
        {
            id: 'weight_reps',
            label: 'Weight × reps',
            hint: 'Bench, squat, rows',
        },
        {
            id: 'bodyweight',
            label: 'Bodyweight / reps',
            hint: 'Pull-ups, push-ups',
        },
        {
            id: 'duration',
            label: 'Duration',
            hint: 'Planks and holds',
        },
    ];

export default function CreateExerciseScreen() {
    const styles = useThemedStyles(createStyles);
    const insets = useScreenInsets();
    const { addCustomExercise } = useExerciseCatalog();

    const [name, setName] = useState('');
    const [muscle, setMuscle] = useState('Chest');
    const [equipment, setEquipment] = useState('Dumbbell');
    const [tracking, setTracking] =
        useState<TrackingType>('weight_reps');

    function save() {
        if (name.trim().length < 2) {
            Alert.alert(
                'Name this exercise',
                'Give it a name you will recognize later.'
            );
            return;
        }

        addCustomExercise({
            name,
            primaryMuscle: muscle,
            equipment,
            tracking,
        });

        router.back();
    }

    return (
        <View style={styles.screen}>
            <View
                style={[
                    styles.header,
                    { paddingTop: insets.top + 4 },
                ]}
            >
                <Pressable onPress={() => router.back()}>
                    <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
                <Text style={styles.title}>Custom Exercise</Text>
                <View style={styles.spacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.label}>NAME</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Paused bench"
                    placeholderTextColor={styles.placeholder.color}
                    autoCapitalize="words"
                />

                <Text style={styles.label}>PRIMARY MUSCLE</Text>
                <View style={styles.wrap}>
                    {MUSCLES.map((item) => (
                        <Pressable
                            key={item}
                            onPress={() => setMuscle(item)}
                            style={[
                                styles.chip,
                                muscle === item && styles.chipOn,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    muscle === item && styles.chipTextOn,
                                ]}
                            >
                                {item}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.label}>EQUIPMENT</Text>
                <View style={styles.wrap}>
                    {EQUIPMENT.map((item) => (
                        <Pressable
                            key={item}
                            onPress={() => setEquipment(item)}
                            style={[
                                styles.chip,
                                equipment === item && styles.chipOn,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    equipment === item &&
                                        styles.chipTextOn,
                                ]}
                            >
                                {item}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.label}>HOW YOU LOG IT</Text>
                {TRACKING.map((item) => (
                    <Pressable
                        key={item.id}
                        onPress={() => setTracking(item.id)}
                        style={[
                            styles.trackCard,
                            tracking === item.id && styles.trackOn,
                        ]}
                    >
                        <Text style={styles.trackTitle}>
                            {item.label}
                        </Text>
                        <Text style={styles.trackHint}>{item.hint}</Text>
                    </Pressable>
                ))}

                <Pressable style={styles.save} onPress={save}>
                    <Text style={styles.saveText}>Save Exercise</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: c.background,
        },
        header: {
            paddingHorizontal: 20,
            paddingBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        cancel: {
            color: c.tint,
            fontSize: 16,
        },
        title: {
            color: c.text,
            fontSize: 18,
            fontWeight: '700',
        },
        spacer: {
            width: 54,
        },
        content: {
            padding: 20,
            paddingBottom: 40,
        },
        label: {
            color: c.textFaint,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.7,
            marginBottom: 10,
            marginTop: 8,
        },
        input: {
            backgroundColor: c.card,
            color: c.text,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 17,
            marginBottom: 18,
        },
        placeholder: {
            color: c.textFaint,
        },
        wrap: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 18,
        },
        chip: {
            backgroundColor: c.card,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
        chipOn: {
            backgroundColor: c.tint,
        },
        chipText: {
            color: c.textSecondary,
            fontWeight: '600',
        },
        chipTextOn: {
            color: c.onTint,
        },
        trackCard: {
            backgroundColor: c.card,
            borderRadius: 14,
            padding: 14,
            marginBottom: 8,
            borderWidth: 2,
            borderColor: 'transparent',
        },
        trackOn: {
            borderColor: c.tint,
        },
        trackTitle: {
            color: c.text,
            fontWeight: '700',
            fontSize: 16,
        },
        trackHint: {
            color: c.textSecondary,
            marginTop: 3,
        },
        save: {
            backgroundColor: c.tint,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 20,
        },
        saveText: {
            color: c.onTint,
            fontWeight: '700',
            fontSize: 17,
        },
    });
}
