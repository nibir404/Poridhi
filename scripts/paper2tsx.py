#!/usr/bin/env python3
"""Convert a Paper get_jsx dump into a Next.js TSX component.

Usage: paper2tsx.py <dump.txt|.jsx> <ComponentName> <out.tsx>

- Accepts either the raw tool-result JSON ([{type,text}]) or plain text.
- Downloads Paper file-assets into public/paper/ and rewrites URLs.
- Rewrites local paper-asset:// paths to /assets/.
- Makes the artboard root fluid (width 100%) so the page can fill the viewport.
"""
import json, os, re, sys, urllib.request

src, name, out = sys.argv[1], sys.argv[2], sys.argv[3]
raw = open(src).read()
try:
    data = json.loads(raw)
    raw = "".join(x.get("text", "") for x in data if isinstance(x, dict))
except Exception:
    pass

# Drop the {file, contentHash} header Paper prepends; keep from the first "(\n".
start = raw.find("(\n")
body = raw[start:] if start != -1 else raw
body = body.strip()
if body.startswith("(") and body.endswith(")"):
    body = body[1:-1].strip()

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pub = os.path.join(root, "public", "paper")
os.makedirs(pub, exist_ok=True)

# Paper file-assets need a signed-in session, so map the known uploads to our copies.
KNOWN = {
    "2Y0NCCYWQS3GHWC3E0PZX8215B": "/assets/poridhi-logo.png",
    "3B20AJ5VY4V4B86J7D78KKSCEE": "/assets/dither-ink.svg",
    "51311NMQB4VXK5J45VEAANRXZY": "/assets/dither-card.svg",
    "5FBHEG54SGG4V8FN3N7BNGG69E": "/assets/dither-card-ink.svg",
    "00TM9EYB4HSSDSGKDAWYJ4JHKK": "/assets/dither-light.svg",
    "240NKDET0S5BXJS39E7W862WJ3": "/assets/thumbs/ai.svg",
    "26NPR0ZTJHPH1YXX8RYYS1JQ3B": "/assets/thumbs/linux.svg",
    "2MGDF3AP07C94QSAT67MG2ZTKH": "/assets/thumbs/terraform.svg",
    "2XMTDS8CDT1XM8B3Q3FKCY4NWG": "/assets/thumbs/aws.svg",
    "2Y1XRE3AGB1JEVCSV87612693N": "/assets/thumbs/docker.svg",
    "3E8XJDBWGBV14KDBTCZPX3607H": "/assets/thumbs/prometheus.svg",
    "62HE0AJDHZ8JENMRYRM77BE75N": "/assets/thumbs/kubernetes.svg",
    "68AN5FEQ7SHTNN17CJVYJ435HK": "/assets/thumbs/go.svg",
    "6DS1FZ5ED4DDQ0BR4Q1ARVR0V6": "/assets/thumbs/github.svg",
    "2MQMDD643S6TQVRS82BDW63QJQ": "/assets/dither-card-ink.svg",
}

def fetch(m):
    url = m.group(1)
    fname = url.rsplit("/", 1)[-1]
    key = fname.split(".")[0]
    if key in KNOWN:
        return m.group(0).replace(url, KNOWN[key])
    dest = os.path.join(pub, fname)
    if not os.path.exists(dest):
        try:
            urllib.request.urlretrieve(url, dest)
        except Exception as e:  # keep remote URL if download fails
            print("asset download failed", url, e, file=sys.stderr)
            return m.group(0)
    return m.group(0).replace(url, "/paper/" + fname)

body = re.sub(r"(https://app\.paper\.design/file-assets/[^)\"'\s]+)", fetch, body)
body = re.sub(r"paper-asset://[^\"')]*?/assets/", "/assets/", body)

# Fluid artboard root: first width: 'NNNNpx' on the root element.
first_line_end = body.find("\n")
head, rest = body[:first_line_end], body[first_line_end:]
head = re.sub(r"width: '\d+px'", "width: '100%'", head, count=1)
head = head.replace("overflow: 'clip', ", "")
body = head + rest

# Keep Paper node ids as data attributes so behaviour can target layers.
body = re.sub(r' id="([0-9A-Z]+-0)"', r' data-pid="\1"', body)
# JSX attribute fixes for React/TS.
body = body.replace(" class=", " className=")
body = re.sub(r"xlink:href", "xlinkHref", body)
body = body.replace("fontWeight: 700", "fontWeight: 600")  # semibold everywhere, not bold

tsx = f"""/* Auto-generated from Paper by scripts/paper2tsx.py. Do not hand-edit layout here;
   regenerate from the design and add behaviour in wrapper components. */
export default function {name}() {{
  return (
{body}
  );
}}
"""
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w").write(tsx)
print(out, len(tsx))
