const fromQuestionToAnswer = new Map();

async function main() {
  while (window.location.href.endsWith("practice")) {
    await sleep(PAUSE_BETWEEN_CHALLENGES_IN_SECONDS);

    const challengeType = getOnScreenChallengeType();
    if (isSkippableChallengeType(challengeType)) {
      await skipToNextChallenge();
      continue;
    }

    const question = getOnScreenQuestion(challengeType);
    const key = `${challengeType.toString()}~${question}`;
    if (!fromQuestionToAnswer.has(key)) {
      const answer = await skipAnsweringAndGetOnScreenAnswer();
      fromQuestionToAnswer.set(key, answer);
      await skipToNextChallenge();
      continue;
    }
    const answer = fromQuestionToAnswer.get(key);

    await solveOnScreenChallenge(challengeType, question, answer);
    await skipToNextChallenge();
  }
}
