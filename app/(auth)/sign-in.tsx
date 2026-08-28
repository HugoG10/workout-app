import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';

export default function SignInScreen() {
    const styles = useThemedStyles(createStyles);

    const insets = useScreenInsets();
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] =
        useState(false);

    async function handleSignIn() {
        if (submitting) {
            return;
        }

        setSubmitting(true);

        try {
            await signIn(email, password);
        } catch (error) {
            Alert.alert(
                'Could not sign in',
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
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop: insets.top + 8,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <Pressable
                    hitSlop={10}
                    onPress={() => router.back()}
                >
                    <Text style={styles.back}>
                        ‹ Welcome
                    </Text>
                </Pressable>

                <Text style={styles.title}>
                    Sign In
                </Text>

                <Text style={styles.subtitle}>
                    Use the email and password you created
                    on this phone.
                </Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="you@email.com"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="username"
                    value={email}
                    onChangeText={setEmail}
                />

                <Text style={styles.label}>
                    Password
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    textContentType="password"
                    value={password}
                    onChangeText={setPassword}
                />

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        submitting && styles.buttonDisabled,
                        pressed && styles.pressed,
                    ]}
                    onPress={handleSignIn}
                    disabled={submitting}
                >
                    <Text style={styles.buttonText}>
                        {submitting
                            ? 'Signing in…'
                            : 'Sign In'}
                    </Text>
                </Pressable>
            </ScrollView>
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
        paddingHorizontal: 24,
    },

    back: {
        color: c.tint,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 28,
    },

    title: {
        color: c.text,
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: -0.6,
    },

    subtitle: {
        color: c.textSecondary,
        fontSize: 16,
        lineHeight: 22,
        marginTop: 8,
        marginBottom: 28,
    },

    label: {
        color: c.textMuted,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.6,
        marginBottom: 8,
    },

    input: {
        backgroundColor: c.card,
        color: c.text,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 17,
        marginBottom: 18,
    },

    button: {
        backgroundColor: c.tint,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },

    buttonDisabled: {
        opacity: 0.55,
    },

    buttonText: {
        color: c.onTint,
        fontSize: 17,
        fontWeight: '700',
    },

    pressed: {
        opacity: 0.8,
    },
});
}

