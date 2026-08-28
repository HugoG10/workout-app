from pathlib import Path
import json

BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"
DESTINATION = BASE_DIR / "muscle-map.json"

GROUPS = {
    "chest": [
        "pectoralis_major",
        "pectoralis_minor",
    ],

    "frontDelts": [
        "clavicular_part_of_left_deltoid",
        "clavicular_part_of_right_deltoid",
    ],

    "sideDelts": [
        "acromial_part_of_left_deltoid",
        "acromial_part_of_right_deltoid",
    ],

    "rearDelts": [
        "spinal_part_of_left_deltoid",
        "spinal_part_of_right_deltoid",
    ],

    "traps": [
        "trapezius",
    ],

    "rhomboids": [
        "rhomboid",
    ],

    "teresMajor": [
        "teres_major",
    ],

    "rotatorCuff": [
        "teres_minor",
        "infraspinatus",
        "supraspinatus",
    ],

    "biceps": [
        "biceps_brachii",
    ],

    "triceps": [
        "triceps_brachii",
    ],

    "brachialis": [
        "left_brachialis",
        "right_brachialis",
    ],

    "forearms": [
        "brachioradialis",
    ],

    "obliques": [
        "external_oblique",
    ],

    "lowerBack": [
        "spinalis_thoracis",
        "longissimus_thoracis",
        "iliocostalis_lumborum",
        "iliocostalis_thoracis",
    ],

    "glutes": [
        "gluteus_maximus",
    ],

    "gluteMedius": [
        "gluteus_medius",
    ],

    "gluteMinimus": [
        "gluteus_minimus",
    ],

    "quads": [
        "rectus_femoris",
        "vastus_lateralis",
        "vastus_medialis",
        "vastus_intermedius",
    ],

    "hamstrings": [
        "biceps_femoris",
        "semitendinosus",
        "semimembranosus",
    ],

    "adductors": [
        "adductor_brevis",
        "adductor_longus",
        "adductor_magnus",
    ],

    "calves": [
        "gastrocnemius",
        "soleus",
    ],

    "tibialisAnterior": [
        "tibialis_anterior",
    ],

    # Not available as isolated usable meshes
    # in the BodyParts3D IS-A dataset.
    "lats": [],
    "abs": [],
}


def get_meshes():
    return sorted(
        path
        for path in OUTPUT_DIR.glob("*.obj")
        if not path.name.startswith("test_")
        and path.name != "fitness_muscle_model.obj"
    )


def matches_group(filename, patterns):
    lower = filename.lower()

    return any(
        pattern.lower() in lower
        for pattern in patterns
    )


def main():
    if not OUTPUT_DIR.exists():
        print(f"Missing output directory: {OUTPUT_DIR}")
        return

    meshes = get_meshes()

    print(f"\nFound {len(meshes)} muscle meshes.\n")

    muscle_map = {}

    for group_name, patterns in GROUPS.items():
        if not patterns:
            muscle_map[group_name] = []
            print(f"{group_name}: 0")
            continue

        matches = [
            path.stem
            for path in meshes
            if matches_group(path.name, patterns)
        ]

        muscle_map[group_name] = matches

        print(f"{group_name}: {len(matches)}")

        for mesh in matches:
            print(f"  - {mesh}")

    DESTINATION.write_text(
        json.dumps(muscle_map, indent=2),
        encoding="utf-8",
    )

    print("\n=== DONE ===")
    print(f"Created: {DESTINATION}")


if __name__ == "__main__":
    main()
