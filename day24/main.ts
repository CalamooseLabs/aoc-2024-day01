import { getRawFileContent } from "#utils";

// Read and parse the input file containing gate configurations
const input = getRawFileContent("input-test.txt");
const lines = input.split("\n").filter((line) => line.length > 0);

// Define types for logic gate structure
type LogicGate = {
  input1: string;
  operator: string; // Can be "AND", "OR", or "XOR"
  input2: string;
};

// Maps to store the circuit state and configuration
const gateDefinitions = new Map<string, LogicGate>(); // Maps output wire to its gate definition
const knownWireValues = new Map<string, 0 | 1>(); // Stores known binary values for wires
const pendingGates = new Map<string, string[]>(); // Gates waiting for input values to be determined

// Regular expressions for parsing input lines
const WIRE_VALUE_REGEX = /^([\w\d]+): ([01])\n?$/; // Matches lines like "x00: 1"
const GATE_DEFINITION_REGEX = /^([\w\s]+) -> ([\w\s]+)\n?$/; // Matches lines like "x00 AND y00 -> z00"

// Parse input lines to populate our circuit configuration
for (const line of lines) {
  // Try to match initial wire values
  let match = line.match(WIRE_VALUE_REGEX);
  if (match) {
    const [_, wireName, value] = match;
    knownWireValues.set(wireName, Number(value) as 0 | 1);
  }

  // Try to match gate definitions
  match = line.match(GATE_DEFINITION_REGEX);
  if (match) {
    const [_, gateExpression, outputWire] = match;
    const [input1, operator, input2] = gateExpression.split(" ");
    pendingGates.set(outputWire, [input1, operator, input2]);
    gateDefinitions.set(outputWire, { input1, operator, input2 });
  }
}

// Evaluate a logic gate given its inputs and operation
const evaluateGate = (
  wireA: string,
  wireB: string,
  operation: string,
): 0 | 1 => {
  const valueA = knownWireValues.get(wireA);
  const valueB = knownWireValues.get(wireB);

  if (valueA === undefined || valueB === undefined) {
    throw new Error("Cannot evaluate gate: missing input values");
  }

  let result: 0 | 1 = 0;
  switch (operation) {
    case "OR":
      result = valueA === 1 || valueB === 1 ? 1 : 0;
      break;
    case "XOR":
      result = valueA !== valueB ? 1 : 0;
      break;
    case "AND":
      result = valueA === 1 && valueB === 1 ? 1 : 0;
      break;
    default:
      throw new Error(`Invalid gate operation: ${operation}`);
  }

  return result;
};

// Find a gate in the circuit by its inputs and operation type
function findGateByInputs(
  input1: string,
  input2: string,
  operator: string,
): string | undefined {
  for (const [outputWire, gate] of gateDefinitions) {
    // Check both input orientations since AND/OR/XOR are commutative
    if (
      (gate.input1 === input1 && gate.input2 === input2 &&
        gate.operator === operator) ||
      (gate.input1 === input2 && gate.input2 === input1 &&
        gate.operator === operator)
    ) {
      return outputWire;
    }
  }
  return undefined;
}

// Part 2: Analyze the binary adder structure to find incorrectly swapped wires
function findSwappedWires(): string[] {
  const swappedWires: string[] = [];
  let carryIn: string | null = null;

  // Analyze each bit position in the adder (45-bit numbers)
  for (let bitPosition = 0; bitPosition < 45; bitPosition++) {
    const bitIndex = bitPosition.toString().padStart(2, "0");

    // Expected gate outputs for full adder circuit
    let xorGate: string | undefined; // Mi: Xi XOR Yi (intermediate sum)
    let andGate: string | undefined; // Ni: Xi AND Yi (carry generate)
    let carryAndGate: string | undefined; // Ri: Ci-1 AND Mi (carry propagate)
    let sumBit: string | undefined; // Zi: Ci-1 XOR Mi (final sum)
    let carryOut: string | undefined; // Ci: Ri OR Ni (carry out)

    // Find initial XOR and AND gates for current bit position
    xorGate = findGateByInputs(`x${bitIndex}`, `y${bitIndex}`, "XOR");
    andGate = findGateByInputs(`x${bitIndex}`, `y${bitIndex}`, "AND");

    if (!xorGate || !andGate) continue;

    // Process carry logic for all bits except the first
    if (carryIn) {
      carryAndGate = findGateByInputs(carryIn, xorGate, "AND");

      // If carry AND gate not found, XOR and AND outputs might be swapped
      if (!carryAndGate) {
        [andGate, xorGate] = [xorGate, andGate];
        swappedWires.push(xorGate, andGate);
        carryAndGate = findGateByInputs(carryIn, xorGate, "AND");
      }

      sumBit = findGateByInputs(carryIn, xorGate, "XOR");

      if (!sumBit || !carryAndGate) continue;

      // Check and correct misplaced sum bit wires
      if (xorGate.startsWith("z")) {
        [xorGate, sumBit] = [sumBit, xorGate];
        swappedWires.push(xorGate, sumBit);
      }
      if (andGate.startsWith("z")) {
        [andGate, sumBit] = [sumBit, andGate];
        swappedWires.push(andGate, sumBit);
      }
      if (carryAndGate.startsWith("z")) {
        [carryAndGate, sumBit] = [sumBit, carryAndGate];
        swappedWires.push(carryAndGate, sumBit);
      }

      carryOut = findGateByInputs(carryAndGate, andGate, "OR");
      if (!carryOut) continue;
    }

    // Fix incorrectly placed carry out wire
    if (carryOut?.startsWith("z") && carryOut !== "z45") {
      [carryOut, sumBit] = [sumBit!, carryOut];
      swappedWires.push(carryOut, sumBit);
    }

    // Prepare carry for next bit
    carryIn = carryOut ?? andGate;
  }

  return [...new Set(swappedWires)].sort();
}

// Part 1: Simulate the circuit until all wire values are determined
while (pendingGates.size > 0) {
  for (const [outputWire, gateInputs] of pendingGates) {
    if (knownWireValues.has(outputWire)) {
      pendingGates.delete(outputWire);
      continue;
    }

    const [input1, operator, input2] = gateInputs;

    if (knownWireValues.has(input1) && knownWireValues.has(input2)) {
      const gateOutput: 0 | 1 = evaluateGate(input1, input2, operator);
      knownWireValues.set(outputWire, gateOutput);
      pendingGates.delete(outputWire);
    }
  }
}

// Extract final binary number from z-wires
let resultBinary: string = "";
[...knownWireValues.entries()].sort().forEach((entry) => {
  if (entry[0][0] === "z") {
    resultBinary = entry[1].toString() + resultBinary;
  }
});

console.log(`The answer to part one is ${parseInt(resultBinary, 2)}!`);

const swappedWires = findSwappedWires();
console.log(`The answer to part two is ${swappedWires.join(",")}!`);
