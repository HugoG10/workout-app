import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import {
    type AppColors,
    type ColorScheme,
    Palettes,
} from '@/constants/theme';
import { useSettings } from '@/context/settings-context';

export type { AppColors };

export function useAppTheme() {
    const { appearance } = useSettings();
    const systemScheme = useColorScheme();

    const scheme: ColorScheme =
        appearance === 'system'
            ? systemScheme === 'dark'
                ? 'dark'
                : 'light'
            : appearance;

    const colors = Palettes[scheme];

    return useMemo(
        () => ({
            appearance,
            scheme,
            colors,
            isDark: scheme === 'dark',
        }),
        [appearance, scheme, colors]
    );
}
