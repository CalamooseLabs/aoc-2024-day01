import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const lines: string[][] = input
  .split("\n")
  .filter((line) => line.length > 0)
  .map((line) => line.split(""));

const originalGrid = lines.map((line) => [...line]);

type Direction = "^" | "v" | ">" | "<";
const NORTH_FACE: Direction = "^";
const SOUTH_FACE: Direction = "v";
const EAST_FACE: Direction = ">";
const WEST_FACE: Direction = "<";

const BARRIER = "#";
const PATH = "X";
const BLANK = ".";

// Find the starting position
let startingPosition: [number, number] = [0, 0];
const startingDirection: Direction = NORTH_FACE;

for (let row = 0; row < lines.length; row++) {
  for (let col = 0; col < lines[row].length; col++) {
    if (lines[row][col] === NORTH_FACE) {
      startingPosition = [row, col];
      break;
    }
  }
}

let guardRouteComplete: boolean = false; // Flip this variable to do part one or part two, saves time
let currentPosition: [number, number] = startingPosition;
let currentDirection: Direction = startingDirection;
let pathCount: number = 0;

while (!guardRouteComplete) {
  const [row, col] = currentPosition;

  let rowIncrement = currentDirection === NORTH_FACE
    ? -1
    : currentDirection === SOUTH_FACE
    ? 1
    : 0;
  let colIncrement = currentDirection === EAST_FACE
    ? 1
    : currentDirection === WEST_FACE
    ? -1
    : 0;

  // Check if current position is out of bounds
  if (row < 0 || row >= lines.length || col < 0 || col >= lines[row].length) {
    // Return the count of PATHs in lines
    pathCount = lines.flat().filter((cell) => cell === PATH).length;
    guardRouteComplete = true;
    break;
  }

  // Check if the current position is a barrier
  if (lines[row][col] === BARRIER) {
    // then if so we need to back track and turn right 90 degrees
    const newDirection: Direction = currentDirection === NORTH_FACE
      ? EAST_FACE
      : currentDirection === EAST_FACE
      ? SOUTH_FACE
      : currentDirection === SOUTH_FACE
      ? WEST_FACE
      : NORTH_FACE;

    // Flip the sign of the increment and then check the new Direction
    rowIncrement = -rowIncrement;
    colIncrement = -colIncrement;

    rowIncrement = newDirection === NORTH_FACE
      ? -1
      : newDirection === SOUTH_FACE
      ? 1
      : rowIncrement;
    colIncrement = newDirection === EAST_FACE
      ? 1
      : newDirection === WEST_FACE
      ? -1
      : colIncrement;

    currentDirection = newDirection;
  } else {
    lines[row][col] = PATH;
  }

  currentPosition = [row + rowIncrement, col + colIncrement];
}

// const result = traverseMap(startingPosition, startingDirection);
console.log(`The answer to part one is ${pathCount}!`);

const switchDirection = (direction: Direction): Direction => {
  return direction === NORTH_FACE
    ? EAST_FACE
    : direction === EAST_FACE
    ? SOUTH_FACE
    : direction === SOUTH_FACE
    ? WEST_FACE
    : NORTH_FACE;
};

const getColIncrement = (
  direction: Direction,
  defaultIncrement: number = 0,
): number => {
  return direction === EAST_FACE
    ? 1
    : direction === WEST_FACE
    ? -1
    : defaultIncrement;
};

const getRowIncrement = (
  direction: Direction,
  defaultIncrement: number = 0,
): number => {
  return direction === NORTH_FACE
    ? -1
    : direction === SOUTH_FACE
    ? 1
    : defaultIncrement;
};

let loopCount = 0;

const testMovements = (grid: string[][]): boolean => {
  const path = new Set<string>();
  let currentPosition: [number, number] = startingPosition;
  let currentDirection: Direction = startingDirection;

  while (true) {
    const [row, col] = currentPosition;
    const breadcrumb = `${row},${col},${currentDirection}`;
    let rowIncrement = getRowIncrement(currentDirection);
    let colIncrement = getColIncrement(currentDirection);

    // Check if current position is out of bounds
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[row].length) {
      return false;
    }

    if (path.has(breadcrumb)) {
      return true;
    }
    path.add(breadcrumb);

    // Check if the current position is a barrier
    if (grid[row][col] === BARRIER) {
      // then if so we need to back track and turn right 90 degrees
      const newDirection: Direction = switchDirection(currentDirection);

      // Flip the sign of the increment and then check the new Direction
      rowIncrement = -rowIncrement;
      colIncrement = -colIncrement;

      rowIncrement = getRowIncrement(newDirection, rowIncrement);
      colIncrement = getColIncrement(newDirection, colIncrement);

      currentDirection = newDirection;
    } else {
      grid[row][col] = PATH;
    }

    currentPosition = [row + rowIncrement, col + colIncrement];
  }
};

for (let row = 0; row < lines.length; row++) {
  for (let col = 0; col < lines[row].length; col++) {
    if (
      lines[row][col] !== BLANK ||
      (row === startingPosition[0] && col === startingPosition[1])
    ) {
      continue;
    }
    const testGrid = originalGrid.map((line) => [...line]);
    testGrid[row][col] = BARRIER;
    if (testMovements(testGrid)) {
      loopCount++;
    }
  }
}

console.log(`The answer to part two is ${loopCount}!`);
