import { getRawFileContent } from "#utils";

const input = getRawFileContent("input-test.txt").split("\n").filter((line) =>
  line.length > 0
).join("\n");

// Types for tracking sequences of price changes and their results
type ChangeSequence = {
  changes: number[]; // The sequence of price changes
  positions: Map<number, number>; // Maps initial secret -> position where sequence was found
  prices: Map<number, number>; // Maps initial secret -> price at that position
};

/**
 * Performs a bitwise XOR operation between two numbers, ensuring they're treated as unsigned 32-bit integers
 */
function mix(secretNumber: number, value: number): number {
  return (secretNumber >>> 0) ^ (value >>> 0);
}

/**
 * Applies modulo 16777216 to the secret number, ensuring a positive result
 */
function prune(secretNumber: number): number {
  return ((secretNumber % 16777216) + 16777216) % 16777216;
}

/**
 * Generates the next secret number in the sequence using the specified rules:
 * 1. Multiply by 64, mix, prune
 * 2. Divide by 32, mix, prune
 * 3. Multiply by 2048, mix, prune
 */
function generateNextSecret(secret: number): number {
  let result = secret;
  // Step 1: Multiply by 64
  result = mix(result, (result * 64) >>> 0);
  result = prune(result);

  // Step 2: Divide by 32
  result = mix(result, Math.floor(result / 32));
  result = prune(result);

  // Step 3: Multiply by 2048
  result = mix(result, (result * 2048) >>> 0);
  result = prune(result);

  return result;
}

/**
 * Extracts the ones digit (price) from a secret number
 */
function getPrice(secret: number): number {
  return secret % 10;
}

/**
 * Given an initial secret number, generates 'count' new secrets and returns:
 * - An array of prices (ones digits of each secret)
 * - An array of changes between consecutive prices
 */
function generatePriceChanges(
  initialSecret: number,
  count: number,
): [number[], number[]] {
  const prices: number[] = [];
  const changes: number[] = [];

  let currentSecret = initialSecret;
  prices.push(getPrice(currentSecret));

  for (let i = 0; i < count; i++) {
    currentSecret = generateNextSecret(currentSecret);
    const newPrice = getPrice(currentSecret);
    prices.push(newPrice);
    // Record the change from the previous price
    changes.push(newPrice - prices[i]);
  }

  return [prices, changes];
}

/**
 * Part 1: Calculate the sum of the 2000th secret number for each initial secret
 */
function solvePartOne(input: string): number {
  const initialSecrets = input.trim().split("\n").map(Number);
  let total = 0;

  for (const secret of initialSecrets) {
    let currentSecret = secret;
    // Generate 2000 new secrets
    for (let i = 0; i < 2000; i++) {
      currentSecret = generateNextSecret(currentSecret);
    }
    total += currentSecret;
  }

  return total;
}

/**
 * Part 2: Find the sequence of price changes that maximizes total bananas
 * Optimized version that pre-computes all possible sequences
 */
function solvePartTwo(input: string): number {
  const initialSecrets = input.trim().split("\n").map(Number);

  // Step 1: Pre-compute all price changes for each initial secret
  const allChangesAndPrices = new Map<number, [number[], number[]]>();
  for (const secret of initialSecrets) {
    allChangesAndPrices.set(secret, generatePriceChanges(secret, 2000));
  }

  // Step 2: Find all possible sequences of 4 consecutive changes that appear in the data
  const sequences = new Map<string, ChangeSequence>();

  for (const secret of initialSecrets) {
    const [prices, changes] = allChangesAndPrices.get(secret)!;

    // Look at each possible sequence of 4 changes
    for (let i = 0; i < changes.length - 3; i++) {
      const sequence = changes.slice(i, i + 4);
      const sequenceKey = sequence.join(",");

      // Create new sequence entry if we haven't seen this one before
      if (!sequences.has(sequenceKey)) {
        sequences.set(sequenceKey, {
          changes: sequence,
          positions: new Map(),
          prices: new Map(),
        });
      }

      // Record where this sequence appears and what price it yields
      const sequenceInfo = sequences.get(sequenceKey)!;
      if (!sequenceInfo.positions.has(secret)) {
        sequenceInfo.positions.set(secret, i + 4);
        sequenceInfo.prices.set(secret, prices[i + 4]);
      }
    }
  }

  // Step 3: Evaluate each sequence to find the one that gives the most bananas
  let maxBananas = 0;

  for (const [_key, sequence] of sequences) {
    let totalBananas = 0;
    // Sum up the prices we get from each initial secret
    for (const secret of initialSecrets) {
      if (sequence.prices.has(secret)) {
        totalBananas += sequence.prices.get(secret)!;
      }
    }

    if (totalBananas > maxBananas) {
      maxBananas = totalBananas;
    }
  }

  return maxBananas;
}

// Function to solve both parts
function solvePuzzle(input: string): [number, number] {
  return [solvePartOne(input), solvePartTwo(input)];
}

const [buyersNumbers, bananas] = solvePuzzle(input);
console.log(`The answer to part one is ${buyersNumbers}!`);
console.log(`The answer to part two is ${bananas}!`);
