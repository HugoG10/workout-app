import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useScreenInsets() {
    const insets = useSafeAreaInsets();

    return {
        top: insets.top + 8,
        bottom: Math.max(insets.bottom, 12),
        rawBottom: insets.bottom,
    };
}
