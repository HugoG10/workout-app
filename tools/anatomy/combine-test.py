from pathlib import Path

OUTPUT_DIR = Path(__file__).parent / "output"
DESTINATION = OUTPUT_DIR / "fitness_muscle_model.obj"


def main():
    files = sorted(
        path
        for path in OUTPUT_DIR.glob("*.obj")
        if not path.name.startswith("test_")
        and path.name != DESTINATION.name
    )

    if not files:
        print("No OBJ files found.")
        return

    print(f"\nCombining {len(files)} muscle meshes...\n")

    vertex_offset = 0

    with DESTINATION.open("w") as output:
        output.write("# Fitness Muscle Model\n")
        output.write("# Generated from BodyParts3D meshes\n\n")

        for path in files:
            print(f"Adding: {path.name}")

            vertices = []
            faces = []

            lines = path.read_text(
                encoding="utf-8",
                errors="ignore",
            ).splitlines()

            for line in lines:
                if line.startswith("v "):
                    vertices.append(line)

                elif line.startswith("f "):
                    parts = line.split()
                    new_face = ["f"]

                    for part in parts[1:]:
                        components = part.split("/")

                        index = int(components[0]) + vertex_offset
                        components[0] = str(index)

                        new_face.append("/".join(components))

                    faces.append(" ".join(new_face))

            # Keep each muscle as a separate named object.
            output.write(f"o {path.stem}\n")

            for vertex in vertices:
                output.write(vertex + "\n")

            for face in faces:
                output.write(face + "\n")

            output.write("\n")

            vertex_offset += len(vertices)

    print("\n=== DONE ===")
    print(f"Combined {len(files)} muscles.")
    print(f"Created: {DESTINATION}")


if __name__ == "__main__":
    main()
