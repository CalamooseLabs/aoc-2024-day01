import { getRawFileContent } from "#utils";

type Position = {
  row: number;
  col: number;
};
type Direction = "^" | "v" | "<" | ">";
type Wall = "#";
type Open = ".";
type Robot = {
  position: Position;
};
type Box = "O";

const input = getRawFileContent();

const originalGrid: string[][] = [];
const moves: Direction[] = [];

const WALL = "#";
const OPEN = ".";
const ROBOT = "@";
const BOX = "O";

const lines = input.split("\n");

for (const line of lines) {
  if (line.length === 0) continue;

  if (line[0] === "#") {
    originalGrid.push(line.split(""));
  } else {
    moves.push(...(line.split("") as Direction[]));
  }
}

const grid = originalGrid.map((row) => [...row]);

const StartingRow = grid.findIndex((row) => row.includes(ROBOT));
const StartingCol = grid[StartingRow].findIndex((cell) => cell === ROBOT);

const Robot: Robot = {
  position: { row: StartingRow, col: StartingCol },
};

const checkBoxMove = (position: Position, direction: Direction): boolean => {
  const rowModifier = direction === "^" ? -1 : direction === "v" ? 1 : 0;
  const colModifier = direction === "<" ? -1 : direction === ">" ? 1 : 0;

  const newPosition = {
    row: position.row + rowModifier,
    col: position.col + colModifier,
  };

  if (newPosition.row < 0 || newPosition.row >= grid.length) return false;
  if (newPosition.col < 0 || newPosition.col >= grid[newPosition.row].length) {
    return false;
  }

  if (grid[newPosition.row][newPosition.col] === WALL) return false;

  if (grid[newPosition.row][newPosition.col] === BOX) {
    if (checkBoxMove(newPosition, direction)) {
      grid[newPosition.row][newPosition.col] = BOX;
      return true;
    }
  } else if (grid[newPosition.row][newPosition.col] === OPEN) {
    grid[newPosition.row][newPosition.col] = BOX;
    return true;
  }
};

const moveRobot = (direction: Direction) => {
  const rowModifier = direction === "^" ? -1 : direction === "v" ? 1 : 0;
  const colModifier = direction === "<" ? -1 : direction === ">" ? 1 : 0;

  const newPosition = {
    row: Robot.position.row + rowModifier,
    col: Robot.position.col + colModifier,
  };

  if (newPosition.row < 0 || newPosition.row >= grid.length) return;
  if (newPosition.col < 0 || newPosition.col >= grid[newPosition.row].length) {
    return;
  }
  if (grid[newPosition.row][newPosition.col] === WALL) return;

  if (grid[newPosition.row][newPosition.col] === BOX) {
    if (checkBoxMove(newPosition, direction)) {
      grid[newPosition.row][newPosition.col] = ROBOT;
      grid[Robot.position.row][Robot.position.col] = OPEN;
      Robot.position = newPosition;
      return true;
    }
  } else if (grid[newPosition.row][newPosition.col] === OPEN) {
    grid[newPosition.row][newPosition.col] = ROBOT;
    grid[Robot.position.row][Robot.position.col] = OPEN;
    Robot.position = newPosition;
    return true;
  }

  return false;
};

const calculateBoxesGPS = (): number => {
  let GPSSum = 0;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === BOX) {
        GPSSum += 100 * row + col;
      }
    }
  }

  return GPSSum;
};

for (const move of moves) {
  moveRobot(move);
}

console.log(`The answer to part one is ${calculateBoxesGPS()}!`);

const WIDE_WALL = "##";
const WIDE_OPEN = "..";
const WIDE_ROBOT = "@.";
const BOX_LEFT = "[";
const BOX_RIGHT = "]";
const WIDE_BOX = `${BOX_LEFT}${BOX_RIGHT}`;

type BOX_WIDE = {
  leftSide: {
    position: Position;
  };
  rightSide: {
    position: Position;
  };
};

const widenGrid = (grid: string[][]): string[][] => {
  const wideGrid: string[][] = [];

  for (let row = 0; row < grid.length; row++) {
    wideGrid.push([]);
    for (let col = 0; col < grid[row].length; col++) {
      switch (grid[row][col]) {
        case WALL:
          wideGrid[row].push(...WIDE_WALL.split(""));
          break;
        case OPEN:
          wideGrid[row].push(...WIDE_OPEN.split(""));
          break;
        case ROBOT:
          wideGrid[row].push(...WIDE_ROBOT.split(""));
          break;
        case BOX:
          wideGrid[row].push(...WIDE_BOX.split(""));
          break;
      }
    }
  }

  return wideGrid;
};

const wideGrid = widenGrid(originalGrid);

