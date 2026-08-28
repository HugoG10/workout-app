from pathlib import Path
import shutil
import zipfile

BASE_DIR = Path(__file__).parent
SOURCE_DIR = BASE_DIR / "source"
OUTPUT_DIR = BASE_DIR / "output"

PARTS_FILE = SOURCE_DIR / "isa_parts_list_e.txt"
ELEMENT_FILE = SOURCE_DIR / "isa_element_parts.txt"
ZIP_FILE = SOURCE_DIR / "isa_BP3D_4.0_obj_99.zip"

TARGET_TERMS = [
    # Chest
    "right pectoralis minor",
    "left pectoralis minor",
    "clavicular part of right pectoralis major",
    "clavicular part of left pectoralis major",
    "sternocostal part of right pectoralis major",
    "sternocostal part of left pectoralis major",
    "abdominal part of right pectoralis major",
    "abdominal part of left pectoralis major",

    # Back
    "ascending part of right trapezius",
    "ascending part of left trapezius",
    "transverse part of right trapezius",
    "transverse part of left trapezius",
    "descending part of right trapezius",
    "descending part of left trapezius",
    "right rhomboid major",
    "left rhomboid major",
    "right rhomboid minor",
    "left rhomboid minor",
    "right teres major",
    "left teres major",
    "right teres minor",
    "left teres minor",
    "right infraspinatus muscle",
    "left infraspinatus muscle",
    "right supraspinatus",
    "left supraspinatus",
    "right spinalis thoracis",
    "left spinalis thoracis",
    "right longissimus thoracis",
    "left longissimus thoracis",
    "right iliocostalis lumborum",
    "left iliocostalis lumborum",
    "right iliocostalis thoracis",
    "left iliocostalis thoracis",

    # Shoulders
    "clavicular part of right deltoid",
    "clavicular part of left deltoid",
    "acromial part of right deltoid",
    "acromial part of left deltoid",
    "spinal part of right deltoid",
    "spinal part of left deltoid",

    # Arms
    "short head of right biceps brachii",
    "short head of left biceps brachii",
    "long head of right biceps brachii",
    "long head of left biceps brachii",
    "medial head of right triceps brachii",
    "medial head of left triceps brachii",
    "lateral head of right triceps brachii",
    "lateral head of left triceps brachii",
    "long head of right triceps brachii",
    "long head of left triceps brachii",
    "right brachialis",
    "left brachialis",
    "right brachioradialis",
    "left brachioradialis",

    # Core
    "right external oblique",
    "left external oblique",

    # Glutes
    "right gluteus maximus",
    "left gluteus maximus",
    "right gluteus medius",
    "left gluteus medius",
    "right gluteus minimus",
    "left gluteus minimus",

    # Quads
    "right rectus femoris",
    "left rectus femoris",
    "right vastus lateralis",
    "left vastus lateralis",
    "right vastus medialis",
    "left vastus medialis",
    "right vastus intermedius",
    "left vastus intermedius",

    # Hamstrings
    "long head of right biceps femoris",
    "long head of left biceps femoris",
    "short head of right biceps femoris",
    "short head of left biceps femoris",
    "right semitendinosus",
    "left semitendinosus",
    "right semimembranosus",
    "left semimembranosus",

    # Adductors
    "right adductor brevis",
    "left adductor brevis",
    "right adductor longus",
    "left adductor longus",
    "right adductor magnus",
    "left adductor magnus",

    # Lower leg
    "medial head of right gastrocnemius",
    "medial head of left gastrocnemius",
    "lateral head of right gastrocnemius",
    "lateral head of left gastrocnemius",
    "right soleus",
    "left soleus",
    "right tibialis anterior",
    "left tibialis anterior",
]


def load_fma_lookup():
    """
    Build:
        anatomy name -> FMA ID
    from isa_parts_list_e.txt
    """

    lookup = {}

    lines = PARTS_FILE.read_text(
        encoding="utf-8",
        errors="ignore",
    ).splitlines()

    for line in lines:
        parts = line.split("\t")

        if len(parts) < 3:
            continue

        fma_id = parts[0].strip()
        name = parts[-1].strip()

        if fma_id.startswith("FMA"):
            lookup[name.lower()] = fma_id

    return lookup


def load_mesh_lookup():
    """
    Build:
        FMA ID -> list of FJ mesh IDs
    from isa_element_parts.txt
    """

    lookup = {}

    lines = ELEMENT_FILE.read_text(
        encoding="utf-8",
        errors="ignore",
    ).splitlines()

    for line in lines:
        parts = line.split("\t")

        if len(parts) < 3:
            continue

        fma_id = parts[0].strip()
        mesh_id = parts[-1].strip()

        if not fma_id.startswith("FMA"):
            continue

        if not mesh_id.startswith("FJ"):
            continue

        lookup.setdefault(fma_id, []).append(mesh_id)

    return lookup


def safe_filename(name):
    return (
        name.lower()
        .replace(" ", "_")
        .replace("/", "_")
    )


def main():
    for file in [PARTS_FILE, ELEMENT_FILE, ZIP_FILE]:
        if not file.exists():
            print(f"Missing file: {file}")
            return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    fma_lookup = load_fma_lookup()
    mesh_lookup = load_mesh_lookup()

    selected = []

    print("\n=== RESOLVING MUSCLE MESHES ===\n")

    for muscle_name in TARGET_TERMS:
        fma_id = fma_lookup.get(muscle_name.lower())

        if not fma_id:
            print(f"[NO FMA] {muscle_name}")
            continue

        mesh_ids = mesh_lookup.get(fma_id, [])

        if not mesh_ids:
            print(f"[NO MESH] {muscle_name} ({fma_id})")
            continue

        for mesh_id in mesh_ids:
            print(
                f"[OK] {muscle_name} "
                f"-> {fma_id} "
                f"-> {mesh_id}"
            )

            selected.append(
                {
                    "name": muscle_name,
                    "fma": fma_id,
                    "mesh": mesh_id,
                }
            )

    print(f"\nResolved {len(selected)} mesh entries.\n")

    print("=== EXTRACTING OBJ FILES ===\n")

    with zipfile.ZipFile(ZIP_FILE, "r") as archive:
        members = archive.namelist()

        for item in selected:
            mesh_id = item["mesh"]

            expected_suffix = f"/{mesh_id}.obj"

            matches = [
                member
                for member in members
                if member.endswith(expected_suffix)
            ]

            if not matches:
                print(
                    f"[MISSING OBJ] "
                    f"{item['name']} -> {mesh_id}"
                )
                continue

            archive_member = matches[0]

            output_name = (
                f"{safe_filename(item['name'])}"
                f"__{mesh_id}.obj"
            )

            output_path = OUTPUT_DIR / output_name

            with archive.open(archive_member) as source:
                with output_path.open("wb") as destination:
                    shutil.copyfileobj(source, destination)

            print(
                f"[EXTRACTED] "
                f"{mesh_id} -> {output_path.name}"
            )

    print("\n=== DONE ===")
    print(f"Meshes saved to:")
    print(OUTPUT_DIR)


if __name__ == "__main__":
    main()
