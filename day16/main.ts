import { getRawFileContent } from "#utils";

const DEBUG = false;

const TURN_COST = 1000;
const MOVE_COST = 1;

const WALL = "#";
const START = "S";
const END = "E";

type Orientation = "N" | "S" | "E" | "W";

type Position = {
  row: number;
  col: number;
  orientation?: Orientation;
};

const input = getRawFileContent();

const grid = input.split("\n").map((row) => row.split(""));

interface Graph {
  [currentPosition: string]: {
    [orientation: string]: { [nextPosition: string]: number };
  };
}

const calculateNumberOfTurns = (
  orientation: Orientation,
  newOrientation: Orientation,
) => {
  let turns = 0;
  let currentOrientation = orientation;

  while (currentOrientation !== newOrientation) {
    currentOrientation = nextOrientation(currentOrientation, true);
    turns++;
  }

  return turns;
};

const calculateCost = (
  grid: string[][],
  position: Position,
  orientation: Orientation,
) => {
  // It needs to check each of the 4 possible orientations and calculate the cost
  const costGraph: { [nextPosition: string]: number } = {};

  const possiblePositions = [
    {
      row: position.row - 1,
      col: position.col,
      turns: calculateNumberOfTurns(orientation, "N"),
      direction: "N",
    }, // Move North
    {
      row: position.row + 1,
      col: position.col,
      turns: calculateNumberOfTurns(orientation, "S"),
      direction: "S",
    }, // Move South
    {
      row: position.row,
      col: position.col + 1,
      turns: calculateNumberOfTurns(orientation, "E"),
      direction: "E",
    }, // Move East
    {
      row: position.row,
      col: position.col - 1,
      turns: calculateNumberOfTurns(orientation, "W"),
      direction: "W",
    }, // Move West
  ];

  for (const possiblePosition of possiblePositions) {
    if (
      possiblePosition.row < 0 || possiblePosition.row >= grid.length ||
      possiblePosition.col < 0 || possiblePosition.col >= grid[0].length
    ) {
      continue;
    }

    if (grid[possiblePosition.row][possiblePosition.col] === WALL) {
      continue;
    }

    costGraph[`${possiblePosition.row};${possiblePosition.col}`] = MOVE_COST +
      possiblePosition.turns * TURN_COST;
  }

  return costGraph;
};

const gridToGraph = (grid: string[][]): Graph => {
  const graph: Graph = {};
  const orientations: Orientation[] = ["N", "S", "E", "W"];

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const gridKey = `${row};${col}`;
      graph[gridKey] = {};

      for (const orientation of orientations) {
        const costGraph = calculateCost(grid, { row, col }, orientation);
        graph[gridKey][orientation] = costGraph;
      }
    }
  }

  return graph;
};

const nextOrientation = (
  currentOrientation: Orientation,
  clockwise: boolean,
): Orientation => {
  if (clockwise) {
    return {
      "N": "E",
      "E": "S",
      "S": "W",
      "W": "N",
    }[currentOrientation] as Orientation;
  } else {
    return {
      "N": "W",
      "W": "S",
      "S": "E",
      "E": "N",
    }[currentOrientation] as Orientation;
  }
};

const startingPositionRow = grid.findIndex((row) => row.includes(START));
const startingPositionCol = grid[startingPositionRow].findIndex((cell) =>
  cell === START
);

const startingPositionKey = `${startingPositionRow};${startingPositionCol}`;

const endingPositionRow = grid.findIndex((row) => row.includes(END));
const endingPositionCol = grid[endingPositionRow].findIndex((cell) =>
  cell === END
);

const endingPositionKey = `${endingPositionRow};${endingPositionCol}`;

const calculatePathCost = (path: string[]) => {
  let cost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    if (path[i] === path[i + 1]) {
      cost += MOVE_COST;
    } else {
      cost += TURN_COST + MOVE_COST;
    }
  }
  return cost;
};

const calculateFirstMoveCost = (row: number, col: number): number => {
  let cost = MOVE_COST;
  // Starts facing east

  if (row > startingPositionRow) { // Move south
    cost += TURN_COST;
  } else if (row < startingPositionRow) { // Move north
    cost += TURN_COST;
  } else if (col < startingPositionCol) { // Move west
    cost += TURN_COST;
  }

  return cost;
};

type PrintPath = {
  row: number;
  col: number;
  orientationChar: string;
  orientation: Orientation;
};

