if (Deno.args.length < 1) {
  throw new Error("Argument of file input is required")
}

const FileArg = Deno.args[0]

const groupA: number[] = [];
const groupB: number[] = [];
try {
  const decoder = new TextDecoder("utf-8");
  const fileContents = Deno.readFileSync(FileArg);
  const decodedContent = decoder.decode(fileContents);

  const decodedLines = decodedContent.split("\n");
  for (const line of decodedLines) {
    const values = line.split("   ");
    if (values.length !== 2) continue;
    groupA.push(parseInt(values[0]));
    groupB.push(parseInt(values[1]));
  }
} catch (_e) {
  throw new Error("Something went wrong...");
}

// Part One
groupA.sort();
groupB.sort();

let sum = 0;
for (let idx = 0; idx < groupA.length; idx++) {
  if (groupA[idx] > groupB[idx]) {
    sum += (groupA[idx] - groupB[idx]);
  } else {
    sum += (groupB[idx] - groupA[idx]);
  }
}

console.log(`The part one solution is ${sum}!`);

// Part Two
let similarityScore = 0;
for (let idx = 0; idx < groupA.length; idx++) {
  const occursLen = (groupB.filter(x => x === groupA[idx])).length

  similarityScore += (groupA[idx] * occursLen);
}

console.log(`The part two solution is ${similarityScore}!`);