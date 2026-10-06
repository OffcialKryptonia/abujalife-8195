#!/usr/bin/env python3
from pathlib import Path
import zipfile, shutil, subprocess

zip_path = Path("abujalife-dual-currency-v2.zip")
work = Path("/tmp/abujalife-rebuild")
if not zip_path.exists():
    raise SystemExit("Rebuild ZIP not found. Pull the latest branch first.")

if work.exists():
    shutil.rmtree(work)
work.mkdir(parents=True)

with zipfile.ZipFile(zip_path) as z:
    z.extractall(work)

root = work / "abujalife-8195-main"
if not root.is_dir():
    raise SystemExit("Unexpected ZIP structure.")

for item in root.iterdir():
    dest = Path.cwd() / item.name
    if dest.exists() and dest.is_dir() and item.is_dir():
        for child in item.iterdir():
            target = dest / child.name
            if target.exists():
                if target.is_dir():
                    shutil.rmtree(target)
                else:
                    target.unlink()
            shutil.copytree(child, target) if child.is_dir() else shutil.copy2(child, target)
    elif dest.exists():
        if dest.is_file():
            dest.unlink()
        shutil.copy2(item, dest)
    else:
        shutil.copytree(item, dest) if item.is_dir() else shutil.copy2(item, dest)

zip_path.unlink()
shutil.rmtree(work)

subprocess.run(["git", "add", "-A"], check=True)
if subprocess.run(["git", "diff", "--cached", "--quiet"]).returncode == 0:
    print("No changes to commit.")
else:
    subprocess.run(["git", "commit", "-m", "Apply AbujaLife dual-currency rebuild"], check=True)
    subprocess.run(["git", "push", "origin", "feature/abuja-life-dual-currency-rebuild"], check=True)
    print("ABUJALIFE REBUILD APPLIED AND PUSHED.")
