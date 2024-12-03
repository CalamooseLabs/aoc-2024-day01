import { getRawFileContent } from "../utils/inputReader.ts";

const input = getRawFileContent();

const matches = input.match(/mul\((\d+),(\d+)\)/g);

let sum: number = 0;
matches?.forEach((match) => {
  const [_, a, b] = match.match(/mul\((\d+),(\d+)\)/)!;
  sum += parseInt(a) * parseInt(b);
});

console.log(`The answer to part one is ${sum}!`);

const re = input.match(/(mul\(\d+,\d+\)|(don?'?t?\(\)))/g);

let partTwo: number = 0;

let isEnabled: boolean = true;
re?.forEach((match) => {
  if (match === "don't()") isEnabled = false;
  if (match === "do()") isEnabled = true;

  if (match.includes("mul")) {
    if (isEnabled) partTwo += parseInt(match.match(/mul\((\d+),(\d+)\)/)![1]) * parseInt(match.match(/mul\((\d+),(\d+)\)/)![2]);
  }
});

console.log(`The answer to part two is ${partTwo}!`);
