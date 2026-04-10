"""
Mint JWTs for the four test users via SSH to dev backend, save to jwts.json.

Run this once after seeding test users; the API tests reuse the saved tokens.

Usage:
    python3 tests/api/mint_test_jwts.py
"""
from __future__ import annotations

import json
import shlex
import subprocess
import sys
from pathlib import Path

EMAILS = [
    "test+day3@kalpx.com",
    "test+day7@kalpx.com",
    "test+day14@kalpx.com",
    "test+welcomeback@kalpx.com",
]

KEY = "~/KalpXKeyPairName.pem"
HOST = "ubuntu@18.223.217.113"
DOCKER_CMD = "docker exec kalpx-dev-web python -c"

PY = """
import django; django.setup()
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import json
User = get_user_model()
out = {}
for email in {emails!r}:
    try:
        u = User.objects.get(email=email)
        r = RefreshToken.for_user(u)
        out[email] = {{"access": str(r.access_token), "refresh": str(r)}}
    except Exception as e:
        out[email] = {{"error": str(e)}}
print(json.dumps(out))
""".format(emails=EMAILS)


def main() -> None:
    cmd = f"ssh -i {KEY} {HOST} '{DOCKER_CMD} {shlex.quote(PY)} 2>/dev/null'"
    print("Minting JWTs via SSH…")
    proc = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"SSH failed: {proc.stderr}")
        sys.exit(1)

    # The remote command may print Firebase init lines first; the last JSON line is what we want.
    lines = [l for l in proc.stdout.strip().splitlines() if l.strip().startswith("{")]
    if not lines:
        print(f"No JSON in output: {proc.stdout!r}")
        sys.exit(1)
    raw = json.loads(lines[-1])

    out = {}
    errors = {}
    for email, val in raw.items():
        if "error" in val:
            errors[email] = val["error"]
        else:
            out[email] = val["access"]

    target = Path(__file__).resolve().parent / "jwts.json"
    target.write_text(json.dumps(out, indent=2))
    print(f"Wrote {len(out)} tokens to {target}")
    if errors:
        print(f"Errors: {errors}")
        sys.exit(1)


if __name__ == "__main__":
    main()
