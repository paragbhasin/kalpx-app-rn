"""
Rooms Maestro seed — creates test+rooms@kalpx.com persona with repeat state.

Run on dev EC2:
  scp rooms_seed.py ubuntu@18.223.217.113:/tmp/
  ssh ubuntu@18.223.217.113 "docker cp /tmp/rooms_seed.py kalpx-dev-web:/tmp/rooms_seed.py"
  ssh ubuntu@18.223.217.113 "docker exec kalpx-dev-web python manage.py shell -c \"exec(open('/tmp/rooms_seed.py').read())\""
"""
from django.contrib.auth import get_user_model
from core.models import RoomRenderLog, CompanionState

User = get_user_model()
email = "test+rooms@kalpx.com"
password = "Test1234!"

# Create user if not present
u, created = User.objects.get_or_create(
    email=email,
    defaults={"username": email},
)
if created:
    u.set_password(password)
    u.save()

# soft_verified
try:
    from core.models import UserProfile
    prof, _ = UserProfile.objects.get_or_create(user=u)
    prof.soft_verified = True
    prof.save()
    print("soft_verified: OK")
except Exception as e:
    print(f"soft_verified: {e}")

# Journey (needed for life_context to persist via PATCH companion-state)
try:
    from core.models import Journey, JourneyDay
    from django.utils import timezone
    j, _ = Journey.objects.get_or_create(
        user=u,
        defaults={"is_active": True, "start_date": timezone.now().date()},
    )
    JourneyDay.objects.get_or_create(
        journey=j,
        day_number=1,
        defaults={"date": timezone.now().date()},
    )
    print(f"Journey: {j.pk}")
except Exception as e:
    print(f"Journey: {e}")

# Repeat state: prior RoomRenderLog for all 6 rooms
rooms = [
    "room_connection", "room_clarity", "room_growth",
    "room_joy", "room_release", "room_stillness",
]
for room_id in rooms:
    RoomRenderLog.objects.get_or_create(
        user=u,
        room_id=room_id,
        defaults={},
    )

# CompanionState: life_context="self" for life-context picker tests
state, _ = CompanionState.objects.get_or_create(user=u)
state.life_context = "self"
state.save()

print(f"\nRooms persona ready: {email}")
for room_id in rooms:
    cnt = RoomRenderLog.objects.filter(user=u, room_id=room_id).count()
    print(f"  {room_id}: {cnt} prior render(s)")
print(f"  CompanionState.life_context: {state.life_context}")
