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

function getOnScreenQuestion(challengeType) {
  switch (challengeType) {
    case CHALLENGE_TYPES.MCQ:
      return getOnScreenQuestionForMCQ();
    default:
      break;
  }

  const wordElems = Array.from(
    document.querySelectorAll('[data-test="hint-token"]')
  );

  const sentence = wordElems.map((we) => we.innerText).join("");
  return sentence;
}

function getOnScreenQuestionForMCQ() {
  const xpath =
    '//*[@id="root"]/div[1]/div/div/div[2]/div/div/div/div/div[2]/div[1]/div/div[2]/div/div[1]';
  const elem = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE
  ).singleNodeValue;
  const question = elem.innerText;

  return question;
}

/**
 * Duolingo displays an answer if the user skips a question without answering.
 * We return that answer.
 */
async function skipAnsweringAndGetOnScreenAnswer() {
  const skipBtn = getOnScreenSkipButton();
  await performAction(() => skipBtn.click.apply(skipBtn));

  const ansXPath =
    '//*[@id="session/PlayerFooter"]/div/div[1]/div/div[2]/div[1]/div/div';
  const answerElem = document.evaluate(
    ansXPath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE
  ).singleNodeValue;
  const answer = answerElem.innerText;

  return answer;
}

async function solveOnScreenChallenge(challengeType, question, answer) {
  switch (challengeType) {
    case CHALLENGE_TYPES.MCQ:
      await solveOnScreenMCQChallenge(question, answer);
    default:
      break;
  }
}

async function solveOnScreenMCQChallenge(question, answer) {
  const choiceElems = getOnScreenChoices();
  const correctChoice = choiceElems.find((ce) => getChoiceText(ce) === answer);

  await performAction(() => correctChoice.click.apply(correctChoice));
}

function getChoiceText(choiceElem) {
  return choiceElem.innerText.slice(2);
}

function getOnScreenChoices() {
  return Array.from(
    document.querySelectorAll('[data-test="challenge-choice"]')
  );
}
