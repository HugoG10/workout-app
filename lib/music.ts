import { Alert, Linking } from 'react-native';

export type MusicService = 'spotify' | 'apple';

export type WorkoutMix = {
    id: string;
    title: string;
    subtitle: string;
    spotify: string;
    apple: string;
};

export const WORKOUT_MIXES: WorkoutMix[] = [
    {
        id: 'lifting',
        title: 'Heavy Lifting',
        subtitle: 'Slow, loud, focused',
        spotify:
            'https://open.spotify.com/search/heavy%20lifting%20workout',
        apple:
            'https://music.apple.com/search?term=heavy%20lifting%20workout',
    },
    {
        id: 'pump',
        title: 'Pump-Up',
        subtitle: 'High energy for the whole session',
        spotify:
            'https://open.spotify.com/search/gym%20pump%20up',
        apple:
            'https://music.apple.com/search?term=gym%20pump%20up',
    },
    {
        id: 'hiphop',
        title: 'Hip-Hop Gym',
        subtitle: 'Beats for barbell work',
        spotify:
            'https://open.spotify.com/search/hip%20hop%20gym',
        apple:
            'https://music.apple.com/search?term=hip%20hop%20gym',
    },
    {
        id: 'edm',
        title: 'EDM Drive',
        subtitle: 'Four-on-the-floor cardio',
        spotify:
            'https://open.spotify.com/search/edm%20workout',
        apple:
            'https://music.apple.com/search?term=edm%20workout',
    },
    {
        id: 'warmup',
        title: 'Warm Up',
        subtitle: 'Ease in before the first set',
        spotify:
            'https://open.spotify.com/search/workout%20warm%20up',
        apple:
            'https://music.apple.com/search?term=workout%20warm%20up',
    },
    {
        id: 'cooldown',
        title: 'Cool Down',
        subtitle: 'Leave the gym still in the zone',
        spotify:
            'https://open.spotify.com/search/cool%20down%20stretch',
        apple:
            'https://music.apple.com/search?term=cool%20down%20stretch',
    },
];

const SPOTIFY_SEARCH =
    'https://open.spotify.com/search/gym%20workout';

const APPLE_SEARCH =
    'https://music.apple.com/search?term=workout';

export function musicServiceLabel(
    service: MusicService
) {
    return service === 'apple'
        ? 'Apple Music'
        : 'Spotify';
}

async function openUrl(
    url: string,
    service: MusicService
) {
    try {
        await Linking.openURL(url);
    } catch {
        Alert.alert(
            'Could not open music',
            `Install ${musicServiceLabel(service)} or pick a different mix.`
        );
    }
}

export async function openGymMusic(
    service: MusicService,
    playlistUrl?: string
) {
    const trimmed = playlistUrl?.trim() ?? '';

    const url =
        trimmed !== ''
            ? trimmed
            : service === 'apple'
                ? APPLE_SEARCH
                : SPOTIFY_SEARCH;

    await openUrl(url, service);
}

export async function openWorkoutMix(
    mix: WorkoutMix,
    service: MusicService
) {
    await openUrl(
        service === 'apple' ? mix.apple : mix.spotify,
        service
    );
}
