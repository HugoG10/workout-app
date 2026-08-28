export type TrackingType =
    | 'weight_reps'
    | 'bodyweight'
    | 'duration';

export type Exercise = {
    id: string;
    name: string;

    primaryMuscle: string;
    secondaryMuscles: string[];

    modelPrimaryMuscles?: string[];
    modelSecondaryMuscles?: string[];

    equipment: string;

    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';

    category: 'Strength' | 'Bodyweight' | 'Mobility' | 'Cardio';

    tracking?: TrackingType;
    isCustom?: boolean;

    instructions: string[];
    commonMistakes: string[];
    tips: string[];
};

export function trackingFor(
    exercise: Pick<Exercise, 'id' | 'equipment' | 'tracking'>
): TrackingType {
    if (exercise.tracking) {
        return exercise.tracking;
    }

    if (exercise.id === 'plank') {
        return 'duration';
    }

    if (exercise.equipment === 'Bodyweight') {
        return 'bodyweight';
    }

    return 'weight_reps';
}

export const exercises: Exercise[] = [
    {
        id: 'bench-press',
        name: 'Bench Press',
        primaryMuscle: 'Chest',
        secondaryMuscles: ['Triceps', 'Shoulders'],
        modelPrimaryMuscles: ['chest'],
        modelSecondaryMuscles: ['frontDelts', 'triceps'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        category: 'Strength',
        instructions: [
            'Lie flat on the bench with your feet planted firmly on the floor.',
            'Grip the bar slightly wider than shoulder-width.',
            'Retract your shoulder blades and keep your upper back against the bench.',
            'Unrack the bar and position it above your chest.',
            'Lower the bar toward your mid-chest under control.',
            'Press the bar upward until your arms are extended.',
        ],
        commonMistakes: [
            'Bouncing the bar off the chest.',
            'Flaring the elbows excessively.',
            'Lifting the feet off the floor.',
            'Using more weight than you can control.',
        ],
        tips: [
            'Keep your feet planted.',
            'Keep your shoulder blades pulled back and down.',
            'Control the lowering portion of each repetition.',
            'Keep your wrists stacked over your forearms.',
        ],
    },

    {
        id: 'incline-bench-press',
        name: 'Incline Bench Press',
        primaryMuscle: 'Chest',
        secondaryMuscles: ['Shoulders', 'Triceps'],
        modelPrimaryMuscles: ['chest'],
        modelSecondaryMuscles: ['frontDelts', 'triceps'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        category: 'Strength',
        instructions: [
            'Set the bench to a moderate incline.',
            'Plant your feet firmly on the floor.',
            'Grip the bar slightly wider than shoulder-width.',
            'Lower the bar toward your upper chest.',
            'Press the bar upward until your arms are extended.',
        ],
        commonMistakes: [
            'Setting the bench too steep.',
            'Flaring the elbows excessively.',
            'Losing upper-back tightness.',
        ],
        tips: [
            'Use a controlled range of motion.',
            'Keep your shoulder blades retracted.',
            'Avoid turning the movement into a shoulder press.',
        ],
    },

    {
        id: 'dumbbell-bench-press',
        name: 'Dumbbell Bench Press',
        primaryMuscle: 'Chest',
        secondaryMuscles: ['Triceps', 'Shoulders'],
        modelPrimaryMuscles: ['chest'],
        modelSecondaryMuscles: ['frontDelts', 'triceps'],
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Lie on a flat bench with a dumbbell in each hand.',
            'Position the dumbbells beside your chest.',
            'Press the dumbbells upward.',
            'Lower them slowly until your elbows are near chest level.',
            'Repeat while maintaining control.',
        ],
        commonMistakes: [
            'Letting the dumbbells drift too far outward.',
            'Using momentum.',
            'Losing control at the bottom.',
        ],
        tips: [
            'Keep your wrists neutral.',
            'Maintain tension through the chest.',
            'Use a weight you can control through the full range.',
        ],
    },

    {
        id: 'incline-dumbbell-press',
        name: 'Incline Dumbbell Press',
        primaryMuscle: 'Chest',
        secondaryMuscles: ['Shoulders', 'Triceps'],
        modelPrimaryMuscles: ['chest'],
        modelSecondaryMuscles: ['frontDelts', 'triceps'],
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Set a bench to a moderate incline.',
            'Hold a dumbbell in each hand.',
            'Position the dumbbells near your upper chest.',
            'Press upward until your arms are extended.',
            'Lower the dumbbells under control.',
        ],
        commonMistakes: [
            'Using too steep of an incline.',
            'Arching excessively.',
            'Lowering the dumbbells too quickly.',
        ],
        tips: [
            'Keep the shoulder blades pulled back.',
            'Use a comfortable elbow angle.',
            'Control both the lifting and lowering phases.',
        ],
    },

    {
        id: 'cable-fly',
        name: 'Cable Fly',
        primaryMuscle: 'Chest',
        secondaryMuscles: ['Shoulders'],
        modelPrimaryMuscles: ['chest'],
        modelSecondaryMuscles: ['frontDelts'],
        equipment: 'Cable',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Set the cable handles around chest height.',
            'Stand between the pulleys with a handle in each hand.',
            'Keep a slight bend in your elbows.',
            'Bring your hands together in front of your chest.',
            'Slowly return to the starting position.',
        ],
        commonMistakes: [
            'Turning the movement into a press.',
            'Using too much weight.',
            'Allowing the shoulders to roll forward.',
        ],
        tips: [
            'Focus on squeezing the chest.',
            'Maintain a soft bend in the elbows.',
            'Move through a controlled range.',
        ],
    },

    {
        id: 'push-up',
        name: 'Push-Up',
        primaryMuscle: 'Chest',
        secondaryMuscles: ['Triceps', 'Shoulders', 'Core'],
        modelPrimaryMuscles: ['chest'],
        modelSecondaryMuscles: ['frontDelts', 'triceps', 'obliques'],
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        category: 'Bodyweight',
        instructions: [
            'Place your hands slightly wider than shoulder-width.',
            'Keep your body in a straight line from head to heels.',
            'Lower your chest toward the floor.',
            'Keep your core braced.',
            'Push back to the starting position.',
        ],
        commonMistakes: [
            'Allowing the hips to sag.',
            'Flaring the elbows excessively.',
            'Using a shortened range of motion.',
        ],
        tips: [
            'Brace your core throughout the movement.',
            'Keep your neck neutral.',
            'Use an elevated surface if full push-ups are too difficult.',
        ],
    },

    {
        id: 'pull-up',
        name: 'Pull-Up',
        primaryMuscle: 'Back',
        secondaryMuscles: ['Biceps', 'Forearms'],
        modelPrimaryMuscles: ['traps', 'rhomboids', 'teresMajor'],
        modelSecondaryMuscles: ['biceps', 'brachialis', 'forearms'],
        equipment: 'Bodyweight',
        difficulty: 'Intermediate',
        category: 'Bodyweight',
        instructions: [
            'Grip the pull-up bar slightly wider than shoulder-width.',
            'Begin from a controlled hanging position.',
            'Pull your chest toward the bar.',
            'Drive your elbows downward.',
            'Lower yourself under control.',
        ],
        commonMistakes: [
            'Swinging excessively.',
            'Using only a partial range.',
            'Shrugging the shoulders upward.',
        ],
        tips: [
            'Think about pulling your elbows toward your ribs.',
            'Control the lowering phase.',
            'Use assistance if needed.',
        ],
    },

    {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        primaryMuscle: 'Back',
        secondaryMuscles: ['Biceps', 'Forearms'],
        modelPrimaryMuscles: ['traps', 'rhomboids', 'teresMajor'],
        modelSecondaryMuscles: ['biceps', 'brachialis', 'forearms'],
        equipment: 'Cable',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Sit securely at the pulldown machine.',
            'Grip the bar slightly wider than shoulder-width.',
            'Keep your chest lifted.',
            'Pull the bar toward your upper chest.',
            'Slowly return the bar to the starting position.',
        ],
        commonMistakes: [
            'Pulling the bar behind the neck.',
            'Leaning too far backward.',
            'Using momentum.',
        ],
        tips: [
            'Drive the elbows down.',
            'Keep your chest tall.',
            'Control the return to the top.',
        ],
    },

    {
        id: 'barbell-row',
        name: 'Barbell Row',
        primaryMuscle: 'Back',
        secondaryMuscles: ['Biceps', 'Rear Delts'],
        modelPrimaryMuscles: ['traps', 'rhomboids', 'teresMajor'],
        modelSecondaryMuscles: ['biceps', 'brachialis', 'rearDelts'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        category: 'Strength',
        instructions: [
            'Hold the bar with your hands around shoulder-width apart.',
            'Hinge at the hips while keeping your back controlled.',
            'Brace your core.',
            'Row the bar toward your lower ribs.',
            'Lower the bar under control.',
        ],
        commonMistakes: [
            'Rounding the lower back.',
            'Standing too upright.',
            'Jerking the bar upward.',
        ],
        tips: [
            'Maintain a stable torso.',
            'Lead with your elbows.',
            'Use a weight that allows you to avoid momentum.',
        ],
    },

    {
        id: 'one-arm-dumbbell-row',
        name: 'One-Arm Dumbbell Row',
        primaryMuscle: 'Back',
        secondaryMuscles: ['Biceps', 'Rear Delts'],
        modelPrimaryMuscles: ['traps', 'rhomboids', 'teresMajor'],
        modelSecondaryMuscles: ['biceps', 'brachialis', 'rearDelts'],
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Support yourself with one hand on a bench.',
            'Hold the dumbbell in the opposite hand.',
            'Keep your torso stable.',
            'Pull the dumbbell toward your hip.',
            'Lower it under control.',
        ],
        commonMistakes: [
            'Rotating the torso excessively.',
            'Shrugging the shoulder.',
            'Pulling toward the chest instead of the hip.',
        ],
        tips: [
            'Keep your core braced.',
            'Drive your elbow backward.',
            'Pause briefly near the top.',
        ],
    },

    {
        id: 'seated-cable-row',
        name: 'Seated Cable Row',
        primaryMuscle: 'Back',
        secondaryMuscles: ['Biceps', 'Rear Delts'],
        modelPrimaryMuscles: ['traps', 'rhomboids', 'teresMajor'],
        modelSecondaryMuscles: ['biceps', 'brachialis', 'rearDelts'],
        equipment: 'Cable',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Sit at the cable row station with your feet supported.',
            'Grab the handle with both hands.',
            'Sit tall with your chest up.',
            'Pull the handle toward your torso.',
            'Return the handle slowly.',
        ],
        commonMistakes: [
            'Rounding the back.',
            'Leaning too far backward.',
            'Using excessive momentum.',
        ],
        tips: [
            'Keep the chest tall.',
            'Pull the shoulder blades together.',
            'Keep the movement controlled.',
        ],
    },

    {
        id: 'deadlift',
        name: 'Deadlift',
        primaryMuscle: 'Back',
        secondaryMuscles: ['Glutes', 'Hamstrings', 'Forearms'],
        modelPrimaryMuscles: ['lowerBack'],
        modelSecondaryMuscles: ['glutes', 'hamstrings', 'forearms'],
        equipment: 'Barbell',
        difficulty: 'Advanced',
        category: 'Strength',
        instructions: [
            'Stand with the bar over the middle of your feet.',
            'Grip the bar just outside your legs.',
            'Brace your core and keep your back controlled.',
            'Push through the floor while extending your hips and knees.',
            'Stand tall at the top.',
            'Lower the bar under control.',
        ],
        commonMistakes: [
            'Rounding the lower back.',
            'Jerking the bar from the floor.',
            'Allowing the bar to drift away from the body.',
        ],
        tips: [
            'Keep the bar close to your legs.',
            'Brace before lifting.',
            'Think about pushing the floor away.',
        ],
    },

    {
        id: 'overhead-press',
        name: 'Overhead Press',
        primaryMuscle: 'Shoulders',
        secondaryMuscles: ['Triceps', 'Upper Chest'],
        modelPrimaryMuscles: ['frontDelts', 'sideDelts'],
        modelSecondaryMuscles: ['triceps', 'chest'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        category: 'Strength',
        instructions: [
            'Hold the bar around shoulder-width.',
            'Position it near your upper chest.',
            'Brace your core and glutes.',
            'Press the bar overhead.',
            'Lower the bar under control.',
        ],
        commonMistakes: [
            'Leaning excessively backward.',
            'Flaring the elbows too far outward.',
            'Pressing the bar too far in front of the body.',
        ],
        tips: [
            'Keep your ribs controlled.',
            'Finish with the bar stacked over your body.',
            'Use a stable stance.',
        ],
    },

    {
        id: 'dumbbell-shoulder-press',
        name: 'Dumbbell Shoulder Press',
        primaryMuscle: 'Shoulders',
        secondaryMuscles: ['Triceps'],
        modelPrimaryMuscles: ['frontDelts', 'sideDelts'],
        modelSecondaryMuscles: ['triceps'],
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Sit or stand with a dumbbell in each hand.',
            'Position the dumbbells around shoulder height.',
            'Brace your core.',
            'Press the dumbbells overhead.',
            'Lower them slowly.',
        ],
        commonMistakes: [
            'Arching the lower back.',
            'Using excessive momentum.',
            'Lowering the dumbbells unevenly.',
        ],
        tips: [
            'Keep your core tight.',
            'Use a controlled range of motion.',
            'Avoid locking out aggressively.',
        ],
    },

    {
        id: 'lateral-raise',
        name: 'Lateral Raise',
        primaryMuscle: 'Shoulders',
        secondaryMuscles: [],
        modelPrimaryMuscles: ['sideDelts'],
        modelSecondaryMuscles: [],
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Stand with a dumbbell in each hand.',
            'Keep a slight bend in your elbows.',
            'Raise your arms out to the sides.',
            'Stop around shoulder height.',
            'Lower the dumbbells slowly.',
        ],
        commonMistakes: [
            'Using too much weight.',
            'Shrugging the shoulders.',
            'Swinging the dumbbells upward.',
        ],
        tips: [
            'Lead with your elbows.',
            'Keep the movement smooth.',
            'Use lighter weights if needed.',
        ],
    },

    {
        id: 'rear-delt-fly',
        name: 'Rear Delt Fly',
        primaryMuscle: 'Shoulders',
        secondaryMuscles: ['Upper Back'],
        modelPrimaryMuscles: ['rearDelts'],
        modelSecondaryMuscles: ['traps', 'rhomboids', 'rotatorCuff'],
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Hinge forward at the hips.',
            'Hold a dumbbell in each hand.',
            'Keep your back controlled.',
            'Raise your arms outward.',
            'Lower them slowly.',
        ],
        commonMistakes: [
            'Using excessive momentum.',
            'Shrugging the shoulders.',
            'Turning the movement into a row.',
        ],
        tips: [
            'Focus on the rear delts.',
            'Use light weights.',
            'Keep a soft bend in the elbows.',
        ],
    },

    {
        id: 'face-pull',
        name: 'Face Pull',
        primaryMuscle: 'Shoulders',
        secondaryMuscles: ['Upper Back', 'Rear Delts'],
        modelPrimaryMuscles: ['rearDelts', 'rotatorCuff'],
        modelSecondaryMuscles: ['traps', 'rhomboids'],
        equipment: 'Cable',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Attach a rope around face height.',
            'Grip the rope with both hands.',
            'Pull the rope toward your face.',
            'Separate your hands as you pull.',
            'Return slowly.',
        ],
        commonMistakes: [
            'Using too much weight.',
            'Pulling toward the chest instead of the face.',
            'Shrugging the shoulders.',
        ],
        tips: [
            'Keep the elbows high.',
            'Control the return.',
            'Focus on the rear shoulders and upper back.',
        ],
    },

    {
        id: 'dumbbell-bicep-curl',
        name: 'Dumbbell Bicep Curl',
        primaryMuscle: 'Biceps',
        secondaryMuscles: ['Forearms'],
        modelPrimaryMuscles: ['biceps', 'brachialis'],
        modelSecondaryMuscles: ['forearms'],
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Stand with a dumbbell in each hand.',
            'Keep your elbows close to your sides.',
            'Curl the dumbbells upward.',
            'Squeeze your biceps near the top.',
            'Lower the dumbbells slowly.',
        ],
        commonMistakes: [
            'Swinging the body.',
            'Moving the elbows forward excessively.',
            'Dropping the weight too quickly.',
        ],
        tips: [
            'Keep your upper arms still.',
            'Control the lowering phase.',
            'Use a full comfortable range.',
        ],
    },

    {
        id: 'barbell-curl',
        name: 'Barbell Curl',
        primaryMuscle: 'Biceps',
        secondaryMuscles: ['Forearms'],
        modelPrimaryMuscles: ['biceps', 'brachialis'],
        modelSecondaryMuscles: ['forearms'],
        equipment: 'Barbell',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Stand tall holding the bar in front of you.',
            'Keep your elbows near your sides.',
            'Curl the bar toward your shoulders.',
            'Pause near the top.',
            'Lower the bar under control.',
        ],
        commonMistakes: [
            'Leaning backward.',
            'Swinging the bar.',
            'Allowing the elbows to travel too far forward.',
        ],
        tips: [
            'Keep your torso still.',
            'Use controlled repetitions.',
            'Choose a weight that avoids swinging.',
        ],
    },

    {
        id: 'hammer-curl',
        name: 'Hammer Curl',
        primaryMuscle: 'Biceps',
        secondaryMuscles: ['Forearms'],
        modelPrimaryMuscles: ['biceps', 'brachialis'],
        modelSecondaryMuscles: ['forearms'],
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Hold a dumbbell in each hand with your palms facing inward.',
            'Keep your elbows close to your sides.',
            'Curl the dumbbells upward.',
            'Keep your palms facing inward.',
            'Lower slowly.',
        ],
        commonMistakes: [
            'Swinging the body.',
            'Moving the elbows too much.',
            'Using excessive weight.',
        ],
        tips: [
            'Keep a neutral wrist.',
            'Control the lowering phase.',
            'Avoid rushing repetitions.',
        ],
    },

    {
        id: 'preacher-curl',
        name: 'Preacher Curl',
        primaryMuscle: 'Biceps',
        secondaryMuscles: ['Forearms'],
        modelPrimaryMuscles: ['biceps', 'brachialis'],
        modelSecondaryMuscles: ['forearms'],
        equipment: 'Machine',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Sit at the preacher curl station.',
            'Place your upper arms against the pad.',
            'Grip the handle or bar.',
            'Curl upward.',
            'Lower slowly without hyperextending the elbow.',
        ],
        commonMistakes: [
            'Lifting the upper arms off the pad.',
            'Dropping quickly into the bottom position.',
            'Using too much weight.',
        ],
        tips: [
            'Keep the upper arms planted.',
            'Control the bottom of the movement.',
            'Avoid fully relaxing between repetitions.',
        ],
    },

    {
        id: 'tricep-pushdown',
        name: 'Tricep Pushdown',
        primaryMuscle: 'Triceps',
        secondaryMuscles: [],
        modelPrimaryMuscles: ['triceps'],
        modelSecondaryMuscles: [],
        equipment: 'Cable',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Stand facing a cable machine.',
            'Grip the attachment with your elbows near your sides.',
            'Push the handle downward.',
            'Extend your elbows fully under control.',
            'Return slowly.',
        ],
        commonMistakes: [
            'Allowing the elbows to drift forward.',
            'Using the shoulders to move the weight.',
            'Leaning excessively over the cable.',
        ],
        tips: [
            'Keep your upper arms still.',
            'Focus on extending the elbows.',
            'Control the return.',
        ],
    },

    {
        id: 'overhead-tricep-extension',
        name: 'Overhead Tricep Extension',
        primaryMuscle: 'Triceps',
        secondaryMuscles: [],
        modelPrimaryMuscles: ['triceps'],
        modelSecondaryMuscles: [],
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Hold a dumbbell overhead.',
            'Keep your elbows pointed forward.',
            'Lower the dumbbell behind your head.',
            'Extend your elbows to raise the weight.',
            'Repeat under control.',
        ],
        commonMistakes: [
            'Allowing the elbows to flare excessively.',
            'Arching the lower back.',
            'Moving too quickly.',
        ],
        tips: [
            'Brace your core.',
            'Keep your upper arms relatively still.',
            'Use a comfortable range of motion.',
        ],
    },

    {
        id: 'skull-crusher',
        name: 'Skull Crusher',
        primaryMuscle: 'Triceps',
        secondaryMuscles: [],
        modelPrimaryMuscles: ['triceps'],
        modelSecondaryMuscles: [],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        category: 'Strength',
        instructions: [
            'Lie on a bench holding the bar above your chest.',
            'Keep your upper arms relatively still.',
            'Bend your elbows to lower the bar toward your forehead.',
            'Extend your elbows to raise the bar.',
            'Repeat with control.',
        ],
        commonMistakes: [
            'Moving the upper arms excessively.',
            'Using too much weight.',
            'Dropping the bar too quickly.',
        ],
        tips: [
            'Use a controlled tempo.',
            'Keep your elbows pointed upward.',
            'An EZ-bar may feel more comfortable for some lifters.',
        ],
    },

    {
        id: 'close-grip-bench-press',
        name: 'Close-Grip Bench Press',
        primaryMuscle: 'Triceps',
        secondaryMuscles: ['Chest', 'Shoulders'],
        modelPrimaryMuscles: ['triceps'],
        modelSecondaryMuscles: ['chest', 'frontDelts'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        category: 'Strength',
        instructions: [
            'Lie on the bench with your feet planted.',
            'Grip the bar slightly narrower than your normal bench grip.',
            'Lower the bar toward your chest.',
            'Keep the elbows controlled.',
            'Press the bar upward.',
        ],
        commonMistakes: [
            'Using an excessively narrow grip.',
            'Flaring the elbows.',
            'Losing wrist alignment.',
        ],
        tips: [
            'Keep your wrists stacked.',
            'Use a grip that feels comfortable.',
            'Maintain upper-back tightness.',
        ],
    },

    {
        id: 'barbell-squat',
        name: 'Barbell Squat',
        primaryMuscle: 'Quadriceps',
        secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
        modelPrimaryMuscles: ['quads'],
        modelSecondaryMuscles: ['glutes', 'hamstrings', 'obliques'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        category: 'Strength',
        instructions: [
            'Position the bar securely across your upper back.',
            'Stand with your feet around shoulder-width apart.',
            'Brace your core.',
            'Bend your hips and knees to lower yourself.',
            'Keep your feet planted.',
            'Drive upward to return to standing.',
        ],
        commonMistakes: [
            'Allowing the knees to collapse inward.',
            'Rounding the back.',
            'Allowing the heels to lift.',
        ],
        tips: [
            'Keep pressure across the whole foot.',
            'Brace before descending.',
            'Use a depth you can control.',
        ],
    },

    {
        id: 'front-squat',
        name: 'Front Squat',
        primaryMuscle: 'Quadriceps',
        secondaryMuscles: ['Glutes', 'Core'],
        modelPrimaryMuscles: ['quads'],
        modelSecondaryMuscles: ['glutes', 'obliques'],
        equipment: 'Barbell',
        difficulty: 'Advanced',
        category: 'Strength',
        instructions: [
            'Position the bar across the front of your shoulders.',
            'Keep your elbows lifted.',
            'Brace your core.',
            'Squat downward under control.',
            'Drive upward while keeping your torso upright.',
        ],
        commonMistakes: [
            'Dropping the elbows.',
            'Rounding the upper back.',
            'Allowing the knees to collapse inward.',
        ],
        tips: [
            'Keep your chest tall.',
            'Maintain a strong front-rack position.',
            'Use lighter loads while learning the movement.',
        ],
    },

    {
        id: 'leg-press',
        name: 'Leg Press',
        primaryMuscle: 'Quadriceps',
        secondaryMuscles: ['Glutes', 'Hamstrings'],
        modelPrimaryMuscles: ['quads'],
        modelSecondaryMuscles: ['glutes', 'hamstrings'],
        equipment: 'Machine',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Sit in the leg press machine with your back supported.',
            'Place your feet securely on the platform.',
            'Lower the platform by bending your knees.',
            'Keep your lower back against the pad.',
            'Press the platform away.',
        ],
        commonMistakes: [
            'Allowing the lower back to round.',
            'Locking the knees aggressively.',
            'Using a range of motion you cannot control.',
        ],
        tips: [
            'Keep your knees tracking with your toes.',
            'Control the lowering phase.',
            'Do not let your hips lift off the pad.',
        ],
    },

    {
        id: 'leg-extension',
        name: 'Leg Extension',
        primaryMuscle: 'Quadriceps',
        secondaryMuscles: [],
        modelPrimaryMuscles: ['quads'],
        modelSecondaryMuscles: [],
        equipment: 'Machine',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Sit in the machine with your back supported.',
            'Position the pad above your ankles.',
            'Extend your knees to raise the weight.',
            'Pause briefly near the top.',
            'Lower under control.',
        ],
        commonMistakes: [
            'Using excessive momentum.',
            'Lifting the hips from the seat.',
            'Dropping the weight quickly.',
        ],
        tips: [
            'Control each repetition.',
            'Adjust the machine to fit your leg length.',
            'Avoid forcing an uncomfortable range of motion.',
        ],
    },

    {
        id: 'walking-lunge',
        name: 'Walking Lunge',
        primaryMuscle: 'Quadriceps',
        secondaryMuscles: ['Glutes', 'Hamstrings'],
        modelPrimaryMuscles: ['quads'],
        modelSecondaryMuscles: ['glutes', 'hamstrings'],
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        category: 'Bodyweight',
        instructions: [
            'Stand tall with your feet together.',
            'Step forward with one leg.',
            'Lower until both knees are comfortably bent.',
            'Drive through the front foot.',
            'Step forward into the next repetition.',
        ],
        commonMistakes: [
            'Taking steps that are too short.',
            'Allowing the knee to collapse inward.',
            'Losing balance by rushing.',
        ],
        tips: [
            'Keep your torso tall.',
            'Move at a controlled pace.',
            'Add dumbbells when bodyweight becomes easy.',
        ],
    },

    {
        id: 'bulgarian-split-squat',
        name: 'Bulgarian Split Squat',
        primaryMuscle: 'Quadriceps',
        secondaryMuscles: ['Glutes', 'Hamstrings'],
        modelPrimaryMuscles: ['quads'],
        modelSecondaryMuscles: ['glutes', 'hamstrings'],
        equipment: 'Dumbbells',
        difficulty: 'Intermediate',
        category: 'Strength',
        instructions: [
            'Place your rear foot on a bench behind you.',
            'Position your front foot far enough forward for balance.',
            'Lower your body by bending the front knee.',
            'Keep the front foot planted.',
            'Drive back to the starting position.',
        ],
        commonMistakes: [
            'Standing too close to the bench.',
            'Losing balance by moving too quickly.',
            'Allowing the front knee to collapse inward.',
        ],
        tips: [
            'Start with bodyweight.',
            'Use a stable stance.',
            'Focus on the working leg.',
        ],
    },

    {
        id: 'romanian-deadlift',
        name: 'Romanian Deadlift',
        primaryMuscle: 'Hamstrings',
        secondaryMuscles: ['Glutes', 'Back'],
        modelPrimaryMuscles: ['hamstrings'],
        modelSecondaryMuscles: ['glutes', 'lowerBack'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        category: 'Strength',
        instructions: [
            'Stand holding the bar in front of your thighs.',
            'Keep a slight bend in your knees.',
            'Push your hips backward.',
            'Lower the bar along your legs.',
            'Stop when you feel a strong hamstring stretch.',
            'Drive the hips forward to stand.',
        ],
        commonMistakes: [
            'Turning the movement into a squat.',
            'Rounding the back.',
            'Letting the bar drift away from the legs.',
        ],
        tips: [
            'Think about pushing your hips backward.',
            'Keep the bar close to your body.',
            'Do not force extra depth.',
        ],
    },

    {
        id: 'leg-curl',
        name: 'Leg Curl',
        primaryMuscle: 'Hamstrings',
        secondaryMuscles: [],
        modelPrimaryMuscles: ['hamstrings'],
        modelSecondaryMuscles: [],
        equipment: 'Machine',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Position yourself securely in the machine.',
            'Place the pad against the lower part of your legs.',
            'Curl your heels toward your body.',
            'Pause briefly.',
            'Return slowly.',
        ],
        commonMistakes: [
            'Lifting the hips off the pad.',
            'Using momentum.',
            'Dropping the weight too quickly.',
        ],
        tips: [
            'Keep your hips stable.',
            'Control both directions.',
            'Adjust the pad for a comfortable fit.',
        ],
    },

    {
        id: 'hip-thrust',
        name: 'Hip Thrust',
        primaryMuscle: 'Glutes',
        secondaryMuscles: ['Hamstrings'],
        modelPrimaryMuscles: ['glutes'],
        modelSecondaryMuscles: ['hamstrings'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        category: 'Strength',
        instructions: [
            'Sit with your upper back against a bench.',
            'Position the bar across your hips.',
            'Plant your feet firmly.',
            'Drive your hips upward.',
            'Squeeze your glutes at the top.',
            'Lower under control.',
        ],
        commonMistakes: [
            'Overextending the lower back.',
            'Placing the feet too far away.',
            'Using momentum.',
        ],
        tips: [
            'Keep your ribs controlled.',
            'Focus on moving through the hips.',
            'Pause briefly at the top.',
        ],
    },

    {
        id: 'glute-bridge',
        name: 'Glute Bridge',
        primaryMuscle: 'Glutes',
        secondaryMuscles: ['Hamstrings'],
        modelPrimaryMuscles: ['glutes'],
        modelSecondaryMuscles: ['hamstrings'],
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        category: 'Bodyweight',
        instructions: [
            'Lie on your back with your knees bent.',
            'Plant your feet on the floor.',
            'Brace your core.',
            'Drive your hips upward.',
            'Squeeze your glutes.',
            'Lower under control.',
        ],
        commonMistakes: [
            'Overarching the lower back.',
            'Pushing mostly through the toes.',
            'Rushing the movement.',
        ],
        tips: [
            'Push through the whole foot.',
            'Keep the ribs controlled.',
            'Pause at the top.',
        ],
    },

    {
        id: 'standing-calf-raise',
        name: 'Standing Calf Raise',
        primaryMuscle: 'Calves',
        secondaryMuscles: [],
        modelPrimaryMuscles: ['calves'],
        modelSecondaryMuscles: [],
        equipment: 'Machine',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Stand with the balls of your feet supported.',
            'Lower your heels under control.',
            'Push through the balls of your feet.',
            'Rise onto your toes.',
            'Lower slowly.',
        ],
        commonMistakes: [
            'Bouncing through repetitions.',
            'Using a very short range of motion.',
            'Allowing the ankles to roll outward.',
        ],
        tips: [
            'Pause at the top.',
            'Control the stretch at the bottom.',
            'Avoid rushing repetitions.',
        ],
    },

    {
        id: 'seated-calf-raise',
        name: 'Seated Calf Raise',
        primaryMuscle: 'Calves',
        secondaryMuscles: [],
        modelPrimaryMuscles: ['calves'],
        modelSecondaryMuscles: [],
        equipment: 'Machine',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Sit in the calf raise machine.',
            'Position your feet on the platform.',
            'Lower your heels.',
            'Push through the balls of your feet.',
            'Raise your heels as high as comfortable.',
        ],
        commonMistakes: [
            'Bouncing the weight.',
            'Using a short range.',
            'Moving too quickly.',
        ],
        tips: [
            'Control every repetition.',
            'Pause briefly at the top.',
            'Use a comfortable ankle range.',
        ],
    },

    {
        id: 'plank',
        name: 'Plank',
        primaryMuscle: 'Core',
        secondaryMuscles: ['Shoulders', 'Glutes'],
        modelPrimaryMuscles: ['obliques'],
        modelSecondaryMuscles: ['frontDelts', 'glutes'],
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        category: 'Bodyweight',
        instructions: [
            'Place your forearms on the floor.',
            'Extend your legs behind you.',
            'Keep your body in a straight line.',
            'Brace your core.',
            'Hold the position while breathing normally.',
        ],
        commonMistakes: [
            'Allowing the hips to sag.',
            'Raising the hips too high.',
            'Holding your breath.',
        ],
        tips: [
            'Squeeze your glutes.',
            'Keep your ribs controlled.',
            'Stop the set when your position breaks down.',
        ],
    },

    {
        id: 'hanging-leg-raise',
        name: 'Hanging Leg Raise',
        primaryMuscle: 'Core',
        secondaryMuscles: ['Hip Flexors'],
        modelPrimaryMuscles: ['obliques'],
        modelSecondaryMuscles: [],
        equipment: 'Bodyweight',
        difficulty: 'Intermediate',
        category: 'Bodyweight',
        instructions: [
            'Hang securely from a pull-up bar.',
            'Brace your core.',
            'Raise your legs in front of you.',
            'Avoid excessive swinging.',
            'Lower your legs slowly.',
        ],
        commonMistakes: [
            'Swinging the body.',
            'Using momentum.',
            'Dropping the legs quickly.',
        ],
        tips: [
            'Begin with bent knees if needed.',
            'Control the lowering phase.',
            'Keep your upper body as still as possible.',
        ],
    },

    {
        id: 'cable-crunch',
        name: 'Cable Crunch',
        primaryMuscle: 'Core',
        secondaryMuscles: [],
        modelPrimaryMuscles: ['obliques'],
        modelSecondaryMuscles: [],
        equipment: 'Cable',
        difficulty: 'Beginner',
        category: 'Strength',
        instructions: [
            'Kneel in front of a cable machine with a rope attachment.',
            'Hold the rope near your head.',
            'Brace your core.',
            'Curl your torso downward.',
            'Return slowly.',
        ],
        commonMistakes: [
            'Pulling mostly with the arms.',
            'Sitting the hips backward excessively.',
            'Using momentum.',
        ],
        tips: [
            'Focus on shortening the distance between your ribs and pelvis.',
            'Keep your hips relatively stable.',
            'Use controlled repetitions.',
        ],
    },

    {
        id: 'ab-wheel-rollout',
        name: 'Ab Wheel Rollout',
        primaryMuscle: 'Core',
        secondaryMuscles: ['Shoulders', 'Lats'],
        modelPrimaryMuscles: ['obliques'],
        modelSecondaryMuscles: ['frontDelts'],
        equipment: 'Ab Wheel',
        difficulty: 'Advanced',
        category: 'Strength',
        instructions: [
            'Kneel while holding the ab wheel.',
            'Brace your core.',
            'Roll the wheel forward slowly.',
            'Maintain control through your torso.',
            'Pull yourself back to the starting position.',
        ],
        commonMistakes: [
            'Allowing the lower back to sag.',
            'Rolling farther than you can control.',
            'Moving too quickly.',
        ],
        tips: [
            'Start with a short range.',
            'Keep your glutes engaged.',
            'Increase range gradually.',
        ],
    },
];