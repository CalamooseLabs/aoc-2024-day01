import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const GRID_SIZE_WIDE = Deno.args[0] === "day14/input.txt" ? 101 : 11;
const GRID_SIZE_TALL = Deno.args[0] === "day14/input.txt" ? 103 : 7;

const grid: string[][][] = Array.from(
  { length: GRID_SIZE_TALL },
  () => Array.from({ length: GRID_SIZE_WIDE }, () => []),
);

const lines = input.split("\n").filter((line) => line.length > 0);

const LINE_REGEX = /p=(\d+),(\d+) v=(\-?\d+),(\-?\d+)/;

interface Position {
  row: number;
  col: number;
}

interface Robot {
  id: string;
  position: Position;
  velocity: Position;
}

const robots: Robot[] = [];

let robotId = 0;
for (const line of lines) {
  const match = line.match(LINE_REGEX);

  if (!match) continue;

  const position: { row: number; col: number } = {
    col: parseInt(match[1]),
    row: parseInt(match[2]),
  };
  const velocity: { row: number; col: number } = {
    col: parseInt(match[3]),
    row: parseInt(match[4]),
  };

  robots.push({
    id: robotId.toString(),
    position,
    velocity,
  });

  grid[position.row][position.col].push(robotId.toString());

  robotId++;
}

const moveRobot = (robot: Robot) => {
  const newPosition = {
    row: robot.position.row + robot.velocity.row,
    col: robot.position.col + robot.velocity.col,
  };

  if (newPosition.row < 0) {
    // Wrap around the grid the velocity is negative
    const wrapAroundRow = GRID_SIZE_TALL +
      (robot.position.row + robot.velocity.row);
    newPosition.row = wrapAroundRow;
  } else if (newPosition.row >= GRID_SIZE_TALL) {
    // Wrap around the grid the velocity is positive
    const wrapAroundRow = robot.velocity.row -
      (GRID_SIZE_TALL - robot.position.row);
    newPosition.row = wrapAroundRow;
  }

  if (newPosition.col < 0) {
    // Wrap around the grid the velocity is negative
    const wrapAroundCol = GRID_SIZE_WIDE +
      (robot.position.col + robot.velocity.col);
    newPosition.col = wrapAroundCol;
  } else if (newPosition.col >= GRID_SIZE_WIDE) {
    // Wrap around the grid the velocity is positive
    const wrapAroundCol = robot.velocity.col -
      (GRID_SIZE_WIDE - robot.position.col);
    newPosition.col = wrapAroundCol;
  }

  grid[robot.position.row][robot.position.col].splice(
    grid[robot.position.row][robot.position.col].indexOf(robot.id),
    1,
  );

  grid[newPosition.row][newPosition.col].push(robot.id);

  robot.position = newPosition;
};

interface Quarter {
  name: string;
  grid: string[][][];
  sum: number;
}

const splitGridIntoQuarters = (grid: string[][][]): Quarter[] => {
  // Ignore the middle row and column
  const middleRow = Math.floor(GRID_SIZE_TALL / 2);
  const middleCol = Math.floor(GRID_SIZE_WIDE / 2);

  const topLeft = grid.slice(0, middleRow).map((row) =>
    row.slice(0, middleCol)
  );
  const topRight = grid.slice(0, middleRow).map((row) =>
    row.slice(middleCol + 1)
  );
  const bottomLeft = grid.slice(middleRow + 1).map((row) =>
    row.slice(0, middleCol)
  );
  const bottomRight = grid.slice(middleRow + 1).map((row) =>
    row.slice(middleCol + 1)
  );

  const quarters: Quarter[] = [
    {
      name: "topLeft",
      grid: topLeft,
      sum: topLeft.reduce(
        (sum, row) => sum + row.reduce((sum, cell) => sum + cell.length, 0),
        0,
      ),
    },
    {
      name: "topRight",
      grid: topRight,
      sum: topRight.reduce(
        (sum, row) => sum + row.reduce((sum, cell) => sum + cell.length, 0),
        0,
      ),
    },
    {
      name: "bottomLeft",
      grid: bottomLeft,
      sum: bottomLeft.reduce(
        (sum, row) => sum + row.reduce((sum, cell) => sum + cell.length, 0),
        0,
      ),
    },
    {
      name: "bottomRight",
      grid: bottomRight,
      sum: bottomRight.reduce(
        (sum, row) => sum + row.reduce((sum, cell) => sum + cell.length, 0),
        0,
      ),
    },
  ];

  return quarters;
};

const checkForPattern = (grid: string[][][]) => {
  // go through each row and column and see if you can find a pattern of 3x3 robots
  for (let row = 1; row < GRID_SIZE_TALL - 2; row++) {
    for (let col = 1; col < GRID_SIZE_WIDE - 2; col++) {
      const checkCells = [
        grid[row][col],
        grid[row][col + 1],
        grid[row][col - 1],
        grid[row + 1][col],
        grid[row + 1][col + 1],
        grid[row + 1][col - 1],
        grid[row - 1][col],
        grid[row - 1][col + 1],
        grid[row - 1][col - 1],
      ];

      if (checkCells.every((cell) => cell.length !== 0)) {
        return true;
      }
    }
  }
  return false;
};

let patternFound = false;
let patternSeconds = -1;
const MAX_SECONDS = 100;

for (let i = 0; i < MAX_SECONDS; i++) {
  for (const robot of robots) {
    moveRobot(robot);
  }

  if (patternFound) continue;

  if (checkForPattern(grid)) {
    patternFound = true;
    patternSeconds = i;
  }
}

const quarters = splitGridIntoQuarters(grid);

let totalProduct = 1;

for (const quarter of quarters) {
  totalProduct *= quarter.sum;
}

console.log(`The answer to part one is ${totalProduct}!`);

let currentSeconds = MAX_SECONDS + 1;
while (!patternFound) {
  for (const robot of robots) {
    moveRobot(robot);
  }

  if (checkForPattern(grid)) {
    patternFound = true;
    patternSeconds = currentSeconds;
  }

  currentSeconds++;
}

console.log(`The answer to part two is ${patternSeconds}!`);

console.log(
  grid.map((row) =>
    row.map((cell) => cell.length > 0 ? cell.length.toString() : ".").join("")
  ).join("\n"),
);
