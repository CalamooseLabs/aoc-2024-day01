import { getRawFileContent } from "../utils/mod.ts";

const input = getRawFileContent();

const lines = input.split("\n").filter((line) => line.length > 0);

// Does not follow PEMDAS
const straightSumOrProduct = (sum: number, currentSum: number, numArray: number[]): boolean => {
  if (numArray.length === 0) {
    return sum === currentSum;
  }

  const [first, ...rest] = numArray;
  return straightSumOrProduct(sum, currentSum + first, rest) || straightSumOrProduct(sum, currentSum * first, rest);
}

let partOneTotal: number = 0;

lines.forEach((line) => {
  const [sum, nums] = line.split(": ");
  const [first, ...numArray] = nums.split(" ").map(Number);

  if (straightSumOrProduct(Number(sum), first, numArray)) {
    partOneTotal += Number(sum);
  }
});

console.log(`The answer to part one is ${partOneTotal}!`);

const straightSumOrProductOrOR = (sum: number, currentSum: number, numArray: number[]): boolean => {
    if (numArray.length === 0) {
      return sum === currentSum;
    }
  
    const [first, ...rest] = numArray;
    return straightSumOrProductOrOR(sum, Number(`${currentSum}${first}`), rest) || straightSumOrProductOrOR(sum, currentSum + first, rest) || straightSumOrProductOrOR(sum, currentSum * first, rest);
  }
  

let partTwoTotal: number = 0;

lines.forEach((line) => {
    const [sum, nums] = line.split(": ");
    const [first, ...numArray] = nums.split(" ").map(Number);
  
    if (straightSumOrProductOrOR(Number(sum), first, numArray)) {
      partTwoTotal += Number(sum);
    }
});

console.log(`The answer to part two is ${partTwoTotal}!`);
