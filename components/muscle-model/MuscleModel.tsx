import { StyleSheet, Text, View } from 'react-native';
import Body, {
    type ExtendedBodyPart,
    type Slug,
} from 'react-native-body-highlighter';

import { getModelMuscleGroups } from '@/data/muscle-model-map';
import { useAppTheme } from '@/hooks/use-app-theme';

type Props = {
    primaryMuscles: string[];
    secondaryMuscles: string[];
};

const GROUP_TO_SLUG: Record<string, Slug> = {
    chest: 'chest',
    frontDelts: 'deltoids',
    sideDelts: 'deltoids',
    rearDelts: 'deltoids',
    traps: 'trapezius',
    rhomboids: 'upper-back',
    teresMajor: 'upper-back',
    rotatorCuff: 'deltoids',
    biceps: 'biceps',
    triceps: 'triceps',
    brachialis: 'biceps',
    forearms: 'forearm',
    obliques: 'obliques',
    lowerBack: 'lower-back',
    glutes: 'gluteal',
    gluteMedius: 'gluteal',
    gluteMinimus: 'gluteal',
    quads: 'quadriceps',
    hamstrings: 'hamstring',
    adductors: 'adductors',
    calves: 'calves',
    tibialisAnterior: 'tibialis',
    lats: 'upper-back',
    abs: 'abs',
};

function highlightData(
    primaryMuscles: string[],
    secondaryMuscles: string[],
    primaryColor: string,
    secondaryColor: string
): ExtendedBodyPart[] {
    const primary = new Set(getModelMuscleGroups(primaryMuscles));
    const secondary = new Set(
        getModelMuscleGroups(secondaryMuscles).filter(
            (group) => !primary.has(group)
        )
    );

    const fills = new Map<Slug, string>();

    for (const group of secondary) {
        const slug = GROUP_TO_SLUG[group];
        if (slug) {
            fills.set(slug, secondaryColor);
        }
    }

    for (const group of primary) {
        const slug = GROUP_TO_SLUG[group];
        if (slug) {
            fills.set(slug, primaryColor);
        }
    }

    return [...fills.entries()].map(([slug, color]) => ({
        slug,
        color,
    }));
}

export default function MuscleModel({
    primaryMuscles,
    secondaryMuscles,
}: Props) {
    const { colors } = useAppTheme();
    const data = highlightData(
        primaryMuscles,
        secondaryMuscles,
        colors.tint,
        colors.muscleSecondary
    );

    return (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.figures} pointerEvents="none">
                <View style={styles.figure}>
                    <Body
                        data={data}
                        gender="male"
                        side="front"
                        scale={0.78}
                        border={colors.muscleOutline}
                        defaultFill={colors.muscleIdle}
                    />
                    <Text style={[styles.figureLabel, { color: colors.textMuted }]}>Front</Text>
                </View>

                <View style={styles.figure}>
                    <Body
                        data={data}
                        gender="male"
                        side="back"
                        scale={0.78}
                        border={colors.muscleOutline}
                        defaultFill={colors.muscleIdle}
                    />
                    <Text style={[styles.figureLabel, { color: colors.textMuted }]}>Back</Text>
                </View>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.swatch,
                            { backgroundColor: colors.tint },
                        ]}
                    />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Primary</Text>
                </View>

                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.swatch,
                            { backgroundColor: colors.muscleSecondary },
                        ]}
                    />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Secondary</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 18,
        paddingTop: 8,
        paddingBottom: 16,
        marginBottom: 30,
        overflow: 'hidden',
    },

    figures: {
        flexDirection: 'row',
        justifyContent: 'center',
    },

    figure: {
        flex: 1,
        alignItems: 'center',
    },

    figureLabel: {
        marginTop: 2,
        color: '#8e8e93',
        fontSize: 13,
        fontWeight: '600',
    },

    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 10,
    },

    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    swatch: {
        width: 9,
        height: 9,
        borderRadius: 5,
    },

    legendText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '600',
    },
});
