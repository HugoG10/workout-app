import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import {
    deleteProfilePhoto,
    persistProfilePhoto,
} from '@/lib/profile-photo';

export type AuthUser = {
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    photoUri: string | null;
};

type StoredAccount = {
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    photoUri: string | null;
    salt: string;
    passwordHash: string;
    faceIdEnabled: boolean;
};

type AuthContextType = {
    user: AuthUser | null;
    hasAccount: boolean;
    isUnlocked: boolean;
    faceIdEnabled: boolean;
    biometricsAvailable: boolean;
    biometricLabel: string;
    loading: boolean;

    signUp: (
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) => Promise<void>;

    signIn: (
        email: string,
        password: string
    ) => Promise<void>;

    unlockWithBiometrics: () => Promise<boolean>;

    setFaceIdEnabled: (
        enabled: boolean
    ) => Promise<boolean>;

    lock: () => void;

    removeAccount: () => Promise<void>;

    updateProfile: (
        firstName: string,
        lastName: string,
        email: string
    ) => Promise<void>;

    updateProfilePhoto: (
        sourceUri: string | null
    ) => Promise<void>;

    changePassword: (
        currentPassword: string,
        nextPassword: string
    ) => Promise<void>;
};

const AuthContext =
    createContext<AuthContextType | undefined>(
        undefined
    );

const ACCOUNT_KEY = 'auth-account';

function bytesToHex(bytes: Uint8Array) {
    return Array.from(bytes)
        .map((byte) =>
            byte.toString(16).padStart(2, '0')
        )
        .join('');
}

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

function splitLegacyName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    return {
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' '),
    };
}

function fullName(firstName: string, lastName: string) {
    return [firstName.trim(), lastName.trim()]
        .filter(Boolean)
        .join(' ');
}

function normalizeAccount(
    raw: Partial<StoredAccount> & {
        name?: string;
    }
): StoredAccount | null {
    if (
        !raw.email ||
        !raw.salt ||
        !raw.passwordHash
    ) {
        return null;
    }

    const firstName =
        raw.firstName?.trim() ||
        splitLegacyName(raw.name ?? '').firstName;
    const lastName =
        raw.lastName?.trim() ||
        (raw.firstName
            ? ''
            : splitLegacyName(raw.name ?? '').lastName);

    return {
        firstName,
        lastName,
        name: fullName(firstName, lastName),
        email: raw.email,
        photoUri: raw.photoUri ?? null,
        salt: raw.salt,
        passwordHash: raw.passwordHash,
        faceIdEnabled: raw.faceIdEnabled ?? false,
    };
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );
}

