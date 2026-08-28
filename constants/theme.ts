import { Platform } from 'react-native';

export type AppearanceMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

export type AppColors = {
    background: string;
    card: string;
    fill: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    textFaint: string;
    tint: string;
    tintSoft: string;
    onTint: string;
    separator: string;
    separatorSoft: string;
    destructive: string;
    success: string;
    tabBar: string;
    switchOff: string;
    input: string;
    hero: string;
    heroText: string;
    heroMuted: string;
    muscleIdle: string;
    muscleOutline: string;
    muscleSecondary: string;
    chartBar: string;
    dangerSoft: string;
    successSoft: string;
};

export const Palettes: Record<ColorScheme, AppColors> = {
    light: {
        background: '#f5f5f7',
        card: '#ffffff',
        fill: '#f2f2f7',
        text: '#1c1c1e',
        textSecondary: '#777777',
        textMuted: '#888888',
        textFaint: '#999999',
        tint: '#007AFF',
        tintSoft: '#eef5ff',
        onTint: '#ffffff',
        separator: '#dddddd',
        separatorSoft: '#eeeeee',
        destructive: '#ff3b30',
        success: '#34c759',
        tabBar: '#ffffff',
        switchOff: '#e5e5ea',
        input: '#ffffff',
        hero: '#1c1c1e',
        heroText: '#ffffff',
        heroMuted: 'rgba(255,255,255,0.7)',
        muscleIdle: '#C7C7CC',
        muscleOutline: '#C7C7CC',
        muscleSecondary: '#74B9FF',
        chartBar: '#dceaff',
        dangerSoft: '#fff0ef',
        successSoft: '#eefaf1',
    },
    dark: {
        background: '#000000',
        card: '#1c1c1e',
        fill: '#2c2c2e',
        text: '#ffffff',
        textSecondary: '#d1d1d6',
        textMuted: '#c7c7cc',
        textFaint: '#aeaeb2',
        tint: '#0A84FF',
        tintSoft: '#1c3f7a',
        onTint: '#ffffff',
        separator: '#48484a',
        separatorSoft: '#3a3a3c',
        destructive: '#ff453a',
        success: '#32d74b',
        tabBar: '#1c1c1e',
        switchOff: '#39393d',
        input: '#1c1c1e',
        hero: '#2c2c2e',
        heroText: '#ffffff',
        heroMuted: 'rgba(255,255,255,0.78)',
        muscleIdle: '#b0b0b5',
        muscleOutline: '#e5e5ea',
        muscleSecondary: '#7AB8FF',
        chartBar: '#3a5a94',
        dangerSoft: '#3d1f1f',
        successSoft: '#1a4a32',
    },
};

export const Colors = {
    light: {
        text: Palettes.light.text,
        background: Palettes.light.background,
        tint: Palettes.light.tint,
        icon: Palettes.light.textSecondary,
        tabIconDefault: Palettes.light.textSecondary,
        tabIconSelected: Palettes.light.tint,
    },
    dark: {
        text: Palettes.dark.text,
        background: Palettes.dark.background,
        tint: Palettes.dark.tint,
        icon: Palettes.dark.textSecondary,
        tabIconDefault: Palettes.dark.textSecondary,
        tabIconSelected: Palettes.dark.tint,
    },
};

export const Fonts = Platform.select({
    ios: {
        sans: 'system-ui',
        serif: 'ui-serif',
        rounded: 'ui-rounded',
        mono: 'ui-monospace',
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace',
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded:
            "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});
