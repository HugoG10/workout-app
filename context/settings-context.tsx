import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

import { Appearance } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppearanceMode } from '@/constants/theme';
import { MusicService } from '@/lib/music';

export type WeightUnit = 'lb' | 'kg';
export type { AppearanceMode };

export type TipId =
    | 'workout'
    | 'active-workout'
    | 'exercises'
    | 'exercise-detail'
    | 'music'
    | 'history'
    | 'profile'
    | 'create-routine';

type SettingsContextType = {
    defaultRestTime: number;

    setDefaultRestTime: (
        seconds: number
    ) => void;

    weightUnit: WeightUnit;

    setWeightUnit: (
        unit: WeightUnit
    ) => void;

    musicService: MusicService;

    setMusicService: (
        service: MusicService
    ) => void;

    gymPlaylistUrl: string;

    setGymPlaylistUrl: (
        url: string
    ) => void;

    appearance: AppearanceMode;

    setAppearance: (
        mode: AppearanceMode
    ) => void;

    musicBarCollapsed: boolean;

    setMusicBarCollapsed: (
        collapsed: boolean
    ) => void;

    isTipSeen: (id: TipId) => boolean;

    dismissTip: (id: TipId) => void;

    resetTips: () => void;

    loading: boolean;
};

const SettingsContext =
    createContext<SettingsContextType | undefined>(
        undefined
    );

const REST_TIME_KEY =
    'default-rest-time';

const WEIGHT_UNIT_KEY =
    'weight-unit';

const MUSIC_SERVICE_KEY =
    'music-service';

const GYM_PLAYLIST_KEY =
    'gym-playlist-url';

const APPEARANCE_KEY = 'appearance';

const MUSIC_BAR_COLLAPSED_KEY =
    'music-bar-collapsed';

const SEEN_TIPS_KEY = 'seen-screen-tips';

function applyColorScheme(mode: AppearanceMode) {
    if (mode === 'system') {
        Appearance.setColorScheme(null);
        return;
    }

    Appearance.setColorScheme(mode);
}

