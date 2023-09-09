// words with apostrophe that Duolingo doesn't separate
const APS_EXCEPTIONS = ["don't"];

const PAUSE_BETWEEN_CHALLENGES_IN_SECONDS = 0.5;

// pause time before as well as after performing an action
// since UI elements take time to be updated, this is a safety precaution
const PAUSE_AROUND_ACTIONS_IN_SECONDS = 0.1;

const CHALLENGE_TYPES = Object.freeze({
  LISTEN_MATCH: Symbol("listenMatch"),
  TRANSLATE: Symbol("translate"),
  MCQ: Symbol("assist"),
  FILL_IN_THE_GAP_MCQ: Symbol("gapFill"),
  FILL_IN_THE_GAP_TYPE: Symbol("partialReverseTranslate"),
  NAME: Symbol("name"),
});

const CHALLENGE_TYPE_FROM_ATTR = {
  "challenge-listenMatch": CHALLENGE_TYPES.LISTEN_MATCH,
  "challenge-translate": CHALLENGE_TYPES.TRANSLATE,
  "challenge-assist": CHALLENGE_TYPES.MCQ,
  "challenge-gapFill": CHALLENGE_TYPES.FILL_IN_THE_GAP_MCQ,
  "challenge-partialReverseTranslate": CHALLENGE_TYPES.FILL_IN_THE_GAP_TYPE,
  "challenge-name": CHALLENGE_TYPES.NAME,
};
