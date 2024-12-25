import { getRawFileContent } from "#utils";

// Read input file
const input = getRawFileContent("input-test.txt");

/**
 * Represents a schematic pattern as an array of strings, where:
 * - '#' represents a solid part
 * - '.' represents an empty space
 * Each string in the array represents one row of the pattern
 */
type SchematicPattern = string[];

/**
 * Represents the two types of patterns we're working with
 */
type PatternType = "lock" | "key";

/**
 * Interface for categorized patterns
 */
interface PatternCollection {
  locks: SchematicPattern[];
  keys: SchematicPattern[];
}

/**
 * Parses the raw input string into an array of schematic patterns.
 * Each pattern is separated by double newlines in the input.
 *
 * @param rawInput - The raw input string containing all patterns
 * @returns Array of schematic patterns
 */
const parseInput = (rawInput: string): SchematicPattern[] => {
  return rawInput
    .trim()
    .split("\n\n")
    .map((pattern) => pattern.split("\n"));
};

/**
 * Determines if a given schematic pattern is a lock.
 * Locks are identified by having '#' characters in their first row.
 *
 * @param pattern - The schematic pattern to check
 * @returns true if the pattern is a lock, false if it's a key
 */
const isLockPattern = (pattern: SchematicPattern): boolean => {
  return pattern[0].includes("#");
};

/**
 * Checks if a key pattern can combine with a lock pattern without overlaps.
 * A valid combination has no position where both patterns have '#' characters.
 *
 * @param keyPattern - The key pattern to test
 * @param lockPattern - The lock pattern to test against
 * @returns true if the patterns can combine without overlap
 */
const canPatternsMatch = (
  keyPattern: SchematicPattern,
  lockPattern: SchematicPattern,
): boolean => {
  // Check each row of the patterns
  return !keyPattern.some((rowContent, rowIndex) =>
    // Check each character in the row
    rowContent.split("").some((char, colIndex) =>
      // If both patterns have '#' at the same position, they overlap
      char === "#" && lockPattern[rowIndex][colIndex] === "#"
    )
  );
};

/**
 * Categorizes schematic patterns into locks and keys
 *
 * @param patterns - Array of all schematic patterns
 * @returns Object containing separate arrays for locks and keys
 */
const categorizePatterns = (
  patterns: SchematicPattern[],
): PatternCollection => {
  return {
    locks: patterns.filter(isLockPattern),
    keys: patterns.filter((pattern) => !isLockPattern(pattern)),
  };
};

/**
 * Solves the puzzle by finding all valid lock and key combinations
 *
 * @param rawInput - The raw input string containing all patterns
 * @returns Number of valid lock/key pairs
 */
function solvePuzzle(rawInput: string): number {
  // Parse and categorize the patterns
  const allPatterns = parseInput(rawInput);
  const { locks, keys } = categorizePatterns(allPatterns);

  let validCombinations = 0;

  // Test each lock against each key
  for (const lockPattern of locks) {
    for (const keyPattern of keys) {
      if (canPatternsMatch(keyPattern, lockPattern)) {
        validCombinations++;
      }
    }
  }

  return validCombinations;
}

// Solve the puzzle and output the result
console.log(`The answer to part one is ${solvePuzzle(input)}!`);
