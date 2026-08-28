import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useSettings } from '@/context/settings-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import { ScreenTip } from '@/components/screen-tip';
import {
    WORKOUT_MIXES,
    musicServiceLabel,
    openGymMusic,
    openWorkoutMix,
} from '@/lib/music';

export default function MusicScreen() {
    const styles = useThemedStyles(createStyles);

    const insets = useScreenInsets();
    const {
        musicService,
        setMusicService,
        gymPlaylistUrl,
        setGymPlaylistUrl,
    } = useSettings();

    const hasPlaylist = gymPlaylistUrl.trim() !== '';
    const serviceName = musicServiceLabel(musicService);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + 4 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>Music</Text>

            <Text style={styles.subtitle}>
                Pick Spotify or Apple Music, save a gym
                playlist, and open it in one tap.
            </Text>

            <ScreenTip
                id="music"
                title="Gym playlist"
                body="Pick Spotify or Apple Music, then paste a playlist link. During a workout, open it from the bar at the bottom."
            />

            <Pressable
                style={({ pressed }) => [
                    styles.hero,
                    musicService === 'apple'
                        ? styles.heroApple
                        : styles.heroSpotify,
                    pressed && styles.pressed,
                ]}
                onPress={() =>
                    openGymMusic(
                        musicService,
                        gymPlaylistUrl
                    )
                }
            >
                <View style={styles.heroIcon}>
                    <Ionicons
                        name="play"
                        size={28}
                        color="#fff"
                    />
                </View>

                <View style={styles.heroInfo}>
                    <Text style={styles.heroKicker}>
                        NOW PLAYING
                    </Text>

                    <Text style={styles.heroTitle}>
                        {hasPlaylist
                            ? 'Your gym playlist'
                            : 'Workout mix'}
                    </Text>

                    <Text style={styles.heroSubtitle}>
                        Opens in {serviceName}
                    </Text>
                </View>

                <Text style={styles.heroAction}>
                    Open
                </Text>
            </Pressable>

            <Text style={styles.sectionLabel}>
                MUSIC APP
            </Text>

            <View style={styles.serviceRow}>
                <Pressable
                    style={[
                        styles.serviceCard,
                        musicService === 'spotify' &&
                            styles.serviceCardSelected,
                    ]}
                    onPress={() =>
                        setMusicService('spotify')
                    }
                >
                    <Ionicons
                        name="musical-notes"
                        size={22}
                        color={
                            musicService === 'spotify'
                                ? '#fff'
                                : '#1DB954'
                        }
                    />
                    <Text
                        style={[
                            styles.serviceName,
                            musicService === 'spotify' &&
                                styles.serviceNameSelected,
                        ]}
                    >
                        Spotify
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.serviceCard,
                        musicService === 'apple' &&
                            styles.serviceCardAppleSelected,
                    ]}
                    onPress={() =>
                        setMusicService('apple')
                    }
                >
                    <Ionicons
                        name="musical-notes"
                        size={22}
                        color={
                            musicService === 'apple'
                                ? '#fff'
                                : '#FC3C44'
                        }
                    />
                    <Text
                        style={[
                            styles.serviceName,
                            musicService === 'apple' &&
                                styles.serviceNameSelected,
                        ]}
                    >
                        Apple Music
                    </Text>
                </Pressable>
            </View>

            <Text style={styles.sectionLabel}>
                YOUR PLAYLIST
            </Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>
                    Playlist link
                </Text>

                <Text style={styles.cardDescription}>
                    Paste a {serviceName} playlist. If this
                    is empty, Open uses a gym mix search.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder={`Paste a ${serviceName} link`}
                    placeholderTextColor={
                        '#8e8e93'
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={gymPlaylistUrl}
                    onChangeText={setGymPlaylistUrl}
                />
            </View>

            <Text style={styles.sectionLabel}>
                MIXES
            </Text>

            {WORKOUT_MIXES.map((mix) => (
                <Pressable
                    key={mix.id}
                    style={({ pressed }) => [
                        styles.mixCard,
                        pressed && styles.pressed,
                    ]}
                    onPress={() =>
                        openWorkoutMix(mix, musicService)
                    }
                >
                    <View style={styles.mixIcon}>
                        <Ionicons
                            name="headset-outline"
                            size={20}
                            color="#007AFF"
                        />
                    </View>

                    <View style={styles.mixInfo}>
                        <Text style={styles.mixTitle}>
                            {mix.title}
                        </Text>

                        <Text style={styles.mixSubtitle}>
                            {mix.subtitle}
                        </Text>
                    </View>

                    <Text style={styles.mixAction}>
                        Play
                    </Text>
                </Pressable>
            ))}
        </ScrollView>
    );
}

function createStyles(c: AppColors) {
    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.background,
    },

    content: {
        padding: 20,
        paddingBottom: 60,
    },

    title: {
        color: c.text,
        fontSize: 36,
        fontWeight: '700',
        letterSpacing: -0.5,
    },

    subtitle: {
        color: c.textSecondary,
        fontSize: 16,
        lineHeight: 22,
        marginTop: 4,
        marginBottom: 24,
    },

    hero: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 28,
        flexDirection: 'row',
        alignItems: 'center',
    },

    heroSpotify: {
        backgroundColor: '#118C3B',
    },

    heroApple: {
        backgroundColor: '#FC3C44',
    },

    heroIcon: {
        width: 54,
        height: 54,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    heroInfo: {
        flex: 1,
    },

    heroKicker: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
    },

    heroTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginTop: 4,
    },

    heroSubtitle: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 13,
        marginTop: 3,
    },

    heroAction: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },

    sectionLabel: {
        color: c.textMuted,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 12,
    },

    serviceRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 28,
    },

    serviceCard: {
        flex: 1,
        backgroundColor: c.card,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },

    serviceCardSelected: {
        backgroundColor: '#1DB954',
        borderColor: '#1DB954',
    },

    serviceCardAppleSelected: {
        backgroundColor: '#FC3C44',
        borderColor: '#FC3C44',
    },

    serviceName: {
        color: c.text,
        fontSize: 14,
        fontWeight: '700',
    },

    serviceNameSelected: {
        color: '#fff',
    },

    card: {
        backgroundColor: c.card,
        borderRadius: 18,
        padding: 18,
        marginBottom: 28,
    },

    cardTitle: {
        color: c.text,
        fontSize: 17,
        fontWeight: '700',
    },

    cardDescription: {
        color: c.textMuted,
        fontSize: 13,
        lineHeight: 18,
        marginTop: 4,
        marginBottom: 14,
    },

    input: {
        backgroundColor: c.fill,
        color: c.text,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 15,
    },

    mixCard: {
        backgroundColor: c.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    mixIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: c.tintSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    mixInfo: {
        flex: 1,
    },

    mixTitle: {
        color: c.text,
        fontSize: 16,
        fontWeight: '700',
    },

    mixSubtitle: {
        color: c.textMuted,
        fontSize: 13,
        marginTop: 2,
    },

    mixAction: {
        color: c.tint,
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },

    pressed: {
        opacity: 0.85,
    },
});
}