async function hashPassword(
    password: string,
    salt: string
) {
    return Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${salt}:${password}`
    );
}

async function writeSecret(
    key: string,
    value: string
) {
    if (await SecureStore.isAvailableAsync()) {
        await SecureStore.setItemAsync(
            key,
            value
        );
        return;
    }

    await AsyncStorage.setItem(key, value);
}

async function readSecret(key: string) {
    if (await SecureStore.isAvailableAsync()) {
        return SecureStore.getItemAsync(key);
    }

    return AsyncStorage.getItem(key);
}

async function deleteSecret(key: string) {
    if (await SecureStore.isAvailableAsync()) {
        await SecureStore.deleteItemAsync(key);
        return;
    }

    await AsyncStorage.removeItem(key);
}

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [account, setAccount] =
        useState<StoredAccount | null>(null);
    const [isUnlocked, setIsUnlocked] =
        useState(false);
    const [loading, setLoading] = useState(true);
    const [
        biometricsAvailable,
        setBiometricsAvailable,
    ] = useState(false);
    const [biometricLabel, setBiometricLabel] =
        useState('Face ID');

    const hasAccount = account !== null;

    const user: AuthUser | null = account
        ? {
              firstName: account.firstName,
              lastName: account.lastName,
              name: fullName(
                  account.firstName,
                  account.lastName
              ),
              email: account.email,
              photoUri: account.photoUri,
          }
        : null;

    const faceIdEnabled =
        account?.faceIdEnabled ?? false;

    useEffect(() => {
        loadAuth();
    }, []);

    async function loadAuth() {
        try {
            const [
                savedAccount,
                hardware,
                enrolled,
                types,
            ] = await Promise.all([
                readSecret(ACCOUNT_KEY),
                LocalAuthentication.hasHardwareAsync().catch(
                    () => false
                ),
                LocalAuthentication.isEnrolledAsync().catch(
                    () => false
                ),
                LocalAuthentication.supportedAuthenticationTypesAsync().catch(
                    () => [] as LocalAuthentication.AuthenticationType[]
                ),
            ]);

            const supportsFace = types.includes(
                LocalAuthentication.AuthenticationType
                    .FACIAL_RECOGNITION
            );
            const supportsFinger = types.includes(
                LocalAuthentication.AuthenticationType
                    .FINGERPRINT
            );

            if (supportsFace) {
                setBiometricLabel(
                    Platform.OS === 'ios'
                        ? 'Face ID'
                        : 'Face Unlock'
                );
            } else if (supportsFinger) {
                setBiometricLabel(
                    Platform.OS === 'ios'
                        ? 'Touch ID'
                        : 'Fingerprint'
                );
            } else {
                setBiometricLabel('Biometrics');
            }

            setBiometricsAvailable(
                hardware && enrolled
            );

            if (savedAccount) {
                const parsed = JSON.parse(
                    savedAccount
                ) as Partial<StoredAccount>;

                const normalized =
                    normalizeAccount(parsed);

                if (normalized) {
                    setAccount(normalized);
                }
            }
        } catch (error) {
            console.log(
                'Failed to load account:',
                error
            );
        } finally {
            setLoading(false);
        }
    }

    async function persistAccount(
        nextAccount: StoredAccount
    ) {
        setAccount(nextAccount);

        await writeSecret(
            ACCOUNT_KEY,
            JSON.stringify(nextAccount)
        );
    }

    async function signUp(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) {
        if (account) {
            throw new Error(
                'An account already exists on this device. Sign in instead.'
            );
        }

        const trimmedFirst = firstName.trim();
        const trimmedLast = lastName.trim();
        const normalized =
            normalizeEmail(email);

        if (trimmedFirst.length < 1) {
            throw new Error(
                'Enter your first name so we can greet you.'
            );
        }

        if (trimmedLast.length < 1) {
            throw new Error(
                'Enter your last name.'
            );
        }

        if (!isValidEmail(normalized)) {
            throw new Error(
                'Enter a valid email address.'
            );
        }

        if (password.length < 6) {
            throw new Error(
                'Password must be at least 6 characters.'
            );
        }

        const salt = bytesToHex(
            Crypto.getRandomBytes(16)
        );

        const passwordHash = await hashPassword(
            password,
            salt
        );

        const nextAccount: StoredAccount = {
            firstName: trimmedFirst,
            lastName: trimmedLast,
            name: fullName(trimmedFirst, trimmedLast),
            email: normalized,
            photoUri: null,
            salt,
            passwordHash,
            faceIdEnabled: false,
        };

        await persistAccount(nextAccount);
        setIsUnlocked(true);
    }

    async function signIn(
        email: string,
        password: string
    ) {
        if (!account) {
            throw new Error(
                'No account on this device yet. Create one first.'
            );
        }

        const normalized =
            normalizeEmail(email);

        if (
            normalized !== account.email ||
            password.length === 0
        ) {
            throw new Error(
                'Email or password is incorrect.'
            );
        }

        const passwordHash = await hashPassword(
            password,
            account.salt
        );

        if (passwordHash !== account.passwordHash) {
            throw new Error(
                'Email or password is incorrect.'
            );
        }

        setIsUnlocked(true);
    }

    const unlockWithBiometrics = useCallback(
        async () => {
            if (!account?.faceIdEnabled) {
                return false;
            }

            try {
                const result =
                    await LocalAuthentication.authenticateAsync(
                        {
                            promptMessage: `Unlock Workout with ${biometricLabel}`,
                            fallbackLabel: 'Use Password',
                            cancelLabel: 'Cancel',
                            disableDeviceFallback: false,
                        }
                    );

                if (result.success) {
                    setIsUnlocked(true);
                    return true;
                }

                return false;
            } catch (error) {
                console.log(
                    'Biometric unlock failed:',
                    error
                );
                return false;
            }
        },
        [account?.faceIdEnabled, biometricLabel]
    );

    async function setFaceIdEnabled(
        enabled: boolean
    ) {
        if (!account) {
            return false;
        }

        if (enabled) {
            if (!biometricsAvailable) {
                throw new Error(
                    `${biometricLabel} is not set up on this device.`
                );
            }

            const result =
                await LocalAuthentication.authenticateAsync(
                    {
                        promptMessage: `Enable ${biometricLabel} for Workout`,
                        fallbackLabel: 'Use Passcode',
                        cancelLabel: 'Cancel',
                        disableDeviceFallback: false,
                    }
                );

            if (!result.success) {
                return false;
            }
        }

        await persistAccount({
            ...account,
            faceIdEnabled: enabled,
        });

        return true;
    }

    function lock() {
        setIsUnlocked(false);
    }

    async function removeAccount() {
        await deleteProfilePhoto(account?.photoUri);
        await deleteSecret(ACCOUNT_KEY);
        setAccount(null);
        setIsUnlocked(false);
    }

    async function updateProfile(
        firstName: string,
        lastName: string,
        email: string
    ) {
        if (!account) {
            throw new Error(
                'No account on this device.'
            );
        }

        const trimmedFirst = firstName.trim();
        const trimmedLast = lastName.trim();
        const normalized = normalizeEmail(email);

        if (trimmedFirst.length < 1) {
            throw new Error(
                'Enter your first name so we can greet you.'
            );
        }

        if (trimmedLast.length < 1) {
            throw new Error(
                'Enter your last name.'
            );
        }

        if (!isValidEmail(normalized)) {
            throw new Error(
                'Enter a valid email address.'
            );
        }

        await persistAccount({
            ...account,
            firstName: trimmedFirst,
            lastName: trimmedLast,
            name: fullName(trimmedFirst, trimmedLast),
            email: normalized,
        });
    }

    async function updateProfilePhoto(
        sourceUri: string | null
    ) {
        if (!account) {
            throw new Error(
                'No account on this device.'
            );
        }

        if (!sourceUri) {
            await deleteProfilePhoto(account.photoUri);
            await persistAccount({
                ...account,
                photoUri: null,
            });
            return;
        }

        const photoUri = await persistProfilePhoto(
            sourceUri,
            account.photoUri
        );

        await persistAccount({
            ...account,
            photoUri,
        });
    }

    async function changePassword(
        currentPassword: string,
        nextPassword: string
    ) {
        if (!account) {
            throw new Error(
                'No account on this device.'
            );
        }

        const currentHash = await hashPassword(
            currentPassword,
            account.salt
        );

        if (currentHash !== account.passwordHash) {
            throw new Error(
                'Current password is incorrect.'
            );
        }

        if (nextPassword.length < 6) {
            throw new Error(
                'Password must be at least 6 characters.'
            );
        }

        const salt = bytesToHex(
            Crypto.getRandomBytes(16)
        );

        const passwordHash = await hashPassword(
            nextPassword,
            salt
        );

        await persistAccount({
            ...account,
            salt,
            passwordHash,
        });
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                hasAccount,
                isUnlocked,
                faceIdEnabled,
                biometricsAvailable,
                biometricLabel,
                loading,
                signUp,
                signIn,
                unlockWithBiometrics,
                setFaceIdEnabled,
                lock,
                removeAccount,
                updateProfile,
                updateProfilePhoto,
                changePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider'
        );
    }

    return context;
}
