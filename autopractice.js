async function main() {
  const fromQuestionToAnswer = new Map();

  while (window.location.href.endsWith("practice")) {
    await sleep(PAUSE_BETWEEN_CHALLENGES_IN_SECONDS);

    const challengeType = getOnScreenChallengeType();
    if (isSkippableChallengeType(challengeType)) {
      await skipToNextChallenge();
      continue;
    }

    console.log("Can't do anything useful just yet...");
    await skipToNextChallenge();
    continue;

    const question = getOnScreenQuestion();
    if (!fromQuestionToAnswer.has(question)) {
      const answer = await skipAnsweringAndGetOnScreenAnswer();
      fromQuestionToAnswer.set(question, answer);
      await skipToNextChallenge();
      continue;
    }
    const answer = fromQuestionToAnswer.get(question);

    await solveOnScreenChallenge(challengeType, question, answer);
  }
}
