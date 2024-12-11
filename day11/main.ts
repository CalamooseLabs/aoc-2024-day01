import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const stones = input.trim().split(/\s+/).map(Number);
const memoization = new Map<string, number>();

const blinkStone = (stone: number): number[] => {
  if (stone === 0) {
    // 1. If the current node is 0, then it will become 1
    return [1];
  } else if (stone.toString().length % 2 === 0) {
    // 2. If the current node's value's length of digits is even, then it will split into two nodes
    const value = stone.toString();
    const firstHalf = parseInt(value.slice(0, value.length / 2));
    const secondHalf = parseInt(value.slice(value.length / 2));
    return [firstHalf, secondHalf];
  } else {
    // 3. If none of the above rules apply, then the current node will be multiplied by 2024
    return [stone * 2024];
  }
};

const blinkUntil = (
  stone: number,
  blinks: number,
  memoization: Map<string, number>,
): number => {
  if (blinks === 0) {
    return 1;
  }

  const key = `${stone},${blinks}`;
  if (memoization.has(key)) {
    return memoization.get(key)!;
  }

  const newStones = blinkStone(stone);
  const result = newStones.reduce(
    (sum, stone) => sum + blinkUntil(stone, blinks - 1, memoization),
    0,
  );
  memoization.set(key, result);
  return result;
};

console.log(
  `The answer to part one is ${
    stones.reduce((sum, stone) => sum + blinkUntil(stone, 25, memoization), 0)
  }!`,
);

console.log(
  `The answer to part one is ${
    stones.reduce((sum, stone) => sum + blinkUntil(stone, 75, memoization), 0)
  }!`,
);
