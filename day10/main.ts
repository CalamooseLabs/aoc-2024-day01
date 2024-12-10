import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const grid = input.split("\n").map((line) => line.split("").map(Number));

const TRAILHEAD: number = 0;
const APEX: number = 9;

const TRAILHEADS: { row: number; col: number }[] = [];

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    if (grid[row][col] === TRAILHEAD) {
      TRAILHEADS.push({ row, col });
    }
  }
}

const visited = new Set<string>();
let APEX_COUNT = 0;
let TRAILHEAD_RATING = 0;

const goHiking = (position: { row: number; col: number }) => {
  const { row, col } = position;

  const currentHeight = grid[row][col];

  if (currentHeight === APEX) {
    TRAILHEAD_RATING++;
    if (visited.has(`${row},${col}`)) {
      return false;
    }

    APEX_COUNT++;
    visited.add(`${row},${col}`);
    return true;
  }

  const nextPositions = [
    { row: row - 1, col }, // up
    { row: row + 1, col }, // down
    { row, col: col - 1 }, // left
    { row, col: col + 1 }, // right
  ];

  for (const nextPosition of nextPositions) {
    const { row: nextRow, col: nextCol } = nextPosition;

    if (
      nextRow < 0 || nextRow >= grid.length || nextCol < 0 ||
      nextCol >= grid[nextRow].length
    ) {
      continue;
    }

    const nextHeight = grid[nextRow][nextCol];

    if (nextHeight === currentHeight + 1) {
      goHiking(nextPosition);
    }
  }
};

for (const trailhead of TRAILHEADS) {
  visited.clear();
  goHiking(trailhead);
}

console.log(`Answer to part one is ${APEX_COUNT}!`);
console.log(`Answer to part two is ${TRAILHEAD_RATING}!`);
