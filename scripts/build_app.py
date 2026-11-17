#!/usr/bin/env python3
"""Generate app screen components + routes from design/app-manifest.json."""
import json, os, subprocess
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
for s in json.load(open("design/app-manifest.json")):
    src = next((f"design/app/{s['id']}{e}" for e in (".json", ".jsx") if os.path.exists(f"design/app/{s['id']}{e}")), None)
    if not src:
        print("missing", s["id"]); continue
    subprocess.run(["python3", "scripts/paper2tsx.py", src, s["name"], f"src/design/app/{s['name']}.tsx"], check=True, capture_output=True)
    d = "src/app" + s["route"]
    os.makedirs(d, exist_ok=True)
    open(f"{d}/page.tsx", "w").write(
        f'import AppShell from "@/components/app/AppShell";\n'
        f'import {s["name"]} from "@/design/app/{s["name"]}";\n\n'
        f'export const metadata = {{ title: "{s.get("title", s["name"])} · Poridhi" }};\n\n'
        f'export default function Page() {{\n  return (\n    <AppShell screen="{s["name"]}">\n      <{s["name"]} />\n    </AppShell>\n  );\n}}\n')
    print("ok", s["route"])
