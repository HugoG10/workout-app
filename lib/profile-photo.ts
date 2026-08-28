import { Platform } from 'react-native';

import { File, Paths } from 'expo-file-system';

export async function persistProfilePhoto(
    sourceUri: string,
    previousUri?: string | null
) {
    if (Platform.OS === 'web') {
        return sourceUri;
    }

    await deleteProfilePhoto(previousUri);

    const dest = new File(
        Paths.document,
        `profile-photo-${Date.now()}.jpg`
    );
    new File(sourceUri).copy(dest);

    return dest.uri;
}

export async function deleteProfilePhoto(
    uri?: string | null
) {
    if (!uri || Platform.OS === 'web') {
        return;
    }

    try {
        const file = new File(uri);
        if (file.exists) {
            file.delete();
        }
    } catch (error) {
        console.log(
            'Failed to delete profile photo:',
            error
        );
    }
}
