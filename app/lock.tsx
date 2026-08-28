import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';

export default function LockScreen() {
    const styles = useThemedStyles(createStyles);

    const insets = useScreenInsets();
    const {
        user,
        faceIdEnabled,
        biometricLabel,
        unlockWithBiometrics,
        signIn,
    } = useAuth();

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] =
        useState(!faceIdEnabled);
    const [submitting, setSubmitting] =
        useState(false);

    const didPrompt = useRef(false);

    useEffect(() => {
        if (!faceIdEnabled || didPrompt.current) {
            return;
        }

        didPrompt.current = true;
        unlockWithBiometrics();
    }, [faceIdEnabled, unlockWithBiometrics]);

    async function handlePasswordUnlock() {
        if (!user || submitting) {
            return;
        }

        setSubmitting(true);

        try {
            await signIn(user.email, password);
            setPassword('');
        } catch (error) {
            Alert.alert(
                'Could not unlock',
                error instanceof Error
                    ? error.message
                    : 'Try again.'
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={
                Platform.OS === 'ios'
                    ? 'padding'
                    : undefined
            }
        >
            <View
                style={[
                    styles.content,
                    {
                        paddingTop: insets.top + 40,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <View style={styles.hero}>
                    <View style={styles.iconWrap}>
                        <Ionicons
                            name={
                                faceIdEnabled
                                    ? 'scan-outline'
                                    : 'lock-closed-outline'
                            }
                            size={34}
                            color="#fff"
                        />
                    </View>

                    <Text style={styles.title}>
                        Welcome back
                    </Text>

                    <Text style={styles.subtitle}>
                        {user?.firstName
                            ? `Hi ${user.firstName}. `
                            : ''}
                        Unlock to continue.
                    </Text>
                </View>

                {faceIdEnabled && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.pressed,
                        ]}
                        onPress={() =>
                            unlockWithBiometrics()
                        }
                    >
                        <Ionicons
                            name="scan-outline"
                            size={20}
                            color="#fff"
                        />
                        <Text style={styles.primaryText}>
                            Unlock with {biometricLabel}
                        </Text>
                    </Pressable>
                )}

                {faceIdEnabled && !showPassword && (
                    <Pressable
                        onPress={() =>
                            setShowPassword(true)
                        }
                    >
                        <Text style={styles.link}>
                            Use password instead
                        </Text>
                    </Pressable>
                )}

                {showPassword && (
                    <View style={styles.passwordBlock}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#8e8e93"
                            secureTextEntry
                            textContentType="password"
                            value={password}
                            onChangeText={setPassword}
                            onSubmitEditing={
                                handlePasswordUnlock
                            }
                        />

                        <Pressable
                            style={({ pressed }) => [
                                styles.primaryButton,
                                submitting &&
                                    styles.buttonDisabled,
                                pressed && styles.pressed,
                            ]}
                            onPress={handlePasswordUnlock}
                            disabled={submitting}
                        >
                            <Text style={styles.primaryText}>
                                {submitting
                                    ? 'Unlocking…'
                                    : 'Unlock'}
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: c.background,
    },

    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },

    hero: {
        alignItems: 'center',
        marginBottom: 36,
    },

    iconWrap: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: c.tint,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22,
    },

    title: {
        color: c.text,
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.6,
        textAlign: 'center',
    },

    subtitle: {
        color: c.textSecondary,
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
    },

    primaryButton: {
        backgroundColor: c.tint,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },

    primaryText: {
        color: c.onTint,
        fontSize: 17,
        fontWeight: '700',
    },

    buttonDisabled: {
        opacity: 0.55,
    },

    link: {
        color: c.tint,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 18,
    },

    passwordBlock: {
        marginTop: 8,
        gap: 12,
    },

    input: {
        backgroundColor: c.card,
        color: c.text,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 17,
    },

    pressed: {
        opacity: 0.8,
    },
});
}

