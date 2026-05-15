# Session Handoff — 2026-04-20 (end)

Founder-locked decisions from this session, state conflict to resolve first, and dev-access handles for the next session.

## Locked decisions

1. **Context picker header:** `"What part of life is this touching most right now?"`
2. **Context labels:** Work & career / Relationships / Self / Health & energy / Money & security / Purpose & direction / Daily life
3. **Skip copy:** `"Skip for now"`
4. **Rule 5 scoring weight:** `+1` — hint only, never hard filter, never overrides same-day / joy-growth / invariants
5. **surface_override_* approval chain:** founder + one curator (2-sig)
6. **Stillness + clarity carry:** PARKED (migration `0127` retired pools); do not unpark without clarity locked-order + chip-ceiling reconciliation
7. **`room_identity` field:** REMOVED from envelope (not dead)

## Known state conflict — resolve first in new session

A later "polish pass" status report showed smoke at **1/12 green** (`room_clarity/cold_start` only), while Wave B work reported **12/12 green** on `b1ae635c`. These can't both be true on the same tip — one reflects older state.

**First action in new session:** SSH dev EC2, run:

```bash
docker exec kalpx-dev-web python manage.py smoke_room_render --salt=handoff-$(date +%s)
```

to get ground truth, then triage from there.

## Dev handles

### JWT for dev smoke (user_id=1)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc5MzI2Nzg4LCJpYXQiOjE3NzY3MzQ3ODgsImp0aSI6IjdmMzBiMjVmYWYzNDRiNzM5MzU4YmQyZWY2YmVmNWFhIiwidXNlcl9pZCI6MX0.CXj2u46zKJj8-W1_1YHuIvOY0GkwekXjTMSRebT9UdE
```

### Dev EC2 access

```bash
ssh -i ~/KalpXKeyPairName.pem ubuntu@18.223.217.113
cd /opt/kalpx-dev/app/KalpX
```
