import { getFileContent } from "#utils";

const group: number[][] = getFileContent(" ");

const checkPattern = (arr: number[]): boolean => {
  let isDecreasing: boolean = false;
  let hasError: boolean = false;
  let allowedDifferences: number[] = [];

  for (let idx = 0; idx < arr.length - 1; idx++) {
    const num1: number = arr[idx];
    const num2: number = arr[idx + 1];

    if (idx === 0) {
      if (num1 === num2) {
        hasError = true;
        break;
      }

      isDecreasing = num1 > num2;

      allowedDifferences = [
        ...[1, 2, 3].map((x) => x * (isDecreasing ? 1 : -1)),
      ];
    }

    if (isDecreasing) {
      if (num1 < num2) {
        hasError = true;
        break;
      }
    } else {
      if (num1 > num2) {
        hasError = true;
        break;
      }
    }

    if (!allowedDifferences.includes(num1 - num2)) {
      hasError = true;
      break;
    }
  }

  return !hasError;
};

let patternCount: number = 0;

for (const arr of group) {
  if (checkPattern(arr)) {
    patternCount++;
  }
}

// Part one output
console.log(`Solution to part one is ${patternCount}!`);

patternCount = 0;

for (const arr of group) {
  if (!checkPattern(arr)) {
    // Create the smaller Arrays
    const checkPatterns: boolean[] = arr.map((_x, idx) => {
      return checkPattern(arr.filter((_xx, i) => idx !== i));
    });

    if (checkPatterns.some((x) => x)) {
      patternCount++;
    }
  } else {
    patternCount++;
  }
}

// Part two output
console.log(`Solution to part two is ${patternCount}!`);
