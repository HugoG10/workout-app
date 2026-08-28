import { useState } from 'react';
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

import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProfilePhotoPicker } from '@/hooks/use-profile-photo-picker';
import { ProfileAvatar } from '@/components/profile-avatar';

export default function EditProfileScreen() {
    const { colors } = useAppTheme();
    const { user, updateProfile } = useAuth();
    const { showPhotoOptions } = useProfilePhotoPicker();

    const initials = [
        user?.firstName?.trim()[0],
        user?.lastName?.trim()[0],
    ]
        .filter(Boolean)
        .join('')
        .toUpperCase() || 'W';

    const [firstName, setFirstName] = useState(
        user?.firstName ?? ''
    );
    const [lastName, setLastName] = useState(
        user?.lastName ?? ''
    );
    const [email, setEmail] = useState(user?.email ?? '');
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        if (saving) {
            return;
        }

        setSaving(true);

        try {
            await updateProfile(
                firstName,
                lastName,
                email
            );
            router.back();
        } catch (error) {
            Alert.alert(
                'Could not save',
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
                <Pressable
                    onPress={showPhotoOptions}
                    style={styles.photoBlock}
                >
                    <ProfileAvatar
                        uri={user?.photoUri}
                        initials={initials}
                        colors={colors}
                        size={108}
                        editable
                        onPress={showPhotoOptions}
                    />
                    <Text
                        style={[
                            styles.photoLabel,
                            { color: colors.tint },
                        ]}
                    >
                        {user?.photoUri
                            ? 'Change photo'
                            : 'Add photo'}
                    </Text>
                </Pressable>

                <View
                    style={[
                        styles.card,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <Text
                        style={[
                            styles.label,
                            { color: colors.textMuted },
                        ]}
                    >
                        FIRST NAME
                    </Text>
                    <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        autoCorrect={false}
                        textContentType="givenName"
                        placeholder="Hugo"
                        placeholderTextColor={colors.textFaint}
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                borderBottomColor: colors.separator,
                            },
                        ]}
                    />

                    <Text
                        style={[
                            styles.label,
                            styles.labelSpaced,
                            { color: colors.textMuted },
                        ]}
                    >
                        LAST NAME
                    </Text>
                    <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                        autoCorrect={false}
                        textContentType="familyName"
                        placeholder="Garcia"
                        placeholderTextColor={colors.textFaint}
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                borderBottomColor: colors.separator,
                            },
                        ]}
                    />

                    <Text
                        style={[
                            styles.label,
                            styles.labelSpaced,
                            { color: colors.textMuted },
                        ]}
                    >
                        EMAIL
                    </Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        placeholder="you@email.com"
                        placeholderTextColor={colors.textFaint}
                        style={[
                            styles.input,
                            styles.inputLast,
                            { color: colors.text },
                        ]}
                    />
                </View>

                <Pressable
                    onPress={handleSave}
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
                        {saving ? 'Saving…' : 'Save'}
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
    },

    photoBlock: {
        alignItems: 'center',
        marginBottom: 22,
        gap: 10,
    },

    photoLabel: {
        fontSize: 16,
        fontWeight: '600',
    },

    card: {
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },

    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.6,
        marginBottom: 8,
    },

    labelSpaced: {
        marginTop: 16,
    },

    input: {
        fontSize: 17,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    inputLast: {
        borderBottomWidth: 0,
        marginBottom: 8,
    },

    save: {
        marginTop: 20,
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
