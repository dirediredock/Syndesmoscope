import subprocess
import sys
from pathlib import Path

# # /opt/homebrew/bin/python3 -m venv .venv
# # source .venv/bin/activate
# # pip install -r SETUP/SETUP_reqs.txt

SETUP_DIR = Path(__file__).parent
PROJECT_ROOT = SETUP_DIR.parent
VENV_DIR = PROJECT_ROOT / ".venv"
REQS_FILE = SETUP_DIR / "SETUP_reqs.txt"


def setup_venv():

    print("Creating virtual environment...")
    subprocess.run(
        ["/opt/homebrew/bin/python3", "-m", "venv", str(VENV_DIR)],
        check=True,
    )

    venv_pip = VENV_DIR / "bin" / "pip"

    print("Installing requirements...")
    subprocess.run(
        [str(venv_pip), "install", "-r", str(REQS_FILE)],
        check=True,
    )


if __name__ == "__main__":
    setup_venv()

print()
print(f"Executable:\t{sys.executable}")
print(f"Python:\t\t{sys.version}")
print()
print("Make sure you manualy select the .venv interpreter in your IDE")
print()
print("RUN:\t\tsource .venv/bin/activate")
print("DELETE:\t\trm -rf .venv")
print()