const findAllShortestPaths = (
  graph: Graph,
  startKey: string,
  endKey: string,
  startOrientation: Orientation,
) => {
  const distances: { [key: string]: number } = {};
  const previous: { [key: string]: string[] } = {}; // Changed to store arrays of previous nodes
  const visited = new Set<string>();
  const shortestPaths: PrintPath[][] = [];
  let shortestDistance = Infinity;

  // Initialize distances
  for (const position of Object.keys(graph)) {
    for (const orientation of ["N", "S", "E", "W"] as Orientation[]) {
      distances[`${position}-${orientation}`] = Infinity;
      previous[`${position}-${orientation}`] = [];
    }
  }

  distances[`${startKey}-${startOrientation}`] = 0;

  while (true) {
    // Find the unvisited node with the smallest distance
    let currentNode: string | null = null;
    let smallestDistance = Infinity;

    for (const key of Object.keys(distances)) {
      if (!visited.has(key) && distances[key] < smallestDistance) {
        currentNode = key;
        smallestDistance = distances[key];
      }
    }

    if (currentNode === null) break;

    visited.add(currentNode);
    const [currentPos, currentOrientation] = currentNode.split("-");

    // If we've reached the end position
    if (currentPos === endKey) {
      if (distances[currentNode] <= shortestDistance) {
        shortestDistance = distances[currentNode];
      }
    }

    const [currentRow, currentCol] = currentPos.split(";").map(Number);
    const neighbors = graph[currentPos][currentOrientation as Orientation];

    for (const [neighborPos, cost] of Object.entries(neighbors)) {
      const [neighborRow, neighborCol] = neighborPos.split(";").map(Number);
      let newOrientation = currentOrientation;

      if (neighborRow > currentRow) newOrientation = "S";
      else if (neighborRow < currentRow) newOrientation = "N";
      else if (neighborCol > currentCol) newOrientation = "E";
      else if (neighborCol < currentCol) newOrientation = "W";

      const neighborKey = `${neighborPos}-${newOrientation}`;

      if (!visited.has(neighborKey)) {
        const newDistance = distances[currentNode] + cost;
        if (newDistance < distances[neighborKey]) {
          distances[neighborKey] = newDistance;
          previous[neighborKey] = [currentNode];
        } else if (newDistance === distances[neighborKey]) {
          // If we found an equal-length path, add it to the previous nodes
          previous[neighborKey].push(currentNode);
        }
      }
    }
  }

  // Helper function to reconstruct all paths
  const reconstructPaths = (
    node: string,
    path: PrintPath[] = [],
  ): PrintPath[][] => {
    if (!previous[node] || previous[node].length === 0) {
      return [path];
    }

    const allPaths: PrintPath[][] = [];
    for (const prevNode of previous[node]) {
      const [pos, orientation] = node.split("-");
      const [row, col] = pos.split(";").map(Number);
      const orientationChar = orientation === "N"
        ? "^"
        : orientation === "S"
        ? "v"
        : orientation === "E"
        ? ">"
        : "<";

      const p: PrintPath = {
        row: row,
        col: col,
        orientationChar: orientationChar,
        orientation: orientation as Orientation,
      };

      const newPaths = reconstructPaths(prevNode, [p, ...path]);
      allPaths.push(...newPaths);
    }
    return allPaths;
  };

  // Find all paths that end at the destination with the shortest distance
  for (const key of Object.keys(distances)) {
    const [pos, _orientation] = key.split("-");
    if (pos === endKey && distances[key] === shortestDistance) {
      const paths = reconstructPaths(key);
      shortestPaths.push(...paths);
    }
  }

  const firstMoveCost = calculateFirstMoveCost(
    shortestPaths[0][0].row,
    shortestPaths[0][0].col,
  );

  return {
    distance:
      calculatePathCost(shortestPaths[0].map((p) => p.orientationChar)) +
      firstMoveCost,
    paths: shortestPaths,
  };
};

const result = findAllShortestPaths(
  gridToGraph(grid),
  startingPositionKey,
  endingPositionKey,
  "E",
);

result.paths.forEach((path) => {
  path.forEach((p) => {
    grid[p.row][p.col] = "O";
  });
});

grid[startingPositionRow][startingPositionCol] = "O";

const totalSpaces = grid.reduce(
  (acc, row) => acc + row.filter((cell) => cell === "O").length,
  0,
);

if (DEBUG) {
  console.log(grid.map((row) => row.join("")).join("\n"));
}

console.log(`The answer to part one is ${result.distance}!`);
console.log(`The answer to part two is ${totalSpaces}!`);
