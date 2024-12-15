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

const checkBoxMove = (position: Position, direction: Direction) => {
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

interface Updates {
  [key: string]: {
    position: Position;
    newIcon: string;
  };
}

let gridToUpdate: Updates = {};

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
  let canMove = false;

  if (checkLeft && checkRight) {
    // Its up and down

    const leftBox =
      wideGrid[newBox.leftSide.position.row][newBox.leftSide.position.col];
    const rightBox =
      wideGrid[newBox.rightSide.position.row][newBox.rightSide.position.col];

    const isLeftBox = leftBox === BOX_LEFT || leftBox === BOX_RIGHT;
    const isRightBox = rightBox === BOX_LEFT || rightBox === BOX_RIGHT;
    const isLeftOpen = leftBox === OPEN;
    const isRightOpen = rightBox === OPEN;

    // Situations are the following:
    // 1. Left is a box and right is a box
    // 2. Left is a box and right is open
    // 3. Left is open and right is a box
    // 4. Left is open and right is open
    if (isLeftBox && isRightBox) {
      const isSameBox = leftBox === BOX_LEFT && rightBox === BOX_RIGHT;

      if (isSameBox) {
        canMove = checkBoxMoveWide(newBox.leftSide.position, direction);
      } else {
        canMove =
          checkBoxMoveWide(newBox.leftSide.position, direction) &&
          checkBoxMoveWide(newBox.rightSide.position, direction);
      }
    } else if (isLeftBox && isRightOpen) {
      canMove = checkBoxMoveWide(newBox.leftSide.position, direction);
    } else if (isLeftOpen && isRightBox) {
      canMove = checkBoxMoveWide(newBox.rightSide.position, direction);
    } else if (isLeftOpen && isRightOpen) {
      canMove = true;
    }
  } else if (checkLeft) {
    const leftBox =
      wideGrid[newBox.leftSide.position.row][newBox.leftSide.position.col];

    if (
      leftBox === BOX_RIGHT
    ) {
      canMove = checkBoxMoveWide(newBox.leftSide.position, direction);
    } else if (leftBox === OPEN) {
      canMove = true;
    }
  } else if (checkRight) {
    const rightBox =
      wideGrid[newBox.rightSide.position.row][newBox.rightSide.position.col];

    if (rightBox === BOX_LEFT) {
      canMove = checkBoxMoveWide(newBox.rightSide.position, direction);
    } else if (rightBox === OPEN) {
      canMove = true;
    }
  }

  if (canMove) {
    let gridKey = `${currentBox.leftSide.position.row}-${currentBox.leftSide.position.col}`;

    if (gridToUpdate[gridKey] === undefined) {
      gridToUpdate[gridKey] = {
        position: currentBox.leftSide.position,
        newIcon: OPEN,
      };
    }

    gridKey = `${currentBox.rightSide.position.row}-${currentBox.rightSide.position.col}`;
    if (gridToUpdate[gridKey] === undefined) {
      gridToUpdate[gridKey] = {
        position: currentBox.rightSide.position,
        newIcon: OPEN,
      };
    }

    gridKey = `${newBox.leftSide.position.row}-${newBox.leftSide.position.col}`;
    gridToUpdate[gridKey] = {
      position: newBox.leftSide.position,
      newIcon: BOX_LEFT,
    };

    gridKey = `${newBox.rightSide.position.row}-${newBox.rightSide.position.col}`;
    gridToUpdate[gridKey] = {
      position: newBox.rightSide.position,
      newIcon: BOX_RIGHT,
    };
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

const moveRobotWide = (direction: Direction): boolean => {
  const rowModifier = direction === "^" ? -1 : direction === "v" ? 1 : 0;
  const colModifier = direction === "<" ? -1 : direction === ">" ? 1 : 0;

  const newPosition = {
    row: RobotWide.position.row + rowModifier,
    col: RobotWide.position.col + colModifier,
  };

  if (newPosition.row < 0 || newPosition.row >= wideGrid.length) return false;
  if (
    newPosition.col < 0 || newPosition.col >= wideGrid[newPosition.row].length
  ) return false;
  if (wideGrid[newPosition.row][newPosition.col] === WALL) return false;

  if (
    wideGrid[newPosition.row][newPosition.col] === BOX_LEFT ||
    wideGrid[newPosition.row][newPosition.col] === BOX_RIGHT
  ) {
    if (checkBoxMoveWide(newPosition, direction)) {
      let gridKey = `${newPosition.row}-${newPosition.col}`;

      gridToUpdate[gridKey] = {
        position: newPosition,
        newIcon: ROBOT,
      };

      gridKey = `${RobotWide.position.row}-${RobotWide.position.col}`;
      if (gridToUpdate[gridKey] === undefined) {
        gridToUpdate[gridKey] = {
          position: RobotWide.position,
          newIcon: OPEN,
        };
      }

      return true;
    }
  } else if (wideGrid[newPosition.row][newPosition.col] === OPEN) {
    let gridKey = `${newPosition.row}-${newPosition.col}`;

    gridToUpdate[gridKey] = {
      position: newPosition,
      newIcon: ROBOT,
    };

    gridKey = `${RobotWide.position.row}-${RobotWide.position.col}`;
    if (gridToUpdate[gridKey] === undefined) {
      gridToUpdate[gridKey] = {
        position: RobotWide.position,
        newIcon: OPEN,
      };
    }

    return true;
  }

  return false;
};

const updateWideGrid = () => {
  for (const update of Object.values(gridToUpdate)) {
    wideGrid[update.position.row][update.position.col] = update.newIcon;
  }
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

const DEBUG = false;

if (DEBUG) {
  console.log("--------------------------------");
  console.log("Initial Grid");
  console.log(wideGrid.map((row) => row.join("")).join("\n"));
  console.log("--------------------------------");

  console.log();
}

for (const move of moves) {
  gridToUpdate = {};
  const toUpdate = moveRobotWide(move);

  if (toUpdate) {
    const rowModifier = move === "^" ? -1 : move === "v" ? 1 : 0;
    const colModifier = move === "<" ? -1 : move === ">" ? 1 : 0;

    updateWideGrid();
    RobotWide.position = {
      row: RobotWide.position.row + rowModifier,
      col: RobotWide.position.col + colModifier,
    };
  }

  if (DEBUG) {
  console.log("--------------------------------");
  console.log(`Move ${move}`);
  console.log(wideGrid.map((row) => row.join("")).join("\n"));
  console.log("--------------------------------");
    console.log();
  }
}

// 1521453
// console.log(wideGrid.map((row) => row.join("")).join("\n"));
console.log(`The answer to part two is ${calculateBoxesGPSWide()}!`);
