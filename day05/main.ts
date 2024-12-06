import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const lines = input.split("\n");

type Rules = {
  [key: string]: {
    after: string[];
    before: string[];
  };
};

const rules: Rules = {};
const updates: string[][] = [];

for (const line of lines) {
  if (line.includes("|")) {
    // Then it is a rule
    const [before, after] = line.split("|");

    // This will show everything comes after itself
    if (before in rules) {
      rules[before].before.push(after);
    } else {
      rules[before] = { after: [], before: [after] };
    }

    // This will show everything that comes before itself
    if (after in rules) {
      rules[after].after.push(before);
    } else {
      rules[after] = { after: [before], before: [] };
    }
  } else if (line.includes(",")) {
    // Then is a page order update
    updates.push(line.split(","));
  }
}

let sum: number = 0;
let incorrectUpdates: string[][] = [];

updates.forEach((update) => {
  let isValid: boolean = true;
  update.forEach((page, index) => {
    const checkBefore: boolean = index !== 0;
    const checkAfter: boolean = index !== updates.length - 1;

    if (checkBefore) {
      // Create a for loop to check every index before the current index
      for (let i = 0; i < index; i++) {
        const beforePage = update[i];
        if (rules[page].before.includes(beforePage)) {
          // The rule is invalid
          isValid = false;
          break;
        }
      }
    }

    if (checkAfter) {
      // Create a for loop to check every index after the current index
      for (let i = index + 1; i < update.length; i++) {
        const afterPage = update[i];
        if (rules[page].after.includes(afterPage)) {
          isValid = false;
          break;
        }
      }
    }
  });

  if (isValid) {
    // Grab the middle page and add it to the sum
    sum += parseInt(update[Math.floor(update.length / 2)]);
  } else {
    incorrectUpdates.push(update);
  }
});

console.log(`The answer to part one is ${sum}!`);

let sum2: number = 0;

const correctUpdate = (
  currentUpdate: string[],
  remainingPages: string[],
): boolean => {
  if (remainingPages.length === 0) {
    sum2 += parseInt(currentUpdate[Math.floor(currentUpdate.length / 2)]);
    return true;
  }

  let shortCircuit: boolean = false;
  remainingPages.forEach((page) => {
    // Just pop one off the list and recursive
    const newRemainingPages = remainingPages.filter((p) => p !== page);

    for (let i = 0; i < currentUpdate.length; i++) {
      if (rules[currentUpdate[i]].after.includes(page)) {
        shortCircuit = true;
        break;
      }
    }

    if (!shortCircuit) {
      if (correctUpdate([...currentUpdate, page], newRemainingPages)) {
        return true;
      }
    }
  });

  return false;
};
// Figure out the how to correct the mistakes
incorrectUpdates.forEach((update) => {
  correctUpdate([], [...update]);
});

console.log(`The answer to part two is ${sum2}!`);
