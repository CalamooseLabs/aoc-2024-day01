import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const lines = input.trim().split("\n").map((line) => line.split("")).filter((
  line,
) => line.length > 0);

interface Point {
  row: number;
  col: number;
}

interface Region {
  perimeter: number;
  area: number;
  cells: Point[];
  plant: string;
}

const visited: Map<string, boolean> = new Map();
const regions: Region[] = [];

const defineRegion = (point: Point, plant: string, regionIndex: number) => {
  const key = `${point.row},${point.col}`;
  if (visited.has(key)) {
    return;
  }
  visited.set(key, true);

  regions[regionIndex].area++;
  regions[regionIndex].cells.push(point);

  const nextPoints = [
    { row: point.row - 1, col: point.col }, // North
    { row: point.row + 1, col: point.col }, // South
    { row: point.row, col: point.col - 1 }, // West
    { row: point.row, col: point.col + 1 }, // East
  ];

  nextPoints.forEach((nextPoint) => {
    if (
      nextPoint.row < 0 || nextPoint.row >= lines.length || nextPoint.col < 0 ||
      nextPoint.col >= lines[0].length
    ) {
      regions[regionIndex].perimeter++;
    } else {
      const nextPlant = lines[nextPoint.row][nextPoint.col];
      if (nextPlant === plant) {
        defineRegion(nextPoint, plant, regionIndex);
      } else {
        regions[regionIndex].perimeter++;
      }
    }
  });
};

for (let row = 0; row < lines.length; row++) {
  for (let col = 0; col < lines[row].length; col++) {
    const plant = lines[row][col];
    if (visited.has(`${row},${col}`)) {
      continue;
    }

    regions.push({
      perimeter: 0,
      area: 0,
      cells: [],
      plant,
    });

    const currentRegionIndex = regions.length - 1;

    defineRegion({ row, col }, plant, currentRegionIndex);
  }
}

let totalPrice: number = 0;
for (const region of regions) {
  totalPrice += region.perimeter * region.area;
}

console.log(`The answer to part one is ${totalPrice}!`);

type Direction = "north" | "south" | "west" | "east";

const edgeVisited: Map<string, boolean> = new Map();

const detectEdges = (
  cell: Point,
  direction: Direction,
  plant: string,
): boolean => {
  const key = `${cell.row},${cell.col},${direction}`;
  if (edgeVisited.has(key)) {
    return false;
  }
  edgeVisited.set(key, true);

  const checkPoint = {
    row: cell.row +
      (direction === "north" ? -1 : direction === "south" ? 1 : 0),
    col: cell.col + (direction === "west" ? -1 : direction === "east" ? 1 : 0),
  };

  let isEdge = false;
  if (
    checkPoint.row < 0 || checkPoint.row >= lines.length ||
    checkPoint.col < 0 || checkPoint.col >= lines[0].length
  ) {
    isEdge = true;
  } else if (lines[checkPoint.row][checkPoint.col] !== plant) {
    isEdge = true;
  }

  if (!isEdge) {
    return false;
  }

  const possibleEdges = [
    {
      row: cell.row + (direction === "north" || direction === "south" ? 0 : -1),
      col: cell.col + (direction === "west" || direction === "east" ? 0 : -1),
    },
    {
      row: cell.row + (direction === "north" || direction === "south" ? 0 : 1),
      col: cell.col + (direction === "west" || direction === "east" ? 0 : 1),
    },
  ];

  for (const possibleEdge of possibleEdges) {
    if (
      possibleEdge.row < 0 || possibleEdge.row >= lines.length ||
      possibleEdge.col < 0 || possibleEdge.col >= lines[0].length
    ) {
      continue;
    }

    if (lines[possibleEdge.row][possibleEdge.col] === plant) {
      detectEdges(possibleEdge, direction, plant);
    }
  }

  return true;
};

const directions: Direction[] = ["north", "south", "west", "east"];

let adjustedPrice: number = 0;
for (const region of regions) {
  let edges: number = 0;

  for (const cell of region.cells) {
    for (const direction of directions) {
      const isEdge = detectEdges(cell, direction, region.plant);
      if (isEdge) {
        edges++;
      }
    }
  }

  adjustedPrice += region.area * edges;
}

console.log(`The answer to part two is ${adjustedPrice}!`);
