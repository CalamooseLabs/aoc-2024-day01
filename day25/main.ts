import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const lines = input.split("\n").filter((line) => line.length > 0);

console.log(lines);
