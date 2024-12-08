import { getRawFileContent } from "#utils";

const input = getRawFileContent();

let grid: string[][] = input.split("\n").filter((line) =>
  line.trim() !== "" && line.length > 0
).map((line) => line.split(""));

const gridCopy: string[][] = grid.map((row) => row.slice());

type Coordinates = {
  row: number;
  col: number;
};

const letterCoordinates: Record<string, Coordinates[]> = {};

const getCombinations = (
  coordinates: Coordinates[],
): [Coordinates, Coordinates][] => {
  const combinations: [Coordinates, Coordinates][] = [];

  for (let i = 0; i < coordinates.length; i++) {
    for (let j = i + 1; j < coordinates.length; j++) {
      combinations.push([coordinates[i], coordinates[j]]);
    }
  }

  return combinations;
};

const getAntinodeCount = (combination: [Coordinates, Coordinates]): number => {
  let count = 0;

  const dRow = combination[1].row - combination[0].row;
  const dCol = combination[1].col - combination[0].col;

  const leftAntinodeRow = combination[0].row - dRow;
  const leftAntinodeCol = combination[0].col - dCol;

  const rightAntinodeRow = combination[1].row + dRow;
  const rightAntinodeCol = combination[1].col + dCol;

  if (
    leftAntinodeRow >= 0 && leftAntinodeCol >= 0 &&
    leftAntinodeRow < grid.length && leftAntinodeCol < grid[0].length
  ) {
    if (grid[leftAntinodeRow][leftAntinodeCol] !== "#") {
      if (grid[leftAntinodeRow][leftAntinodeCol] === ".") {
        grid[leftAntinodeRow][leftAntinodeCol] = "#";
      }
      count++;
    }
  }

  if (
    rightAntinodeRow >= 0 && rightAntinodeCol >= 0 &&
    rightAntinodeRow < grid.length && rightAntinodeCol < grid[0].length
  ) {
    if (grid[rightAntinodeRow][rightAntinodeCol] !== "#") {
      if (grid[rightAntinodeRow][rightAntinodeCol] === ".") {
        grid[rightAntinodeRow][rightAntinodeCol] = "#";
      }
      count++;
    }
  }

  return count;
};

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    const letter = grid[row][col];

    if (letter !== ".") {
      if (!letterCoordinates[letter]) {
        letterCoordinates[letter] = [];
      }

      letterCoordinates[letter].push({ row, col });
    }
  }
}

let totalAntinodeCount = 0;

for (const letter in letterCoordinates) {
  const combinations = getCombinations(letterCoordinates[letter]);
  for (const combination of combinations) {
    const antinodeCount = getAntinodeCount(combination);
    totalAntinodeCount += antinodeCount;
  }
}

console.log(`The answer to part one is ${totalAntinodeCount}!`);

// Reset grid
grid = gridCopy;

const getResonantFrequency = (
  combination: [Coordinates, Coordinates],
): number => {
  let count = 0;

  const dRow = combination[1].row - combination[0].row;
  const dCol = combination[1].col - combination[0].col;

  let leftAntinodeRow = combination[0].row - dRow;
  let leftAntinodeCol = combination[0].col - dCol;
  let leftIsInGrid = true;

  while (leftIsInGrid) {
    if (
      leftAntinodeRow >= 0 && leftAntinodeCol >= 0 &&
      leftAntinodeRow < grid.length && leftAntinodeCol < grid[0].length
    ) {
      if (grid[leftAntinodeRow][leftAntinodeCol] === ".") {
        grid[leftAntinodeRow][leftAntinodeCol] = "#";
        count++;
      }
    } else {
      leftIsInGrid = false;
    }

    leftAntinodeRow -= dRow;
    leftAntinodeCol -= dCol;
  }

  let rightAntinodeRow = combination[1].row + dRow;
  let rightAntinodeCol = combination[1].col + dCol;
  let rightIsInGrid = true;

  while (rightIsInGrid) {
    if (
      rightAntinodeRow >= 0 && rightAntinodeCol >= 0 &&
      rightAntinodeRow < grid.length && rightAntinodeCol < grid[0].length
    ) {
      if (grid[rightAntinodeRow][rightAntinodeCol] === ".") {
        grid[rightAntinodeRow][rightAntinodeCol] = "#";
        count++;
      }
    } else {
      rightIsInGrid = false;
    }

    rightAntinodeRow += dRow;
    rightAntinodeCol += dCol;
  }

  return count;
};

// Need to count the number of letters in the grid
let totalResonantFrequency = grid.flat().filter((cell) => cell !== ".").length;

for (const letter in letterCoordinates) {
  const combinations = getCombinations(letterCoordinates[letter]);
  for (const combination of combinations) {
    const resonantFrequency = getResonantFrequency(combination);
    totalResonantFrequency += resonantFrequency;
  }
}

console.log(`The answer to part two is ${totalResonantFrequency}!`);
