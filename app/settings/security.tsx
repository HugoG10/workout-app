import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function SecurityScreen() {
    const { colors } = useAppTheme();
    const {
        faceIdEnabled,
        biometricsAvailable,
        biometricLabel,
        setFaceIdEnabled,
        changePassword,
    } = useAuth();

    const [currentPassword, setCurrentPassword] =
        useState('');
    const [nextPassword, setNextPassword] = useState('');
    const [saving, setSaving] = useState(false);

    async function toggleFaceId(enabled: boolean) {
        try {
            const updated = await setFaceIdEnabled(enabled);

            if (!updated && enabled) {
                Alert.alert(
                    `${biometricLabel} not enabled`,
                    'Authenticate to turn this on, or try again.'
                );
            }
        } catch (error) {
            Alert.alert(
                `Could not update ${biometricLabel}`,
                error instanceof Error
                    ? error.message
                    : 'Try again.'
            );
        }
    }

    async function handleChangePassword() {
        if (saving) {
            return;
        }

        setSaving(true);

        try {
            await changePassword(
                currentPassword,
                nextPassword
            );
            setCurrentPassword('');
            setNextPassword('');
            Alert.alert(
                'Password updated',
                'Use your new password the next time you sign in.'
            );
        } catch (error) {
            Alert.alert(
                'Could not update password',
                error instanceof Error
                    ? error.message
                    : 'Try again.'
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={[
                styles.screen,
                { backgroundColor: colors.background },
            ]}
            behavior={
                Platform.OS === 'ios' ? 'padding' : undefined
            }
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text
                    style={[
                        styles.section,
                        { color: colors.textMuted },
                    ]}
                >
                    UNLOCK
                </Text>

                <View
                    style={[
                        styles.card,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <View style={styles.switchRow}>
                        <View style={styles.switchInfo}>
                            <Text
                                style={[
                                    styles.title,
                                    { color: colors.text },
                                ]}
                            >
                                {biometricLabel}
                            </Text>
                            <Text
                                style={[
                                    styles.description,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                {biometricsAvailable
                                    ? `Unlock the app with ${biometricLabel} instead of your password.`
                                    : `Set up ${biometricLabel} in iPhone Settings first.`}
                            </Text>
                        </View>

                        <Switch
                            value={faceIdEnabled}
                            onValueChange={toggleFaceId}
                            disabled={!biometricsAvailable}
                            trackColor={{
                                false: colors.switchOff,
                                true: colors.success,
                            }}
                        />
                    </View>
                </View>

                <Text
                    style={[
                        styles.section,
                        { color: colors.textMuted },
                    ]}
                >
                    PASSWORD
                </Text>

                <View
                    style={[
                        styles.card,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <TextInput
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        placeholder="Current password"
                        placeholderTextColor={colors.textFaint}
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                borderBottomColor: colors.separator,
                            },
                        ]}
                    />
                    <TextInput
                        value={nextPassword}
                        onChangeText={setNextPassword}
                        secureTextEntry
                        placeholder="New password"
                        placeholderTextColor={colors.textFaint}
                        style={[
                            styles.input,
                            styles.inputLast,
                            { color: colors.text },
                        ]}
                    />
                </View>

                <Pressable
                    onPress={handleChangePassword}
                    disabled={saving}
                    style={({ pressed }) => [
                        styles.save,
                        { backgroundColor: colors.tint },
                        pressed && styles.pressed,
                    ]}
                >
                    <Text
                        style={[
                            styles.saveText,
                            { color: colors.onTint },
                        ]}
                    >
                        {saving
                            ? 'Updating…'
                            : 'Update Password'}
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },

    content: {
        padding: 16,
        paddingTop: 12,
        paddingBottom: 40,
    },

    section: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.4,
        marginLeft: 16,
        marginBottom: 8,
    },

    card: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 28,
    },

    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    switchInfo: {
        flex: 1,
    },

    title: {
        fontSize: 17,
        fontWeight: '600',
    },

    description: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 4,
    },

    input: {
        fontSize: 17,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    inputLast: {
        borderBottomWidth: 0,
    },

    save: {
        borderRadius: 14,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },

    saveText: {
        fontSize: 17,
        fontWeight: '700',
    },

    pressed: {
        opacity: 0.75,
    },
});