export function SettingsProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [
        defaultRestTime,
        setDefaultRestTimeState,
    ] = useState(90);

    const [
        weightUnit,
        setWeightUnitState,
    ] = useState<WeightUnit>('lb');

    const [
        musicService,
        setMusicServiceState,
    ] = useState<MusicService>('spotify');

    const [
        gymPlaylistUrl,
        setGymPlaylistUrlState,
    ] = useState('');

    const [appearance, setAppearanceState] =
        useState<AppearanceMode>('system');

    const [
        musicBarCollapsed,
        setMusicBarCollapsedState,
    ] = useState(false);

    const [seenTips, setSeenTips] = useState<
        TipId[]
    >([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const [
                savedRestTime,
                savedWeightUnit,
                savedMusicService,
                savedPlaylistUrl,
                savedAppearance,
                savedMusicBarCollapsed,
                savedSeenTips,
            ] = await Promise.all([
                AsyncStorage.getItem(
                    REST_TIME_KEY
                ),

                AsyncStorage.getItem(
                    WEIGHT_UNIT_KEY
                ),

                AsyncStorage.getItem(
                    MUSIC_SERVICE_KEY
                ),

                AsyncStorage.getItem(
                    GYM_PLAYLIST_KEY
                ),

                AsyncStorage.getItem(
                    APPEARANCE_KEY
                ),

                AsyncStorage.getItem(
                    MUSIC_BAR_COLLAPSED_KEY
                ),

                AsyncStorage.getItem(
                    SEEN_TIPS_KEY
                ),
            ]);

            if (savedRestTime) {
                const parsedRestTime =
                    Number(savedRestTime);

                if (
                    !Number.isNaN(parsedRestTime)
                ) {
                    setDefaultRestTimeState(
                        parsedRestTime
                    );
                }
            }

            if (
                savedWeightUnit === 'lb' ||
                savedWeightUnit === 'kg'
            ) {
                setWeightUnitState(
                    savedWeightUnit
                );
            }

            if (
                savedMusicService === 'spotify' ||
                savedMusicService === 'apple'
            ) {
                setMusicServiceState(
                    savedMusicService
                );
            }

            if (savedPlaylistUrl) {
                setGymPlaylistUrlState(
                    savedPlaylistUrl
                );
            }

            if (
                savedAppearance === 'light' ||
                savedAppearance === 'dark' ||
                savedAppearance === 'system'
            ) {
                setAppearanceState(savedAppearance);
                applyColorScheme(savedAppearance);
            }

            setMusicBarCollapsedState(
                savedMusicBarCollapsed === 'true'
            );

            if (savedSeenTips) {
                try {
                    const parsed = JSON.parse(
                        savedSeenTips
                    );

                    if (Array.isArray(parsed)) {
                        setSeenTips(
                            parsed.filter(
                                (id): id is TipId =>
                                    typeof id === 'string'
                            )
                        );
                    }
                } catch {
                    setSeenTips([]);
                }
            }
        } catch (error) {
            console.log(
                'Failed to load settings:',
                error
            );
        } finally {
            setLoading(false);
        }
    }

    function setDefaultRestTime(
        seconds: number
    ) {
        setDefaultRestTimeState(
            seconds
        );

        AsyncStorage.setItem(
            REST_TIME_KEY,
            seconds.toString()
        ).catch((error) => {
            console.log(
                'Failed to save rest time:',
                error
            );
        });
    }

    function setWeightUnit(
        unit: WeightUnit
    ) {
        setWeightUnitState(unit);

        AsyncStorage.setItem(
            WEIGHT_UNIT_KEY,
            unit
        ).catch((error) => {
            console.log(
                'Failed to save weight unit:',
                error
            );
        });
    }

    function setMusicService(
        service: MusicService
    ) {
        setMusicServiceState(service);

        AsyncStorage.setItem(
            MUSIC_SERVICE_KEY,
            service
        ).catch((error) => {
            console.log(
                'Failed to save music service:',
                error
            );
        });
    }

    function setGymPlaylistUrl(url: string) {
        setGymPlaylistUrlState(url);

        AsyncStorage.setItem(
            GYM_PLAYLIST_KEY,
            url
        ).catch((error) => {
            console.log(
                'Failed to save playlist:',
                error
            );
        });
    }

    function setAppearance(mode: AppearanceMode) {
        setAppearanceState(mode);
        applyColorScheme(mode);

        AsyncStorage.setItem(
            APPEARANCE_KEY,
            mode
        ).catch((error) => {
            console.log(
                'Failed to save appearance:',
                error
            );
        });
    }

    function setMusicBarCollapsed(
        collapsed: boolean
    ) {
        setMusicBarCollapsedState(collapsed);

        AsyncStorage.setItem(
            MUSIC_BAR_COLLAPSED_KEY,
            collapsed ? 'true' : 'false'
        ).catch((error) => {
            console.log(
                'Failed to save music bar:',
                error
            );
        });
    }

    function isTipSeen(id: TipId) {
        return seenTips.includes(id);
    }

    function persistSeenTips(ids: TipId[]) {
        AsyncStorage.setItem(
            SEEN_TIPS_KEY,
            JSON.stringify(ids)
        ).catch((error) => {
            console.log(
                'Failed to save tips:',
                error
            );
        });
    }

    function dismissTip(id: TipId) {
        setSeenTips((current) => {
            if (current.includes(id)) {
                return current;
            }

            const next = [...current, id];
            persistSeenTips(next);
            return next;
        });
    }

    function resetTips() {
        setSeenTips([]);
        persistSeenTips([]);
    }

    return (
        <SettingsContext.Provider
            value={{
                defaultRestTime,
                setDefaultRestTime,

                weightUnit,
                setWeightUnit,

                musicService,
                setMusicService,

                gymPlaylistUrl,
                setGymPlaylistUrl,

                appearance,
                setAppearance,

                musicBarCollapsed,
                setMusicBarCollapsed,

                isTipSeen,
                dismissTip,
                resetTips,

                loading,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context =
        useContext(SettingsContext);

    if (!context) {
        throw new Error(
            'useSettings must be used inside SettingsProvider'
        );
    }

    return context;
}