import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const lines = input.trim().split("\n");

interface Point {
    row: number;
    col: number;
}

interface Region {
    perimeter: number;
    area: number;
    cells: Point[];
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
        { row: point.row - 1, col: point.col, isDiagonal: false }, // North
        { row: point.row + 1, col: point.col, isDiagonal: false }, // South
        { row: point.row, col: point.col - 1, isDiagonal: false }, // West
        { row: point.row, col: point.col + 1, isDiagonal: false }, // East
        { row: point.row - 1, col: point.col - 1, isDiagonal: true }, // North-West
        { row: point.row - 1, col: point.col + 1, isDiagonal: true }, // North-East
        { row: point.row + 1, col: point.col - 1, isDiagonal: true }, // South-West
        { row: point.row + 1, col: point.col + 1, isDiagonal: true }, // South-East
    ];

    nextPoints.forEach((nextPoint) => {
        if (nextPoint.row < 0 || nextPoint.row >= lines.length || nextPoint.col < 0 || nextPoint.col >= lines[0].length) {
            if (!nextPoint.isDiagonal) {
                regions[regionIndex].perimeter++;
            }
        } else {
            const nextPlant = lines[nextPoint.row][nextPoint.col];
            if (nextPlant === plant) {
                defineRegion(nextPoint, plant, regionIndex);
            } else {
                if (!nextPoint.isDiagonal) {
                    regions[regionIndex].perimeter++;
                }
            }
        }

    });
}

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
        });

        const currentRegionIndex = regions.length - 1;

        defineRegion({ row, col }, plant, currentRegionIndex);
    }
}

let totalPrice: number = 0;
for (const region of regions) {
    console.log(`${region.area} * ${region.perimeter} = ${region.perimeter * region.area}`);
    totalPrice += region.perimeter * region.area;
}

console.log(`The answer to part one is ${totalPrice}!`);