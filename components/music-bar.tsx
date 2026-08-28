import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useSettings } from '@/context/settings-context';
import {
    musicServiceLabel,
    openGymMusic,
} from '@/lib/music';

type Props = {
    compact?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
};

export function MusicBar({
    compact = false,
    collapsed = false,
    onToggleCollapse,
}: Props) {
    const {
        musicService,
        gymPlaylistUrl,
    } = useSettings();

    const hasPlaylist =
        gymPlaylistUrl.trim() !== '';

    function openMusic() {
        openGymMusic(
            musicService,
            gymPlaylistUrl
        );
    }

    if (collapsed) {
        return (
            <View
                style={[
                    styles.bar,
                    styles.barCollapsed,
                    compact && styles.barCompact,
                ]}
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open gym music"
                    style={({ pressed }) => [
                        styles.collapsedMain,
                        pressed && styles.pressed,
                    ]}
                    onPress={openMusic}
                >
                    <View
                        style={[
                            styles.icon,
                            styles.iconCollapsed,
                            musicService === 'apple'
                                ? styles.iconApple
                                : styles.iconSpotify,
                        ]}
                    >
                        <Ionicons
                            name="musical-notes"
                            size={16}
                            color="#fff"
                        />
                    </View>

                    <Text
                        style={styles.collapsedTitle}
                        numberOfLines={1}
                    >
                        {hasPlaylist
                            ? 'Gym playlist'
                            : 'Gym music'}
                    </Text>
                </Pressable>

                {onToggleCollapse ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Show music player"
                        hitSlop={10}
                        onPress={onToggleCollapse}
                        style={({ pressed }) => [
                            styles.collapseButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Ionicons
                            name="chevron-up"
                            size={20}
                            color="rgba(255,255,255,0.85)"
                        />
                    </Pressable>
                ) : null}
            </View>
        );
    }

    return (
        <View
            style={[
                styles.bar,
                compact && styles.barCompact,
            ]}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open gym music"
                style={({ pressed }) => [
                    styles.main,
                    pressed && styles.pressed,
                ]}
                onPress={openMusic}
            >
                <View
                    style={[
                        styles.icon,
                        musicService === 'apple'
                            ? styles.iconApple
                            : styles.iconSpotify,
                    ]}
                >
                    <Ionicons
                        name="musical-notes"
                        size={20}
                        color="#fff"
                    />
                </View>

                <View style={styles.info}>
                    <Text style={styles.title}>
                        {hasPlaylist
                            ? 'Gym playlist'
                            : 'Gym music'}
                    </Text>

                    <Text style={styles.subtitle}>
                        {musicServiceLabel(musicService)}
                        {hasPlaylist
                            ? ' • Your playlist'
                            : ' • Workout mix'}
                    </Text>
                </View>

                <Text style={styles.action}>
                    Open
                </Text>
            </Pressable>

            {onToggleCollapse ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Hide music player"
                    hitSlop={10}
                    onPress={onToggleCollapse}
                    style={({ pressed }) => [
                        styles.collapseButton,
                        pressed && styles.pressed,
                    ]}
                >
                    <Ionicons
                        name="chevron-down"
                        size={20}
                        color="rgba(255,255,255,0.85)"
                    />
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        backgroundColor: '#1c1c1e',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },

    barCollapsed: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },

    barCompact: {
        marginBottom: 20,
    },

    main: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    collapsedMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 36,
    },

    icon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    iconCollapsed: {
        width: 28,
        height: 28,
        borderRadius: 8,
        marginRight: 10,
    },

    iconSpotify: {
        backgroundColor: '#1DB954',
    },

    iconApple: {
        backgroundColor: '#FC3C44',
    },

    info: {
        flex: 1,
    },

    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    collapsedTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },

    subtitle: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 13,
        marginTop: 2,
    },

    action: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },

    collapseButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },

    pressed: {
        opacity: 0.85,
    },
});
