import json
import os


def run(filename, scratch_dir, public_dir):
    with open(os.path.join(scratch_dir, f"{filename}.json"), "r") as f:
        data = json.load(f)

    out_dir = os.path.join(public_dir, filename)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, f"{filename}_NodeLink.json"), "w") as f:
        json.dump(data, f, indent=2)
