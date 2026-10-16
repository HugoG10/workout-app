import { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

type Props = {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onCancel: () => void;
    onConfirm: (password: string) => Promise<void> | void;
};

export function PasswordGate({
    visible,
    title,
    message,
    confirmLabel = 'Confirm',
    onCancel,
    onConfirm,
}: Props) {
    const { colors } = useAppTheme();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function submit() {
        if (busy) {
            return;
        }

        setBusy(true);
        setError(null);

        try {
            await onConfirm(password);
            setPassword('');
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : 'That password is incorrect.'
            );
        } finally {
            setBusy(false);
        }
    }

    function close() {
        setPassword('');
        setError(null);
        onCancel();
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={close}
        >
            <Pressable style={styles.backdrop} onPress={close} />
            <View style={styles.center}>
                <View
                    style={[
                        styles.card,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <Text style={[styles.title, { color: colors.text }]}>
                        {title}
                    </Text>
                    <Text
                        style={[
                            styles.message,
                            { color: colors.textSecondary },
                        ]}
                    >
                        {message}
                    </Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoFocus
                        placeholder="Password"
                        placeholderTextColor={colors.textFaint}
                        onSubmitEditing={submit}
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                backgroundColor: colors.fill,
                            },
                        ]}
                    />
                    {error ? (
                        <Text
                            style={[
                                styles.error,
                                { color: colors.destructive },
                            ]}
                        >
                            {error}
                        </Text>
                    ) : null}
                    <View style={styles.row}>
                        <Pressable
                            onPress={close}
                            style={styles.action}
                        >
                            <Text
                                style={[
                                    styles.actionText,
                                    { color: colors.textMuted },
                                ]}
                            >
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={submit}
                            style={styles.action}
                        >
                            <Text
                                style={[
                                    styles.actionText,
                                    { color: colors.tint },
                                ]}
                            >
                                {busy ? 'Checking…' : confirmLabel}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        padding: 28,
    },
    card: {
        borderRadius: 18,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    message: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 20,
    },
    input: {
        marginTop: 16,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    error: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 18,
        marginTop: 18,
    },
    action: {
        minHeight: 40,
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
