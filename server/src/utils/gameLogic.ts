export const generateSecretNumber = (digitCount: number, allowDuplicates: boolean): string => {
  const digits = '0123456789';
  let secret = '';

  if (allowDuplicates) {
    for (let i = 0; i < digitCount; i++) {
      secret += digits[Math.floor(Math.random() * 10)];
    }
  } else {
    const shuffled = digits.split('').sort(() => Math.random() - 0.5);
    secret = shuffled.slice(0, digitCount).join('');
  }

  return secret;
};

export const calculateFeedback = (
  guess: string,
  secret: string
): ('green' | 'yellow' | 'gray')[] => {
  const feedback: ('green' | 'yellow' | 'gray')[] = [];
  const secretDigits = secret.split('');
  const usedIndices = new Set<number>();

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) {
      feedback[i] = 'green';
      usedIndices.add(i);
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (feedback[i] === 'green') continue;

    let found = false;
    for (let j = 0; j < secretDigits.length; j++) {
      if (!usedIndices.has(j) && guess[i] === secretDigits[j]) {
        feedback[i] = 'yellow';
        usedIndices.add(j);
        found = true;
        break;
      }
    }

    if (!found) {
      feedback[i] = 'gray';
    }
  }

  return feedback;
};

export const isWinningGuess = (feedback: ('green' | 'yellow' | 'gray')[]): boolean => {
  return feedback.every((f) => f === 'green');
};

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};
