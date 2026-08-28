import { useMemo } from 'react';

import { type AppColors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export function useThemedStyles<T>(
    factory: (colors: AppColors) => T
) {
    const { colors } = useAppTheme();

    return useMemo(
        () => factory(colors),
        [colors, factory]
    );
}
