import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const lines = input.trim().split("\n").filter((line) => line.trim() !== "");

const towels = lines[0].split(",").map((towel) => towel.trim());
const patterns: string[] = [];

for (let lineIdx = 1; lineIdx < lines.length; lineIdx++) {
  patterns.push(lines[lineIdx]);
}

const findDesigns = (
  currentPattern: string,
  remainingPattern: string,
  memoization: Map<string, number>,
) => {
  if (remainingPattern.length === 0) {
    return towels.some((towel) => towel === currentPattern) ? 1 : 0;
  }

  const key = `${currentPattern},${remainingPattern}`;
  if (memoization.has(key)) {
    return memoization.get(key)!;
  }

  const possiblePatterns = towels.filter((towel) => currentPattern === towel);
  let result: number = possiblePatterns.reduce((sum, _towel) => {
    const [newPattern, ...newRemainingPattern] = remainingPattern.split("");
    return sum +
      findDesigns(newPattern, newRemainingPattern.join(""), memoization);
  }, 0);
  const [newPattern, ...newRemainingPattern] = remainingPattern.split("");
  result += findDesigns(
    currentPattern + newPattern,
    newRemainingPattern.join(""),
    memoization,
  );
  memoization.set(key, result);
  return result;
};

const memoization = new Map<string, number>();

let possibleDesigns = 0;
let possibleCombinations = 0;

for (const pattern of patterns) {
  const result = findDesigns(pattern[0], pattern.slice(1), memoization);
  if (result > 0) {
    possibleDesigns++;
  }
  possibleCombinations += result;
}

console.log(`The answer to part one is ${possibleDesigns}!`);
console.log(`The answer to part two is ${possibleCombinations}!`);
