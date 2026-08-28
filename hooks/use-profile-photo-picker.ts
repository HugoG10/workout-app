import {
    ActionSheetIOS,
    Alert,
    Platform,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '@/context/auth-context';

export function useProfilePhotoPicker() {
    const { user, updateProfilePhoto } = useAuth();

    async function savePhoto(uri: string) {
        try {
            await updateProfilePhoto(uri);
        } catch (error) {
            Alert.alert(
                'Could not save photo',
                error instanceof Error
                    ? error.message
                    : 'Try again.'
            );
        }
    }

    async function pickFromLibrary() {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Photo access needed',
                'Allow photo library access to set a profile picture.'
            );
            return;
        }

        const result =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

        if (result.canceled) {
            return;
        }

        await savePhoto(result.assets[0].uri);
    }

    async function takePhoto() {
        const permission =
            await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Camera access needed',
                'Allow camera access to take a profile picture.'
            );
            return;
        }

        const result =
            await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

        if (result.canceled) {
            return;
        }

        await savePhoto(result.assets[0].uri);
    }

    async function removePhoto() {
        try {
            await updateProfilePhoto(null);
        } catch (error) {
            Alert.alert(
                'Could not remove photo',
                error instanceof Error
                    ? error.message
                    : 'Try again.'
            );
        }
    }

    function showPhotoOptions() {
        const hasPhoto = Boolean(user?.photoUri);

        if (Platform.OS === 'ios') {
            const options = hasPhoto
                ? [
                      'Take Photo',
                      'Choose from Library',
                      'Remove Photo',
                      'Cancel',
                  ]
                : [
                      'Take Photo',
                      'Choose from Library',
                      'Cancel',
                  ];

            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex: options.length - 1,
                    destructiveButtonIndex: hasPhoto
                        ? 2
                        : undefined,
                },
                (index) => {
                    if (index === 0) {
                        takePhoto();
                        return;
                    }

                    if (index === 1) {
                        pickFromLibrary();
                        return;
                    }

                    if (hasPhoto && index === 2) {
                        removePhoto();
                    }
                }
            );
            return;
        }

        Alert.alert(
            'Profile photo',
            'Add a photo from your camera or library.',
            [
                {
                    text: 'Take Photo',
                    onPress: takePhoto,
                },
                {
                    text: 'Choose from Library',
                    onPress: pickFromLibrary,
                },
                ...(hasPhoto
                    ? [
                          {
                              text: 'Remove Photo',
                              style: 'destructive' as const,
                              onPress: removePhoto,
                          },
                      ]
                    : []),
                {
                    text: 'Cancel',
                    style: 'cancel' as const,
                },
            ]
        );
    }

    return {
        showPhotoOptions,
    };
}
