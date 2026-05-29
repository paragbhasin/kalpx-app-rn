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
