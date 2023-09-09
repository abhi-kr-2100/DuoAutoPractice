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
    case CHALLENGE_TYPES.NAME:
      return getOnScreenQuestionForName();
    default:
      break;
  }

  const wordElems = Array.from(
    document.querySelectorAll('[data-test="hint-token"]')
  );

  const sentence = wordElems.map((we) => we.innerText).join("");
  return sentence;
}

function getOnScreenQuestionForName() {
  const elem = document.querySelector("h1 span");
  const question = elem.innerText;

  return question;
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
    case CHALLENGE_TYPES.FILL_IN_THE_GAP_MCQ:
      await solveOnScreenMCQChallenge(question, answer);
      break;
    case CHALLENGE_TYPES.TRANSLATE:
      await solveOnScreenTranslateChallenge(question, answer);
      break;
    case CHALLENGE_TYPES.FILL_IN_THE_GAP_TYPE:
      await solveOnScreenTypeChallenge(question, answer);
      break;
    case CHALLENGE_TYPES.NAME:
      await solveOnScreenNameChallenge(question, answer);
      break;
    default:
      break;
  }
}

async function solveOnScreenNameChallenge(question, answer) {
  const inputBox = getOnScreenTextInput();
  await performAction(() => inputBox.click.apply(inputBox));

  await performAction(() => {
    setInputNatively(inputBox, answer.split(",")[0]);
    inputBox.dispatchEvent.apply(inputBox, [
      new Event("input", { bubbles: true, cancelable: true }),
    ]);
  });
}

function getOnScreenTextInput() {
  const elem = document.querySelector('[data-test="challenge-text-input"]');

  return elem;
}

async function solveOnScreenTypeChallenge(question, answer) {
  const inputBox = getOnScreenInputBox();
  await performAction(() => inputBox.click.apply(inputBox));

  const embeddedAnswer = getOnScreenEmbeddedAnswer(inputBox);
  inputBox.innerHTML = embeddedAnswer;
  await performAction(() =>
    inputBox.dispatchEvent.apply(inputBox, [
      new Event("input", { bubbles: true, cancelable: true }),
    ])
  );
}

function getOnScreenEmbeddedAnswer(inputBox) {
  return inputBox.parentElement.lastChild.innerHTML;
}

function getOnScreenInputBox() {
  const elem = document.querySelector("[contenteditable]");
  return elem;
}

async function solveOnScreenTranslateChallenge(question, answer) {
  const togBtn = getSwitchToKeyboardButton();
  if (togBtn) {
    await performAction(() => togBtn.click.apply(togBtn));
  }

  const blockElems = getOnScreenWordBlocks();
  if (!blockElems) {
    const inputTextArea = getOnScreenInputTextArea();
    await performAction(() => {
      setInputNatively(inputTextArea, answer);
      inputTextArea.dispatchEvent.apply(inputTextArea, [
        new Event("input", { bubbles: true, cancelable: true }),
      ]);
    });
    return;
  }
  const words = getWords(answer);

  for (const word of words) {
    const b = blockElems.find((b) => b.innerText === word);
    const btn = b.firstChild.firstChild;
    await performAction(() => btn.click.apply(btn));
  }
}

function setInputNatively(inputElem, value) {
  const { set } = Object.getOwnPropertyDescriptor(inputElem, "value");
  const proto = Object.getPrototypeOf(inputElem);
  const { set: protoSet } =
    Object.getOwnPropertyDescriptor(proto, "value") || {};

  if (protoSet && set !== protoSet) {
    protoSet.call(inputElem, value);
  } else if (set) {
    set.call(inputElem, value);
  } else {
    throw new Error("No value setters!");
  }
}

function getOnScreenInputTextArea() {
  const elem = document.querySelector(
    '[data-test="challenge-translate-input"]'
  );
  return elem;
}

function getSwitchToKeyboardButton() {
  const elem = document.querySelector('[data-test="player-toggle-keyboard"]');
  if (elem?.innerText.toLowerCase().includes("keyboard")) {
    return elem;
  }
}

function getOnScreenWordBlocks() {
  const wordbank = document.querySelector('[data-test="word-bank"]');
  if (!wordbank) {
    return;
  }
  const elems = wordbank.childNodes;

  return Array.from(elems);
}

function getWords(sentence) {
  const words = sentence.split(" ");
  const normalized = words.map((w) => w.replace(/[.,?!¡¿]/g, ""));

  return normalized;
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
