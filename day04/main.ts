import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const lines = input.split("\n");

let wordCount: number = 0;

type Direction = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

const recursiveWordCount = (
  row: number,
  col: number,
  lettersRemaining: string[],
  direction: Direction,
): boolean => {
  if (lettersRemaining.length === 0) {
    wordCount++;
    return true;
  }
  const letter = lettersRemaining[0];

  if (
    row < 0 || col < 0 || row > lines.length - 1 || col > lines[0].length - 1
  ) {
    return false;
  }
  if (lines[row][col] !== letter) {
    return false;
  }

  const rowModifier = direction.includes("N")
    ? -1
    : direction.includes("S")
    ? 1
    : 0;
  const colModifier = direction.includes("W")
    ? -1
    : direction.includes("E")
    ? 1
    : 0;

  // output[row][col] = letter;
  return recursiveWordCount(
    row + rowModifier,
    col + colModifier,
    lettersRemaining.slice(1),
    direction,
  );
};

const wordSearch: string[] = "XMAS".split("");

lines.forEach((line, rowIndex) => {
  const letters = line.split("");
  letters.forEach((letter, colIndex) => {
    if (letter === "X") {
      // check all 8 directions
      // but preserve the direction

      // Northwest diagonal
      recursiveWordCount(rowIndex, colIndex, wordSearch, "NW");

      // North
      recursiveWordCount(rowIndex, colIndex, wordSearch, "N");

      // Northeast diagonal
      recursiveWordCount(rowIndex, colIndex, wordSearch, "NE");

      // West
      recursiveWordCount(rowIndex, colIndex, wordSearch, "W");

      // Southwest diagonal
      recursiveWordCount(rowIndex, colIndex, wordSearch, "SW");

      // South
      recursiveWordCount(rowIndex, colIndex, wordSearch, "S");

      // Southeast diagonal
      recursiveWordCount(rowIndex, colIndex, wordSearch, "SE");

      // East
      recursiveWordCount(rowIndex, colIndex, wordSearch, "E");
    }
  });
});

console.log(`The answer to part one is ${wordCount}!`);

const crosswordSearch: string[] = "MAS".split("");

let crosswordCount = 0;

const usedX: string[][] = [];

lines.forEach((line, rowIndex) => {
  const letters = line.split("");
  letters.forEach((letter, colIndex) => {
    let currentPath: string[] = [];
    if (letter === "M") {
      // check all 4 diagonals
      // but preserve the direction
      currentPath = [];

      // Northwest diagonal
      if (recursiveWordCount(rowIndex, colIndex, crosswordSearch, "NW")) {
        currentPath.push(`${rowIndex},${colIndex}`);
        currentPath.push(`${rowIndex - 1},${colIndex - 1}`);
        currentPath.push(`${rowIndex - 2},${colIndex - 2}`);
        currentPath.push(`${rowIndex - 2},${colIndex}`);
        currentPath.push(`${rowIndex},${colIndex - 2}`);

        /*
        S..
        .A.
        ..M
        */

        if (
          recursiveWordCount(rowIndex, colIndex - 2, crosswordSearch, "NE") ||
          recursiveWordCount(rowIndex - 2, colIndex, crosswordSearch, "SW")
        ) {
          if (
            !usedX.some((path) =>
              path.every((coord) => currentPath.includes(coord))
            )
          ) {
            usedX.push(currentPath);
            crosswordCount++;
          }
        }
      }

      currentPath = [];

      // Northeast diagonal
      if (recursiveWordCount(rowIndex, colIndex, crosswordSearch, "NE")) {
        /*
        ..S
        .A.
        M..
        */
        // From M, its +2 col, and -2 row
        currentPath.push(`${rowIndex},${colIndex}`);
        currentPath.push(`${rowIndex - 1},${colIndex + 1}`);
        currentPath.push(`${rowIndex - 2},${colIndex + 2}`);
        currentPath.push(`${rowIndex - 2},${colIndex}`);
        currentPath.push(`${rowIndex},${colIndex + 2}`);

        if (
          recursiveWordCount(rowIndex - 2, colIndex, crosswordSearch, "SE") ||
          recursiveWordCount(rowIndex, colIndex + 2, crosswordSearch, "NW")
        ) {
          if (
            !usedX.some((path) =>
              path.every((coord) => currentPath.includes(coord))
            )
          ) {
            usedX.push(currentPath);
            crosswordCount++;
          }
        }
      }

      currentPath = [];

      // Southwest diagonal
      if (recursiveWordCount(rowIndex, colIndex, crosswordSearch, "SW")) {
        /*
        ..M
        .A.
        S..
        */
        // From M, its +2 col, and + 2 row
        currentPath.push(`${rowIndex},${colIndex}`);
        currentPath.push(`${rowIndex + 1},${colIndex - 1}`);
        currentPath.push(`${rowIndex + 2},${colIndex - 2}`);
        currentPath.push(`${rowIndex + 2},${colIndex}`);
        currentPath.push(`${rowIndex},${colIndex - 2}`);

        if (
          recursiveWordCount(rowIndex + 2, colIndex, crosswordSearch, "NW") ||
          recursiveWordCount(rowIndex, colIndex - 2, crosswordSearch, "SE")
        ) {
          if (
            !usedX.some((path) =>
              path.every((coord) => currentPath.includes(coord))
            )
          ) {
            usedX.push(currentPath);
            crosswordCount++;
          }
        }
      }

      currentPath = [];

      // Southeast diagonal
      if (recursiveWordCount(rowIndex, colIndex, crosswordSearch, "SE")) {
        /*
        M..
        .A.
        ..S
        */
        // From M, its -2 col, and +2 row
        currentPath.push(`${rowIndex},${colIndex}`);
        currentPath.push(`${rowIndex + 1},${colIndex + 1}`);
        currentPath.push(`${rowIndex + 2},${colIndex + 2}`);
        currentPath.push(`${rowIndex + 2},${colIndex}`);
        currentPath.push(`${rowIndex},${colIndex + 2}`);

        if (
          recursiveWordCount(rowIndex, colIndex + 2, crosswordSearch, "SW") ||
          recursiveWordCount(rowIndex + 2, colIndex, crosswordSearch, "NE")
        ) {
          if (
            !usedX.some((path) =>
              path.every((coord) => currentPath.includes(coord))
            )
          ) {
            usedX.push(currentPath);
            crosswordCount++;
          }
        }
      }
    }
  });
});

console.log(`The answer to part two is ${crosswordCount}!`);
