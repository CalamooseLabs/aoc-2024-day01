import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const DIMENSIONS = Deno.args[0] === "day18/input.txt" ? 71 : 7;
const BYTES_TO_SIMULATE = Deno.args[0] === "day18/input.txt" ? 1024 : 12;

const lines = input.split("\n").filter((line) => line.length > 0).map((line) =>
  line.split(",").map(Number)
);

const grid = Array.from(
  { length: DIMENSIONS },
  (_) => Array.from({ length: DIMENSIONS }, (_) => "."),
);

const START: Point = [0, 0];
const FINISH: Point = [DIMENSIONS - 1, DIMENSIONS - 1];

const WALL = "#";
const OPEN = ".";

for (let byte = 0; byte < BYTES_TO_SIMULATE; byte++) {
  const [col, row] = lines[byte];
  grid[row][col] = WALL;
}

type Point = [number, number];

const bfs = (grid: string[][], start: Point, target: Point): number => {
  const rows = grid.length;
  const cols = grid[0].length;

  const directions: Point[] = [
    [-1, 0], // Up
    [1, 0], // Down
    [0, -1], // Left
    [0, 1], // Right
  ];

  const visited = new Set<string>();
  const queue: Point[] = [start];
  const parentMap: Map<string, Point | null> = new Map();
  parentMap.set(`${start[0]},${start[1]}`, null);

  const pointToString = (point: Point) => `${point[0]},${point[1]}`;

  while (queue.length > 0) {
    const [currentX, currentY] = queue.shift()!;

    // Check if we've reached the target
    if (currentX === target[0] && currentY === target[1]) {
      // Reconstruct the path from the parent map
      const path: Point[] = [];
      let current: Point | null = target;

      while (current) {
        path.unshift(current);
        current = parentMap.get(pointToString(current)) || null;
      }

      return path.length - 1;
    }

    // Mark as visited
    const currentKey = pointToString([currentX, currentY]);
    if (!visited.has(currentKey)) {
      visited.add(currentKey);

      // Explore neighbors
      for (const [dx, dy] of directions) {
        const neighborX = currentX + dx;
        const neighborY = currentY + dy;

        // Check bounds and if the cell is valid (e.g., not an obstacle)
        if (
          neighborX >= 0 &&
          neighborX < rows &&
          neighborY >= 0 &&
          neighborY < cols &&
          !visited.has(pointToString([neighborX, neighborY])) &&
          grid[neighborX][neighborY] === OPEN
        ) {
          queue.push([neighborX, neighborY]);
          parentMap.set(pointToString([neighborX, neighborY]), [
            currentX,
            currentY,
          ]);
        }
      }
    }
  }

  return -1;
};

let stepCount = bfs(grid, START, FINISH);
console.log(`The answer to part one is ${stepCount}!`);

let byte = BYTES_TO_SIMULATE - 1;
while (stepCount !== -1) {
  byte++;
  const [col, row] = lines[byte];
  grid[row][col] = WALL;
  stepCount = bfs(grid, START, FINISH);
}

console.log(`The answer to part two is ${lines[byte]}!`);
