const PAUSE_BETWEEN_CHALLENGES_IN_SECONDS = 5;

// pause time before as well as after performing an action
// since UI elements take time to be updated, this is a safety precaution
const PAUSE_AROUND_ACTIONS_IN_SECONDS = 2;

const CHALLENGE_TYPES = Object.freeze({
  LISTEN_MATCH: Symbol("listenMatch"),
  TRANSLATE: Symbol("translate"),
  MCQ: Symbol("assist"),
});

const CHALLENGE_TYPE_FROM_ATTR = {
  "challenge-listenMatch": CHALLENGE_TYPES.LISTEN_MATCH,
  "challenge-translate": CHALLENGE_TYPES.TRANSLATE,
  "challenge-assist": CHALLENGE_TYPES.MCQ,
};