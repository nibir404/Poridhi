#!/usr/bin/env python3
"""Recover Paper get_jsx results from the Claude session transcript.

Usage: pull_jsx_from_transcript.py <transcript.jsonl> <outdir> <nodeId> [<nodeId> ...]
Writes <outdir>/<nodeId>.jsx for each artboard whose JSX appears in a tool result.
"""
import json, sys, os

tr, outdir, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(outdir, exist_ok=True)
found = {}

def texts(content):
    if isinstance(content, str):
        yield content
    elif isinstance(content, list):
        for c in content:
            if isinstance(c, dict):
                if c.get("type") == "text":
                    yield c.get("text", "")
                elif "content" in c:
                    yield from texts(c["content"])

for line in open(tr):
    try:
        ev = json.loads(line)
    except Exception:
        continue
    msg = ev.get("message") or {}
    content = msg.get("content")
    if not isinstance(content, list):
        continue
    for part in content:
        if not isinstance(part, dict) or part.get("type") != "tool_result":
            continue
        for t in texts(part.get("content")):
            for nid in ids:
                if f'<div id="{nid}"' in t[:400] or f'<div id="{nid}"' in t[:200].lstrip("(\n "):
                    found[nid] = t

for nid in ids:
    if nid in found:
        open(os.path.join(outdir, f"{nid}.jsx"), "w").write(found[nid])
        print("ok", nid, len(found[nid]))
    else:
        print("missing", nid)
