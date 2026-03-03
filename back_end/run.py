import json
import os
import sys

from pipeline import (
    step_adjacency_grid,
    step_census,
    step_deepscramble,
    step_ksnakes,
    step_node_link,
)

from pipeline.graph_loader import FILENAMES

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(BASE_DIR, "input")
SCRATCH_DIR = os.path.join(BASE_DIR, "_deepscramble")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")


def main():
    manifest = []

    for filename in FILENAMES:

        print(f"\n{filename}")

        print("\n\tDeepScramble + Census-anchor ..............", end=" ", flush=True)
        step_deepscramble.run(filename, INPUT_DIR, SCRATCH_DIR)
        print("DONE!")

        print("\t\tkSnakes ...........................", end=" ", flush=True)
        step_ksnakes.run(filename, SCRATCH_DIR, PUBLIC_DIR)
        print("DONE!")

        print("\t\tHopCensus .........................", end=" ", flush=True)
        step_census.run(filename, SCRATCH_DIR, PUBLIC_DIR)
        print("DONE!")

        print("\t\tNodeLink ..........................", end=" ", flush=True)
        step_node_link.run(filename, SCRATCH_DIR, PUBLIC_DIR)
        print("DONE!")

        print("\t\tAdjacencyGrid .....................", end=" ", flush=True)
        step_adjacency_grid.run(filename, SCRATCH_DIR, PUBLIC_DIR)
        print("DONE!")

        with open(os.path.join(SCRATCH_DIR, f"{filename}.json"), "r") as f:
            meta = json.load(f)["metadata"]

        manifest.append(
            {
                "name": meta["name"],
                "nodes": meta["nodes"],
                "edges": meta["edges"],
            }
        )

    with open(os.path.join(PUBLIC_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n{'='*60}")
    print(f"  manifest.json written ({len(manifest)} graphs)")
    print(f"  output: {PUBLIC_DIR}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
