import { getRawFileContent } from "#utils";

const input = getRawFileContent("input-test.txt");

const lines = input.split("\n").filter((line) => line.length > 0);

console.log(lines);
