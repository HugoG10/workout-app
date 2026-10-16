import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import Animated, {
    Extrapolation,
    interpolate,
    type SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Slide = {
    icon: IconName;
    plate: string;
    iconColor: string;
    title: string;
    body: string;
};

const INK = '#09090B';
const PAPER = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.62)';

export default function WelcomeScreen() {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { biometricLabel } = useAuth();
    const scrollX = useSharedValue(0);
    const scroller = useRef<Animated.ScrollView>(null);
    const [page, setPage] = useState(0);

    const slides: Slide[] = [
        {
            icon: 'barbell',
            plate: '#D6FF4A',
            iconColor: '#111111',
            title: 'Your session stays with you.',
            body: 'Start from a routine or build it as you go. Sets, rest, and notes stay on this phone.',
        },
        {
            icon: 'keypad',
            plate: '#FFFFFF',
            iconColor: '#111111',
            title: 'Log the set, then rest.',
            body: 'A gym keypad for weight and reps. The timer takes over, and you get a nudge when rest ends.',
        },
        {
            icon: 'stats-chart',
            plate: '#C8B6FF',
            iconColor: '#111111',
            title: 'See the work add up.',
            body: 'History, records, and recovery show what changed and what to train next.',
        },
        {
            icon: 'lock-closed',
            plate: '#9AE6B4',
            iconColor: '#111111',
            title: 'Ready when you are.',
            body: `Create an account on this phone. Next time, unlock with ${biometricLabel}.`,
        },
    ];

    const last = page === slides.length - 1;

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    function goTo(index: number) {
        const next = Math.max(0, Math.min(slides.length - 1, index));
        scroller.current?.scrollTo({ x: next * width, animated: true });
        setPage(next);
        Haptics.selectionAsync();
    }

    return (
        <View style={[styles.screen, { backgroundColor: INK }]}>
            <StatusBar style="light" />

            <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
                <Text style={styles.brand}>Workout</Text>
                {last ? (
                    <View style={styles.skipSpacer} />
                ) : (
                    <Pressable
                        hitSlop={12}
                        onPress={() => goTo(slides.length - 1)}
                    >
                        <Text style={styles.skip}>Skip</Text>
                    </Pressable>
                )}
            </View>

            <Animated.ScrollView
                ref={scroller}
                style={styles.pager}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={onScroll}
                onMomentumScrollEnd={(event) => {
                    const next = Math.round(
                        event.nativeEvent.contentOffset.x / width
                    );
                    setPage(next);
                }}
            >
                {slides.map((slide) => (
                    <View key={slide.title} style={[styles.page, { width }]}>
                        <View
                            style={[
                                styles.plate,
                                { backgroundColor: slide.plate },
                            ]}
                        >
                            <Ionicons
                                name={slide.icon}
                                size={46}
                                color={slide.iconColor}
                            />
                        </View>
                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.body}>{slide.body}</Text>
                    </View>
                ))}
            </Animated.ScrollView>

            <View
                style={[
                    styles.footer,
                    { paddingBottom: Math.max(insets.bottom, 16) },
                ]}
            >
                <View style={styles.dots}>
                    {slides.map((slide, index) => (
                        <Dot
                            key={slide.title}
                            index={index}
                            width={width}
                            scrollX={scrollX}
                        />
                    ))}
                </View>

                {last ? (
                    <View style={styles.actions}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.primary,
                                pressed && styles.pressed,
                            ]}
                            onPress={() => router.push('/sign-up')}
                        >
                            <Text style={styles.primaryText}>
                                Create account
                            </Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [
                                styles.secondary,
                                pressed && styles.pressed,
                            ]}
                            onPress={() => router.push('/sign-in')}
                        >
                            <Text style={styles.secondaryText}>Sign in</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        style={({ pressed }) => [
                            styles.primary,
                            pressed && styles.pressed,
                        ]}
                        onPress={() => goTo(page + 1)}
                    >
                        <Text style={styles.primaryText}>Continue</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

function Dot({
    index,
    width,
    scrollX,
}: {
    index: number;
    width: number;
    scrollX: SharedValue<number>;
}) {
    const style = useAnimatedStyle(() => {
        const input = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        return {
            width: interpolate(
                scrollX.value,
                input,
                [7, 22, 7],
                Extrapolation.CLAMP
            ),
            opacity: interpolate(
                scrollX.value,
                input,
                [0.28, 1, 0.28],
                Extrapolation.CLAMP
            ),
        };
    });

    return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },

    top: {
        paddingHorizontal: 24,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    brand: {
        color: PAPER,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.2,
    },

    skip: {
        color: MUTED,
        fontSize: 16,
        fontWeight: '600',
    },

    skipSpacer: {
        width: 36,
    },

    pager: {
        flex: 1,
    },

    page: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingBottom: 12,
    },

    plate: {
        width: 96,
        height: 96,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 36,
    },

    title: {
        color: PAPER,
        fontSize: 40,
        lineHeight: 44,
        fontWeight: '700',
        letterSpacing: -1.1,
    },

    body: {
        color: MUTED,
        fontSize: 17,
        lineHeight: 24,
        marginTop: 16,
        maxWidth: 340,
    },

    footer: {
        paddingHorizontal: 24,
        gap: 22,
    },

    dots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    dot: {
        height: 7,
        borderRadius: 4,
        backgroundColor: PAPER,
    },

    actions: {
        gap: 10,
    },

    primary: {
        backgroundColor: PAPER,
        minHeight: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
    },

    primaryText: {
        color: INK,
        fontSize: 17,
        fontWeight: '700',
    },

    secondary: {
        minHeight: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
    },

    secondaryText: {
        color: PAPER,
        fontSize: 17,
        fontWeight: '600',
    },

    pressed: {
        opacity: 0.82,
    },
});
