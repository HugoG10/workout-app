from pathlib import Path

SOURCE_DIR = Path(__file__).parent / "source"
PARTS_FILE = SOURCE_DIR / "isa_parts_list_e.txt"

SEARCH_TERMS = [
    # Chest
    "pectoral",

    # Back
    "latiss",
    "dorsi",
    "trapez",
    "rhomboid",
    "teres major",
    "teres minor",
    "infraspinatus",
    "supraspinatus",
    "spinalis",
    "longissimus",
    "iliocostalis",

    # Shoulders
    "deltoid",

    # Arms
    "biceps",
    "triceps",
    "brachialis",
    "brachioradialis",

    # Core
    "abdomin",
    "rectus",
    "external oblique",
    "internal oblique",
    "transversus",

    # Glutes / hips
    "gluteus",
    "tensor fasciae",

    # Quads
    "rectus femoris",
    "vastus",

    # Hamstrings
    "biceps femoris",
    "semitendinosus",
    "semimembranosus",

    # Inner thigh
    "adductor",

    # Calves / lower leg
    "gastrocnemius",
    "soleus",
    "tibialis",
]


def main():
    if not PARTS_FILE.exists():
        print(f"Missing file: {PARTS_FILE}")
        return

    text = PARTS_FILE.read_text(
        encoding="utf-8",
        errors="ignore",
    )

    lines = text.splitlines()

    print("\n=== BODY PARTS 3D IS-A MUSCLE SEARCH ===\n")

    for term in SEARCH_TERMS:
        matches = [
            line
            for line in lines
            if term.lower() in line.lower()
        ]

        print(f"\n--- {term.upper()} ---")

        if not matches:
            print("No matches found.")
            continue

        for match in matches:
            print(match)


if __name__ == "__main__":
    main()
