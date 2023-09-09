function sleep(duration) {
  return new Promise((r) => setTimeout(r, duration * 1000));
}

function getOnScreenChallengeType() {
  const xpath = '//*[@id="root"]/div[1]/div/div/div[2]/div/div/div';
  const elem = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE
  ).singleNodeValue;

  const type = elem.getAttribute("data-test").split(" ")[1];
  return CHALLENGE_TYPE_FROM_ATTR[type];
}

/**
 * Skippable challenges are those that can be skipped without any penalty.
 * Challenges that require the user to speak or listen are skippable.
 */
function isSkippableChallengeType(challengeType) {
  switch (challengeType) {
    case CHALLENGE_TYPES.LISTEN_MATCH:
      return true;
    default:
      return false;
  }
}

async function skipToNextChallenge() {
  const skipBtn = getOnScreenSkipButton();
  if (skipBtn) {
    await performAction(() => skipBtn.click.apply(skipBtn));
  }

  const nextBtn = getOnScreenNextButton();
  if (nextBtn) {
    await performAction(() => nextBtn.click.apply(nextBtn));
  }
}

function getOnScreenSkipButton() {
  const elem = document.querySelector('[data-test="player-skip"]');
  return elem;
}

function getOnScreenNextButton() {
  const elem = document.querySelector('[data-test="player-next"]');
  return elem;
}

async function performAction(action) {
  await sleep(PAUSE_AROUND_ACTIONS_IN_SECONDS);
  action();
  await sleep(PAUSE_AROUND_ACTIONS_IN_SECONDS);
}
