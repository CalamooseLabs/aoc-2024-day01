import { getRawFileContent } from "#utils";

// Debug flag to control detailed logging
const DEBUG = false;

/**
 * Builds an adjacency list representation of the network
 * @param input - Raw string input containing computer connections
 * @returns Map where each key is a computer and value is a Set of connected computers
 */
function buildGraph(input: string): Map<string, Set<string>> {
  const connections = new Map<string, Set<string>>();

  // Split input into lines and filter out empty lines
  const lines = input.trim().split("\n").filter((line) => line.length > 0);

  // Process each connection
  for (const line of lines) {
    const [computerA, computerB] = line.split("-");

    // Initialize Sets for new computers
    if (!connections.has(computerA)) connections.set(computerA, new Set());
    if (!connections.has(computerB)) connections.set(computerB, new Set());

    // Add bidirectional connections
    connections.get(computerA)!.add(computerB);
    connections.get(computerB)!.add(computerA);
  }

  if (DEBUG) {
    console.log("Network connections:");
    for (const [computer, connected] of connections) {
      console.log(`${computer} -> ${Array.from(connected).join(", ")}`);
    }
  }

  return connections;
}

/**
 * Finds all sets of three interconnected computers (triangles) in the network
 * @param connections - Map of network connections
 * @returns Set of strings, each representing a triangle (comma-separated computer names)
 */
function findTriangles(connections: Map<string, Set<string>>): Set<string> {
  const triangles = new Set<string>();
  const computers = Array.from(connections.keys());

  // Iterate through all possible combinations of three computers
  for (let i = 0; i < computers.length - 2; i++) {
    for (let j = i + 1; j < computers.length - 1; j++) {
      for (let k = j + 1; k < computers.length; k++) {
        const computerA = computers[i];
        const computerB = computers[j];
        const computerC = computers[k];

        // Check if all three computers are connected to each other
        if (
          connections.get(computerA)!.has(computerB) &&
          connections.get(computerB)!.has(computerC) &&
          connections.get(computerA)!.has(computerC)
        ) {
          // Sort computer names for consistent triangle representation
          const triangle = [computerA, computerB, computerC].sort().join(",");
          triangles.add(triangle);
        }
      }
    }
  }

  if (DEBUG) {
    console.log("\nAll triangles found:");
    triangles.forEach((triangle) => console.log(triangle));
  }

  return triangles;
}

/**
 * Counts triangles containing at least one computer starting with 't'
 * @param triangles - Set of triangles to analyze
 * @returns Number of triangles containing at least one 't' computer
 */
function countTrianglesWithT(triangles: Set<string>): number {
  let count = 0;

  if (DEBUG) {
    console.log("\nTriangles containing 't' computers:");
  }

  for (const triangle of triangles) {
    const computers = triangle.split(",");
    if (computers.some((comp) => comp.startsWith("t"))) {
      count++;
      if (DEBUG) {
        console.log(triangle);
      }
    }
  }

  return count;
}

/**
 * Finds the largest set of fully connected computers (maximum clique)
 * Using Bron-Kerbosch algorithm with pivoting
 * @param connections - Map of network connections
 * @returns Array of computer names in the largest clique
 */
function findLargestClique(connections: Map<string, Set<string>>): string[] {
  let maxClique: string[] = [];
  const allComputers = Array.from(connections.keys());

  // Helper function for Bron-Kerbosch algorithm
  function bronKerbosch(R: Set<string>, P: Set<string>, X: Set<string>) {
    if (P.size === 0 && X.size === 0) {
      if (R.size > maxClique.length) {
        maxClique = Array.from(R);
      }
      return;
    }

    // Choose pivot
    const pivot = Array.from(P).concat(Array.from(X))[0];
    const pivotConnections = connections.get(pivot)!;

    // Iterate through potential candidates
    for (const v of Array.from(P)) {
      if (!pivotConnections.has(v)) {
        const vConnections = connections.get(v)!;

        // Recursive call with updated sets
        bronKerbosch(
          new Set([...Array.from(R), v]),
          new Set(Array.from(P).filter((n) => vConnections.has(n))),
          new Set(Array.from(X).filter((n) => vConnections.has(n))),
        );

        P.delete(v);
        X.add(v);
      }
    }
  }

  // Start algorithm with all computers in P
  bronKerbosch(
    new Set(),
    new Set(allComputers),
    new Set(),
  );

  if (DEBUG) {
    console.log("\nLargest clique found:", maxClique);
    console.log("Size:", maxClique.length);
  }

  return maxClique.sort();
}

function main() {
  // Read input file
  const input = getRawFileContent("input-test.txt");

  // Build network graph
  const connections = buildGraph(input);

  // Part 1: Find triangles with 't' computers
  const triangles = findTriangles(connections);
  const answer1 = countTrianglesWithT(triangles);
  console.log(`The answer to part one is ${answer1}!`);

  // Part 2: Find the LAN party password
  const largestClique = findLargestClique(connections);
  const password = largestClique.join(",");
  console.log(`The answer to part two is ${password}!`);
}

main();
