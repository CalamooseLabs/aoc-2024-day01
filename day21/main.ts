import { getRawFileContent } from "#utils";

const input = getRawFileContent("input-test.txt");
const codes = input.split("\n").filter((line) => line.length > 0);

// Define coordinate system types for keyboard positions
type GridCoordinate = [number, number];
type KeyboardLayout = Map<string, GridCoordinate>;
type MovementCosts = Map<string, number>;

/**
 * Calculates the minimum number of key presses needed to input a sequence
 * @param targetSequence - The sequence to input (e.g., "029A")
 * @param numberOfRobotKeyboards - Number of robot keyboard layers available
 * @returns Total minimum number of key presses needed
 */
function calculateMinimumKeyPresses(
  targetSequence: string,
  numberOfRobotKeyboards: number,
): number {
  // Initialize the arrow key layout for navigation
  let keyboardPositions: KeyboardLayout = createArrowKeyLayout();

  // Store the minimum presses needed between any two keys at each layer
  const movementCostsByLayer: MovementCosts = initializeBaseMoves(
    keyboardPositions,
  );

  /**
   * Calculates total presses needed for a sequence at a given layer
   * @param layerNumber - Current robot keyboard layer
   * @param keySequence - Sequence of keys to press
   */
  const calculateTotalPressesForSequence = (
    layerNumber: number,
    keySequence: string,
  ): number => {
    if (keySequence.length === 0) return 0;
    const fullSequence = "A" + keySequence; // Start from 'A' key
    let totalPresses = 0;

    // Sum up the minimum presses needed for each key transition
    for (let i = 0; i < keySequence.length; i++) {
      const moveKey = `${layerNumber},${fullSequence[i]},${keySequence[i]}`;
      const pressesCost = movementCostsByLayer.get(moveKey);
      if (pressesCost === undefined) {
        throw new Error(`Invalid movement combination: ${moveKey}`);
      }
      totalPresses += pressesCost;
    }
    return totalPresses;
  };

  // Process each layer of robot keyboards
  for (
    let currentLayer = 1;
    currentLayer <= numberOfRobotKeyboards;
    currentLayer++
  ) {
    // Switch to numeric keypad layout for final layer
    if (currentLayer === numberOfRobotKeyboards) {
      keyboardPositions = createNumericKeypadLayout();
    }

    // Calculate minimum presses between each pair of keys on current layer
    for (const [startKey, [startX, startY]] of keyboardPositions) {
      for (const [endKey, [endX, endY]] of keyboardPositions) {
        // Calculate horizontal and vertical distances
        const horizontalDist = endX - startX;
        const verticalDist = endY - startY;

        // Generate movement sequences
        const horizontalMoves = generateMovementSequence(
          horizontalDist,
          ">",
          "<",
        );
        const verticalMoves = generateMovementSequence(verticalDist, "v", "^");

        const spacePosition = keyboardPositions.get(" ")!;

        // Calculate costs for both movement orders
        let horizontalFirstCost = Infinity;
        let verticalFirstCost = Infinity;

        // Try horizontal then vertical movement if path not blocked
        if (!isPathBlocked(endX, startY, spacePosition)) {
          horizontalFirstCost = calculateTotalPressesForSequence(
            currentLayer - 1,
            horizontalMoves + verticalMoves + "A",
          );
        }

        // Try vertical then horizontal movement if path not blocked
        if (!isPathBlocked(startX, endY, spacePosition)) {
          verticalFirstCost = calculateTotalPressesForSequence(
            currentLayer - 1,
            verticalMoves + horizontalMoves + "A",
          );
        }

        // Store the minimum cost between the two possible paths
        const layerMoveKey = `${currentLayer},${startKey},${endKey}`;
        movementCostsByLayer.set(
          layerMoveKey,
          Math.min(horizontalFirstCost, verticalFirstCost),
        );
      }
    }
  }

  return calculateTotalPressesForSequence(
    numberOfRobotKeyboards,
    targetSequence,
  );
}

/**
 * Creates the initial arrow key layout for navigation
 * Layout:
 *  ^A
 * <v>
 */
function createArrowKeyLayout(): KeyboardLayout {
  return new Map(
    [" ^A", "<v>"].flatMap((row, rowIndex) =>
      [...row].map((
        key,
        colIndex,
      ): [string, GridCoordinate] => [key, [colIndex, rowIndex]])
    ),
  );
}

/**
 * Creates the numeric keypad layout for the final layer
 * Layout:
 * 789
 * 456
 * 123
 *  0A
 */
function createNumericKeypadLayout(): KeyboardLayout {
  return new Map(
    ["789", "456", "123", " 0A"].flatMap((row, rowIndex) =>
      [...row].map((
        key,
        colIndex,
      ): [string, GridCoordinate] => [key, [colIndex, rowIndex]])
    ),
  );
}

/**
 * Initializes the base movement costs between keys
 * @param layout - The keyboard layout to initialize costs for
 */
function initializeBaseMoves(layout: KeyboardLayout): MovementCosts {
  const baseMoves = new Map();
  for (const startKey of layout.keys()) {
    for (const endKey of layout.keys()) {
      baseMoves.set(`0,${startKey},${endKey}`, 1);
    }
  }
  return baseMoves;
}

/**
 * Generates a sequence of movement characters based on distance
 * @param distance - Number of steps to move (positive or negative)
 * @param positiveChar - Character to use for positive direction
 * @param negativeChar - Character to use for negative direction
 */
function generateMovementSequence(
  distance: number,
  positiveChar: string,
  negativeChar: string,
): string {
  const absDistance = Math.abs(distance);
  const direction = distance > 0 ? positiveChar : negativeChar;
  return Array(absDistance).fill(direction).join("");
}

/**
 * Checks if a movement path is blocked by the space key
 * @param x - X coordinate to check
 * @param y - Y coordinate to check
 * @param spacePos - Position of the space key
 */
function isPathBlocked(
  x: number,
  y: number,
  spacePos: GridCoordinate,
): boolean {
  return spacePos[0] === x && spacePos[1] === y;
}

// Calculate results for both parts of the problem
const part1Result = codes
  .reduce((total, sequence) => {
    const multiplier = parseInt(sequence.slice(0, -1));
    const minPresses = calculateMinimumKeyPresses(sequence, 3);
    return total + (minPresses * multiplier);
  }, 0);

const part2Result = codes
  .reduce((total, sequence) => {
    const multiplier = parseInt(sequence.slice(0, -1));
    const minPresses = calculateMinimumKeyPresses(sequence, 26);
    return total + (minPresses * multiplier);
  }, 0);

console.log(`The answer to part one is ${part1Result}!`);
console.log(`The answer to part two is ${part2Result}!`);
