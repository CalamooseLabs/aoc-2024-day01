import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const determinant = (matrix: number[][]) => {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
};

const cramerRule = (matrix: number[][], vector: number[]) => {
  const detA = determinant(matrix);
  const detX = determinant([[vector[0], matrix[0][1]], [
    vector[1],
    matrix[1][1],
  ]]);
  const detY = determinant([[matrix[0][0], vector[0]], [
    matrix[1][0],
    vector[1],
  ]]);

  const A = detX / detA;
  const B = detY / detA;
  return [A, B];
};

const ButtonARegex = /Button A: X\+(\d+), Y\+(\d+)/;
const ButtonBRegex = /Button B: X\+(\d+), Y\+(\d+)/;
const PrizeRegex = /Prize: X=(\d+), Y=(\d+)/;

const groupRegex =
  /Button A: X\+(\d+), Y\+(\d+)\nButton B: X\+(\d+), Y\+(\d+)\nPrize: X=(\d+), Y=(\d+)/g;

const groups: RegExpMatchArray =
  (input.match(groupRegex) ?? []) as RegExpMatchArray;

const TOKEN_A = 3;
const TOKEN_B = 1;

let totalTokens = 0;

for (const group of groups) {
  const buttonA = group.match(ButtonARegex);
  const buttonB = group.match(ButtonBRegex);
  const prize = group.match(PrizeRegex);

  if (!buttonA || !buttonB || !prize) {
    continue;
  }

  const matrix = [
    [Number(buttonA[1]), Number(buttonB[1])],
    [Number(buttonA[2]), Number(buttonB[2])],
  ];

  const vector = [Number(prize[1]), Number(prize[2])];

  const [A, B] = cramerRule(matrix, vector);

  if (Number.isInteger(A) && Number.isInteger(B)) {
    totalTokens += A * TOKEN_A + B * TOKEN_B;
  }
}

console.log(`The answer to part one is ${totalTokens}!`);

const PRIZE_POS_MOD = 10000000000000;
totalTokens = 0;

for (const group of groups) {
  const buttonA = group.match(ButtonARegex);
  const buttonB = group.match(ButtonBRegex);
  const prize = group.match(PrizeRegex);

  if (!buttonA || !buttonB || !prize) {
    continue;
  }

  const matrix = [
    [Number(buttonA[1]), Number(buttonB[1])],
    [Number(buttonA[2]), Number(buttonB[2])],
  ];

  const vector = [
    Number(prize[1]) + PRIZE_POS_MOD,
    Number(prize[2]) + PRIZE_POS_MOD,
  ];

  const [A, B] = cramerRule(matrix, vector);

  if (Number.isInteger(A) && Number.isInteger(B)) {
    totalTokens += A * TOKEN_A + B * TOKEN_B;
  }
}

console.log(`The answer to part two is ${totalTokens}!`);
