import { getFileContent } from "#utils";

const groups: number[][] = getFileContent("   ");

const groupA: number[] = [];
const groupB: number[] = [];

groups.forEach((group) => {
  groupA.push(group[0]);
  groupB.push(group[1]);
});

// Part One
groupA.sort();
groupB.sort();

let sum = 0;
for (let idx = 0; idx < groupA.length; idx++) {
  if (groupA[idx] > groupB[idx]) {
    sum += groupA[idx] - groupB[idx];
  } else {
    sum += groupB[idx] - groupA[idx];
  }
}

console.log(`The part one solution is ${sum}!`);

// Part Two
let similarityScore = 0;
for (let idx = 0; idx < groupA.length; idx++) {
  const occursLen = (groupB.filter((x) => x === groupA[idx])).length;

  similarityScore += groupA[idx] * occursLen;
}

console.log(`The part two solution is ${similarityScore}!`);
