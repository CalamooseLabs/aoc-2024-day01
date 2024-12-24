import { getRawFileContent } from "#utils";

// Types and interfaces for the circuit components
type BinaryValue = 0 | 1;
type GateOperator = "AND" | "OR" | "XOR";

interface LogicGate {
  input1: string;
  input2: string;
  operator: GateOperator;
}

interface CircuitState {
  gateDefinitions: Map<string, LogicGate>;
  knownWireValues: Map<string, BinaryValue>;
  pendingGates: Map<string, [string, GateOperator, string]>;
}

// Regular expressions for parsing circuit definitions
const PATTERNS = {
  WIRE_VALUE: /^([\w\d]+): ([01])\n?$/, // Matches "x00: 1"
  GATE_DEFINITION: /^([\w\s]+) -> ([\w\s]+)\n?$/, // Matches "x00 AND y00 -> z00"
} as const;

/**
 * Parses the input file and initializes the circuit state
 * @param input - Raw input string containing circuit definitions
 * @returns Initialized CircuitState object
 */
function parseCircuitDefinitions(input: string): CircuitState {
  const lines = input.split("\n").filter((line) => line.length > 0);
  const circuitState: CircuitState = {
    gateDefinitions: new Map(),
    knownWireValues: new Map(),
    pendingGates: new Map(),
  };

  for (const line of lines) {
    // Parse initial wire values
    let match = line.match(PATTERNS.WIRE_VALUE);
    if (match) {
      const [_, wireName, value] = match;
      circuitState.knownWireValues.set(wireName, Number(value) as BinaryValue);
      continue;
    }

    // Parse gate definitions
    match = line.match(PATTERNS.GATE_DEFINITION);
    if (match) {
      const [_, gateExpression, outputWire] = match;
      const [input1, operator, input2] = gateExpression.split(" ");

      // Validate operator type at compile time
      if (!isValidOperator(operator)) {
        throw new Error(`Invalid operator: ${operator}`);
      }

      circuitState.pendingGates.set(outputWire, [input1, operator, input2]);
      circuitState.gateDefinitions.set(outputWire, {
        input1,
        input2,
        operator,
      });
    }
  }

  return circuitState;
}

/**
 * Type guard to validate gate operators
 */
function isValidOperator(op: string): op is GateOperator {
  return ["AND", "OR", "XOR"].includes(op);
}

/**
 * Evaluates a logic gate with given inputs and operation
 * @throws Error if input values are undefined or operation is invalid
 */
function evaluateGate(
  wireA: string,
  wireB: string,
  operation: GateOperator,
  knownWireValues: Map<string, BinaryValue>,
): BinaryValue {
  const valueA = knownWireValues.get(wireA);
  const valueB = knownWireValues.get(wireB);

  if (valueA === undefined || valueB === undefined) {
    throw new Error(`Missing input values for gate: ${wireA}, ${wireB}`);
  }

  switch (operation) {
    case "AND":
      return (valueA && valueB) ? 1 : 0;
    case "OR":
      return (valueA || valueB) ? 1 : 0;
    case "XOR":
      return valueA !== valueB ? 1 : 0;
  }
}

/**
 * Finds a gate in the circuit by its inputs and operation type
 * Handles commutative operations (inputs can be in either order)
 */
function findGateByInputs(
  input1: string,
  input2: string,
  operator: GateOperator,
  gateDefinitions: Map<string, LogicGate>,
): string | undefined {
  for (const [outputWire, gate] of gateDefinitions) {
    if (gate.operator !== operator) continue;

    // Check both input orientations since all operations are commutative
    const matchesInputs = (gate.input1 === input1 && gate.input2 === input2) ||
      (gate.input1 === input2 && gate.input2 === input1);

    if (matchesInputs) return outputWire;
  }
  return undefined;
}

/**
 * Analyzes the binary adder structure to find incorrectly swapped wires
 * Uses pattern matching to identify full adder components and detect misplaced connections
 */