const checkBoxMoveWide = (
  position: Position,
  direction: Direction,
): boolean => {
  const rowModifier = direction === "^" ? -1 : direction === "v" ? 1 : 0;
  const colModifier = direction === "<" ? -1 : direction === ">" ? 1 : 0;

  const boxSide = wideGrid[position.row][position.col];

  let currentBox: BOX_WIDE | null = null;

  if (boxSide === BOX_LEFT) {
    currentBox = {
      leftSide: {
        position: {
          row: position.row,
          col: position.col,
        },
      },
      rightSide: {
        position: {
          row: position.row,
          col: position.col + 1,
        },
      },
    };
  } else {
    currentBox = {
      leftSide: {
        position: {
          row: position.row,
          col: position.col - 1,
        },
      },
      rightSide: {
        position: {
          row: position.row,
          col: position.col,
        },
      },
    };
  }

  if (currentBox === null) return false;

  const newBox: BOX_WIDE = {
    leftSide: {
      position: {
        row: currentBox.leftSide.position.row + rowModifier,
        col: currentBox.leftSide.position.col + colModifier,
      },
    },
    rightSide: {
      position: {
        row: currentBox.rightSide.position.row + rowModifier,
        col: currentBox.rightSide.position.col + colModifier,
      },
    },
  };

  if (
    newBox.leftSide.position.row < 0 ||
    newBox.leftSide.position.row >= wideGrid.length
  ) return false;
  if (
    newBox.leftSide.position.col < 0 ||
    newBox.leftSide.position.col >=
      wideGrid[newBox.leftSide.position.row].length
  ) return false;
  if (
    newBox.rightSide.position.row < 0 ||
    newBox.rightSide.position.row >= wideGrid.length
  ) return false;
  if (
    newBox.rightSide.position.col < 0 ||
    newBox.rightSide.position.col >=
      wideGrid[newBox.rightSide.position.row].length
  ) return false;

  if (
    wideGrid[newBox.leftSide.position.row][newBox.leftSide.position.col] ===
      WALL
  ) return false;
  if (
    wideGrid[newBox.rightSide.position.row][newBox.rightSide.position.col] ===
      WALL
  ) return false;

  const checkLeft: boolean =
    direction === "^" || direction === "v" || direction === "<" ? true : false;
  const checkRight: boolean =
    direction === "^" || direction === "v" || direction === ">" ? true : false;
  let preventBreak = false;
  let canMove = false;

  if (checkLeft) {
    if (
      wideGrid[newBox.leftSide.position.row][newBox.leftSide.position.col] ===
        BOX_LEFT ||
      wideGrid[newBox.leftSide.position.row][newBox.leftSide.position.col] ===
        BOX_RIGHT
    ) {
      canMove = checkBoxMoveWide(newBox.leftSide.position, direction);
      preventBreak = !canMove;
    } else if (
      wideGrid[newBox.leftSide.position.row][newBox.leftSide.position.col] ===
        OPEN
    ) {
      canMove = true;
    }
  }

  if (checkRight && !preventBreak) {
    if (
      wideGrid[newBox.rightSide.position.row][newBox.rightSide.position.col] ===
        BOX_LEFT ||
      wideGrid[newBox.rightSide.position.row][newBox.rightSide.position.col] ===
        BOX_RIGHT
    ) {
      canMove = checkBoxMoveWide(newBox.rightSide.position, direction);
    } else if (
      wideGrid[newBox.rightSide.position.row][newBox.rightSide.position.col] ===
        OPEN
    ) {
      canMove = true;
    }
  }

  if (canMove) {
    wideGrid[currentBox.leftSide.position.row][
      currentBox.leftSide.position.col
    ] = OPEN;
    wideGrid[currentBox.rightSide.position.row][
      currentBox.rightSide.position.col
    ] = OPEN;
    wideGrid[newBox.leftSide.position.row][newBox.leftSide.position.col] =
      BOX_LEFT;
    wideGrid[newBox.rightSide.position.row][newBox.rightSide.position.col] =
      BOX_RIGHT;
  }

  return canMove;
};

const StartingRowWide = wideGrid.findIndex((row) => row.includes(ROBOT));
const StartingColWide = wideGrid[StartingRowWide].findIndex((cell) =>
  cell === ROBOT
);

const RobotWide: Robot = {
  position: { row: StartingRowWide, col: StartingColWide },
};

const moveRobotWide = (direction: Direction) => {
  const rowModifier = direction === "^" ? -1 : direction === "v" ? 1 : 0;
  const colModifier = direction === "<" ? -1 : direction === ">" ? 1 : 0;

  const newPosition = {
    row: RobotWide.position.row + rowModifier,
    col: RobotWide.position.col + colModifier,
  };

  if (newPosition.row < 0 || newPosition.row >= wideGrid.length) return;
  if (
    newPosition.col < 0 || newPosition.col >= wideGrid[newPosition.row].length
  ) return;
  if (wideGrid[newPosition.row][newPosition.col] === WALL) return;

  if (
    wideGrid[newPosition.row][newPosition.col] === BOX_LEFT ||
    wideGrid[newPosition.row][newPosition.col] === BOX_RIGHT
  ) {
    if (checkBoxMoveWide(newPosition, direction)) {
      wideGrid[newPosition.row][newPosition.col] = ROBOT;
      wideGrid[RobotWide.position.row][RobotWide.position.col] = OPEN;
      RobotWide.position = newPosition;
      return true;
    }
  } else if (wideGrid[newPosition.row][newPosition.col] === OPEN) {
    wideGrid[newPosition.row][newPosition.col] = ROBOT;
    wideGrid[RobotWide.position.row][RobotWide.position.col] = OPEN;
    RobotWide.position = newPosition;
    return true;
  }

  return false;
};

const calculateBoxesGPSWide = (): number => {
  let GPSSum = 0;

  for (let row = 0; row < wideGrid.length; row++) {
    for (let col = 0; col < wideGrid[row].length; col++) {
      if (wideGrid[row][col] === BOX_LEFT) {
        GPSSum += 100 * row + col;
      }
    }
  }

  return GPSSum;
};

for (const move of moves) {
  moveRobotWide(move);
}

// between 1529621 and 1514113
// 1523249
console.log(wideGrid.map((row) => row.join("")).join("\n"));
console.log(`The answer to part two is ${calculateBoxesGPSWide()}!`);
