// One-shot flag: set before a post-login redirect so checkJourney in
// Home.tsx doesn't navigate new users to MitraStart and override it.
let _skip = false;

export function setSkipMitraStart() {
  _skip = true;
}

export function consumeSkipMitraStart(): boolean {
  if (_skip) {
    _skip = false;
    return true;
  }
  return false;
}

// One-shot flag: set when navigating Home from a program flow so that
// Home.tsx renders FourDoorHomeContainer even if the user has no journey.
let _forceFourDoor = false;

export function setForceFourDoorHome() {
  _forceFourDoor = true;
}

export function consumeForceFourDoorHome(): boolean {
  if (_forceFourDoor) {
    _forceFourDoor = false;
    return true;
  }
  return false;
}
