import subprocess
import sys


def check_import(module_name: str, display_name: str) -> None:
    try:
        module = __import__(module_name)
        version = getattr(module, "__version__", "installed")
        print(f"[OK] {display_name}: {version}")
    except ImportError as exc:
        print(f"[MISSING] {display_name}: {exc}")


print("Testing imports...", flush=True)
check_import("cv2", "OpenCV")
check_import("mediapipe", "MediaPipe")
check_import("numpy", "NumPy")
check_import("fastapi", "FastAPI")

print("\nInstalled packages:", flush=True)
subprocess.run([sys.executable, "-m", "pip", "list"], check=False)
