import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const grid = input.split("\n").map((line) => line.split("")).filter((line) =>
  line.length > 0
);

type Position = {
  row: number;
  col: number;
};

const WALL = "#";
const START = "S";
const END = "E";

const getNeighbors = (position: Position): Position[] => {
  const { row, col } = position;
  const PossibleNeighbors = [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ];

  return PossibleNeighbors.filter((neighbor) => {
    const row = neighbor.row;
    const col = neighbor.col;
    return row >= 0 && row < grid.length && col >= 0 && col < grid[row].length;
  });
};

let startPosition: Position | undefined = undefined;
let endPosition: Position | undefined = undefined;

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    if (grid[row][col] === START) {
      startPosition = { row, col };
    }
    if (grid[row][col] === END) {
      endPosition = { row, col };
    }
  }
}

const startRace = (cheatSeconds: number, timeToSave: number) => {
  const visited = new Set<string>();
  const path: Position[] = [];
  const queue: Position[] = [startPosition!];

  while (queue.length > 0) {
    const currentPosition = queue.shift()!;
    path.push(currentPosition);

    if (
      currentPosition.row === endPosition!.row &&
      currentPosition.col === endPosition!.col
    ) {
      break;
    }

    const neighbors = getNeighbors(currentPosition);
    visited.add(`${currentPosition.row},${currentPosition.col}`);

    const validNeighbors = neighbors.filter((neighbor) => {
      const row = neighbor.row;
      const col = neighbor.col;
      return grid[row][col] !== WALL && !visited.has(`${row},${col}`);
    });

    queue.push(...validNeighbors);
  }

  let cheats = 0;
  const availableCheats: Record<number, number> = {};

  for (let position = 0; position < path.length - 1; position++) {
    for (
      let nextPosition = position + 1;
      nextPosition < path.length;
      nextPosition++
    ) {
      const { row: currentRow, col: currentCol } = path[position];
      const { row: nextRow, col: nextCol } = path[nextPosition];

      const distance = Math.abs(currentRow - nextRow) +
        Math.abs(currentCol - nextCol);

      if (distance <= cheatSeconds) {
        // We can cheat
        const picosecondsSaved = nextPosition - position - distance;

        if (picosecondsSaved > 0) {
          if (availableCheats[picosecondsSaved] === undefined) {
            availableCheats[picosecondsSaved] = 0;
          }

          availableCheats[picosecondsSaved]++;

          if (picosecondsSaved >= timeToSave) {
            cheats++;
          }
        }
      }
    }
  }

  return {
    cheats,
    availableCheats,
  };
};

const partOne = startRace(2, 100);
console.log(`The answer to part one is ${partOne.cheats}!`);

const partTwo = startRace(20, 100);
console.log(`The answer to part two is ${partTwo.cheats}!`);
