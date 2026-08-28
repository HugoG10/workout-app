import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useHistory } from '@/context/history-context';
import { useRoutines } from '@/context/routine-context';
import {
  SetPrefill,
  useWorkout,
} from '@/context/workout-context';
import { useAuth } from '@/context/auth-context';
import { useExerciseCatalog } from '@/context/exercise-catalog-context';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { AppColors } from '@/constants/theme';
import { ScreenTip } from '@/components/screen-tip';
import { prefillFromPrevious } from '@/lib/workout-stats';

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

function formatElapsed(startedAt: number) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - startedAt) / 1000)
  );

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

export default function WorkoutScreen() {
  const insets = useScreenInsets();
  const { user } = useAuth();
  const { exercises } = useExerciseCatalog();
  const { routines } = useRoutines();
  const { getPreviousExercise, lastRecap } = useHistory();

  const {
    isWorkoutActive,
    workoutExercises,
    workoutStartedAt,
    startEmptyWorkout,
    startRoutine,
  } = useWorkout();

  const styles = useThemedStyles(createStyles);

  function getPrefill(
    exerciseIds: string[]
  ): Record<string, SetPrefill> {
    const prefill: Record<string, SetPrefill> = {};

    for (const exerciseId of exerciseIds) {
        const previousPrefill = prefillFromPrevious(
          getPreviousExercise(exerciseId)?.sets
        );

        if (previousPrefill) {
          prefill[exerciseId] = previousPrefill;
        }
    }

    return prefill;
  }

  function confirmReplaceWorkout(
    onConfirm: () => void
  ) {
    if (!isWorkoutActive) {
      onConfirm();
      return;
    }

    Alert.alert(
      'Workout in progress',
      'Starting a new workout will discard the one you have open.',
      [
        {
          text: 'Resume current',
          onPress: () =>
            router.push('/active-workout'),
        },
        {
          text: 'Discard and start new',
          style: 'destructive',
          onPress: onConfirm,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }

  function handleStartEmpty() {
    confirmReplaceWorkout(() => {
      startEmptyWorkout();
      router.push('/active-workout');
    });
  }

  function handleStartRoutine(
    exerciseIds: string[]
  ) {
    confirmReplaceWorkout(() => {
      startRoutine(
        exerciseIds,
        getPrefill(exerciseIds)
      );
      router.push('/active-workout');
    });
  }

  function openRoutine(routineId: string) {
    router.push({
      pathname: '/routine/[id]',
      params: {
        id: routineId,
      },
    });
  }

  const greeting = getGreeting();
  const firstName = user?.firstName?.trim();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 4 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Workout
      </Text>

      <Text style={styles.subtitle}>
        {firstName
          ? `${greeting}, ${firstName}. Ready when you are.`
          : `${greeting}. Ready when you are.`}
      </Text>

      <ScreenTip
        id="workout"
        title="Start a workout"
        body="Use Start Empty Workout, or tap Start on a routine. Create a routine once and reuse it next time."
      />

      {lastRecap?.insight && !isWorkoutActive && (
        <View style={styles.insightCard}>
          <Text style={styles.insightKicker}>LAST SESSION</Text>
          <Text style={styles.insightText}>{lastRecap.insight}</Text>
        </View>
      )}

      {isWorkoutActive && (
        <Pressable
          style={({ pressed }) => [
            styles.resumeCard,
            pressed && styles.cardPressed,
          ]}
          onPress={() =>
            router.push('/active-workout')
          }
        >
          <View style={styles.resumeBadge}>
            <View style={styles.resumeDot} />
            <Text style={styles.resumeBadgeText}>
              IN PROGRESS
            </Text>
          </View>

          <Text style={styles.resumeTitle}>
            Resume Workout
          </Text>

          <Text style={styles.resumeSubtitle}>
            {workoutExercises.length === 0
              ? 'No exercises added yet'
              : `${workoutExercises.length} ${
                  workoutExercises.length === 1
                    ? 'exercise'
                    : 'exercises'
                }`}
            {workoutStartedAt
              ? ` • ${formatElapsed(workoutStartedAt)}`
              : ''}
          </Text>
        </Pressable>
      )}

      <Text style={styles.sectionLabel}>
        QUICK START
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.quickStartCard,
          pressed && styles.cardPressed,
        ]}
        onPress={handleStartEmpty}
      >
        <View style={styles.quickStartIcon}>
          <Text style={styles.quickStartIconText}>
            +
          </Text>
        </View>

        <View style={styles.quickStartInfo}>
          <Text style={styles.quickStartTitle}>
            Start Empty Workout
          </Text>

          <Text style={styles.quickStartSubtitle}>
            Build your workout as you go
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>
          MY ROUTINES
        </Text>

        <Pressable
          hitSlop={10}
          onPress={() =>
            router.push('/create-routine')
          }
        >
          <Text style={styles.createText}>
            + Create
          </Text>
        </Pressable>
      </View>

      {routines.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No routines yet
          </Text>

          <Text style={styles.emptyText}>
            Save a routine once and start it with
            one tap next time.
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={() =>
              router.push('/create-routine')
            }
          >
            <Text style={styles.emptyButtonText}>
              Create Routine
            </Text>
          </Pressable>
        </View>
      )}

      {routines.map((routine) => {
        const previewExercises =
          routine.exerciseIds.slice(0, 4);
        const extraCount =
          routine.exerciseIds.length - 4;

        return (
          <Pressable
            key={routine.id}
            style={({ pressed }) => [
              styles.routineCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              openRoutine(routine.id)
            }
          >
            <View style={styles.routineTop}>
              <View style={styles.routineInfo}>
                <Text style={styles.routineName}>
                  {routine.name}
                </Text>

                <Text style={styles.exerciseCount}>
                  {routine.exerciseIds.length}{' '}
                  {routine.exerciseIds.length === 1
                    ? 'exercise'
                    : 'exercises'}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.startButton,
                  pressed &&
                    styles.startButtonPressed,
                ]}
                onPress={(event) => {
                  event.stopPropagation();
                  handleStartRoutine(
                    routine.exerciseIds
                  );
                }}
              >
                <Text style={styles.startButtonText}>
                  Start
                </Text>
              </Pressable>
            </View>

            <View style={styles.exerciseList}>
              {previewExercises.map(
                (exerciseId, index) => {
                  const exercise = exercises.find(
                    (item) => item.id === exerciseId
                  );

                  if (!exercise) {
                    return null;
                  }

                  return (
                    <View
                      key={exerciseId}
                      style={styles.exerciseRow}
                    >
                      <View
                        style={styles.exerciseNumber}
                      >
                        <Text
                          style={
                            styles.exerciseNumberText
                          }
                        >
                          {index + 1}
                        </Text>
                      </View>

                      <View style={styles.exerciseInfo}>
                        <Text
                          style={styles.exerciseName}
                        >
                          {exercise.name}
                        </Text>

                        <Text
                          style={styles.exerciseMuscle}
                        >
                          {exercise.primaryMuscle}
                        </Text>
                      </View>
                    </View>
                  );
                }
              )}

              {extraCount > 0 && (
                <Text style={styles.moreText}>
                  + {extraCount} more{' '}
                  {extraCount === 1
                    ? 'exercise'
                    : 'exercises'}
                </Text>
              )}
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.editText}>
                Tap to edit routine
              </Text>

              <Text style={styles.smallArrow}>
                ›
              </Text>
            </View>
          </Pressable>
        );
      })}
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
    marginTop: 4,
    marginBottom: 10,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  sectionLabel: {
    color: c.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  createText: {
    color: c.tint,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },

  insightCard: {
    backgroundColor: c.tintSoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  insightKicker: {
    color: c.tint,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  insightText: {
    color: c.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    lineHeight: 22,
  },

  resumeCard: {
    backgroundColor: c.hero,
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
  },

  resumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  resumeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.success,
    marginRight: 8,
  },

  resumeBadgeText: {
    color: c.heroMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  resumeTitle: {
    color: c.heroText,
    fontSize: 22,
    fontWeight: '700',
  },

  resumeSubtitle: {
    color: c.heroMuted,
    fontSize: 14,
    marginTop: 4,
  },

  quickStartCard: {
    backgroundColor: c.tint,
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },

  quickStartIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  quickStartIconText: {
    color: c.onTint,
    fontSize: 30,
    fontWeight: '300',
    marginTop: -2,
  },

  quickStartInfo: {
    flex: 1,
  },

  quickStartTitle: {
    color: c.onTint,
    fontSize: 18,
    fontWeight: '700',
  },

  quickStartSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 3,
  },

  arrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 30,
    marginLeft: 8,
  },

  routineCard: {
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  cardPressed: {
    opacity: 0.85,
  },

  routineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  routineInfo: {
    flex: 1,
    paddingRight: 12,
  },

  routineName: {
    color: c.text,
    fontSize: 21,
    fontWeight: '700',
  },

  exerciseCount: {
    color: c.textMuted,
    fontSize: 13,
    marginTop: 3,
  },

  startButton: {
    backgroundColor: c.tintSoft,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 11,
  },

  startButtonPressed: {
    opacity: 0.6,
  },

  startButtonText: {
    color: c.tint,
    fontWeight: '700',
  },

  exerciseList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.separator,
    marginTop: 17,
    paddingTop: 14,
  },

  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  exerciseNumber: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: c.fill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  exerciseNumberText: {
    color: c.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  exerciseInfo: {
    flex: 1,
  },

  exerciseName: {
    color: c.text,
    fontSize: 15,
    fontWeight: '600',
  },

  exerciseMuscle: {
    color: c.textFaint,
    fontSize: 12,
    marginTop: 2,
  },

  moreText: {
    color: c.tint,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.separatorSoft,
    marginTop: 5,
    paddingTop: 12,
  },

  editText: {
    color: c.textFaint,
    fontSize: 12,
  },

  smallArrow: {
    color: c.textFaint,
    fontSize: 20,
  },

  emptyCard: {
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
  },

  emptyTitle: {
    color: c.text,
    fontSize: 19,
    fontWeight: '700',
  },

  emptyText: {
    color: c.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },

  emptyButton: {
    backgroundColor: c.tintSoft,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 11,
    marginTop: 18,
  },

  emptyButtonText: {
    color: c.tint,
    fontWeight: '700',
  },
});
}
