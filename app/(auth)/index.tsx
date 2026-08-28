import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/auth-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';

export default function WelcomeScreen() {
    const styles = useThemedStyles(createStyles);

    const insets = useScreenInsets();
    const { biometricLabel } = useAuth();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top + 24,
                    paddingBottom: insets.bottom + 12,
                },
            ]}
        >
            <View style={styles.hero}>
                <View style={styles.iconWrap}>
                    <Ionicons
                        name="barbell"
                        size={36}
                        color="#fff"
                    />
                </View>

                <Text style={styles.title}>
                    Workout
                </Text>

                <Text style={styles.subtitle}>
                    Create an account on this phone,
                    then unlock with {biometricLabel}{' '}
                    next time.
                </Text>
            </View>

            <View style={styles.actions}>
                <Pressable
                    style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={() =>
                        router.push('/sign-up')
                    }
                >
                    <Text style={styles.primaryText}>
                        Create Account
                    </Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={() =>
                        router.push('/sign-in')
                    }
                >
                    <Text style={styles.secondaryText}>
                        Sign In
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.background,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },

    hero: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 40,
    },

    iconWrap: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: c.tint,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },

    title: {
        color: c.text,
        fontSize: 40,
        fontWeight: '700',
        letterSpacing: -0.8,
    },

    subtitle: {
        color: c.textSecondary,
        fontSize: 17,
        lineHeight: 24,
        marginTop: 12,
        maxWidth: 320,
    },

    actions: {
        gap: 12,
    },

    primaryButton: {
        backgroundColor: c.tint,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },

    primaryText: {
        color: c.onTint,
        fontSize: 17,
        fontWeight: '700',
    },

    secondaryButton: {
        backgroundColor: c.card,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },

    secondaryText: {
        color: c.tint,
        fontSize: 17,
        fontWeight: '700',
    },

    pressed: {
        opacity: 0.75,
    },
});
}