function findSwappedWires(gateDefinitions: Map<string, LogicGate>): string[] {
  const swappedWires: string[] = [];
  let carryIn: string | null = null;

  // Analyze each bit position in the 45-bit adder
  for (let pos = 0; pos < 45; pos++) {
    const bitIndex = pos.toString().padStart(2, "0");

    // Find the expected full adder components for current bit
    const components = {
      xorGate: findGateByInputs(
        `x${bitIndex}`,
        `y${bitIndex}`,
        "XOR",
        gateDefinitions,
      ),
      andGate: findGateByInputs(
        `x${bitIndex}`,
        `y${bitIndex}`,
        "AND",
        gateDefinitions,
      ),
      carryAndGate: undefined as string | undefined,
      sumBit: undefined as string | undefined,
      carryOut: undefined as string | undefined,
    };

    if (!components.xorGate || !components.andGate) continue;

    // Process carry chain logic
    if (carryIn) {
      components.carryAndGate = findGateByInputs(
        carryIn,
        components.xorGate,
        "AND",
        gateDefinitions,
      );

      // Detect and correct potential XOR/AND swap
      if (!components.carryAndGate) {
        [components.andGate, components.xorGate] = [
          components.xorGate,
          components.andGate,
        ];
        swappedWires.push(components.xorGate, components.andGate);
        components.carryAndGate = findGateByInputs(
          carryIn,
          components.xorGate,
          "AND",
          gateDefinitions,
        );
      }

      components.sumBit = findGateByInputs(
        carryIn,
        components.xorGate,
        "XOR",
        gateDefinitions,
      );

      if (!components.sumBit || !components.carryAndGate) continue;

      // Correct misplaced sum bit connections
      if (components.xorGate.startsWith("z")) {
        [components.xorGate, components.sumBit] = [
          components.sumBit,
          components.xorGate,
        ];
        swappedWires.push(components.xorGate, components.sumBit);
      }
      if (components.andGate.startsWith("z")) {
        [components.andGate, components.sumBit] = [
          components.sumBit,
          components.andGate,
        ];
        swappedWires.push(components.andGate, components.sumBit);
      }
      if (components.carryAndGate.startsWith("z")) {
        [components.carryAndGate, components.sumBit] = [
          components.sumBit,
          components.carryAndGate,
        ];
        swappedWires.push(components.carryAndGate, components.sumBit);
      }

      components.carryOut = findGateByInputs(
        components.carryAndGate,
        components.andGate,
        "OR",
        gateDefinitions,
      );
      if (!components.carryOut) continue;

      // Fix incorrectly placed carry out wire
      if (
        components.carryOut.startsWith("z") && components.carryOut !== "z45"
      ) {
        [components.carryOut, components.sumBit] = [
          components.sumBit,
          components.carryOut,
        ];
        swappedWires.push(components.carryOut, components.sumBit);
      }
    }

    // Update carry for next bit
    carryIn = components.carryOut ?? components.andGate;
  }

  return [...new Set(swappedWires)].sort();
}

/**
 * Simulates the circuit until all wire values are determined
 */
function simulateCircuit(circuitState: CircuitState): void {
  const { pendingGates, knownWireValues } = circuitState;

  while (pendingGates.size > 0) {
    for (const [outputWire, [input1, operator, input2]] of pendingGates) {
      // Skip if output wire already has a value
      if (knownWireValues.has(outputWire)) {
        pendingGates.delete(outputWire);
        continue;
      }

      // Evaluate gate if both inputs are known
      if (knownWireValues.has(input1) && knownWireValues.has(input2)) {
        const gateOutput = evaluateGate(
          input1,
          input2,
          operator as GateOperator,
          knownWireValues,
        );
        knownWireValues.set(outputWire, gateOutput);
        pendingGates.delete(outputWire);
      }
    }
  }
}

/**
 * Main execution flow
 */
function main() {
  // Initialize circuit from input file
  const input = getRawFileContent("input-test.txt");
  const circuitState = parseCircuitDefinitions(input);

  // Part 1: Simulate circuit and get decimal output
  simulateCircuit(circuitState);

  // Extract final binary number from z-wires
  const resultBinary = Array.from(circuitState.knownWireValues.entries())
    .filter(([wire]) => wire.startsWith("z"))
    .sort()
    .map(([_, value]) => value)
    .reverse()
    .join("");

  console.log(`The answer to part one is ${parseInt(resultBinary, 2)}!`);

  // Part 2: Find swapped wires in the binary adder
  const swappedWires = findSwappedWires(circuitState.gateDefinitions);
  console.log(`The answer to part two is ${swappedWires.join(",")}!`);
}

main();
