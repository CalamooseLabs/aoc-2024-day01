import { getRawFileContent } from "#utils";

interface Registers {
  A: bigint;
  B: bigint;
  C: bigint;
}

const input = getRawFileContent();

const INPUT_REGEX =
  /Register A: (\d+)\nRegister B: (\d+)\nRegister C: (\d+)\n\nProgram: ((\d|,)+)/g;
const matches = INPUT_REGEX.exec(input);

if (!matches) {
  throw new Error("Invalid input");
}

const [_, registerA, registerB, registerC, program] = matches;

const registers: Registers = {
  A: BigInt(registerA),
  B: BigInt(registerB),
  C: BigInt(registerC),
};

const programArray = program.split(",").map(Number);

const bitwiseXor = (a: bigint, b: bigint) => (a ^ b);

const runProgram = (program: number[], registers: Registers) => {
  let pointer = 0;
  const output: number[] = [];

  while (pointer < program.length) {
    const opcode = program[pointer];
    let operand: bigint = BigInt(program[pointer + 1]);

    switch (operand) {
      case 4n:
        operand = registers.A;
        break;
      case 5n:
        operand = registers.B;
        break;
      case 6n:
        operand = registers.C;
        break;
      case 7n:
        throw new Error("Reserved operand 7");
      default:
        // 0 - 3 - keeps the same value
        break;
    }

    switch (opcode) {
      case 0:
        // adv: Division of register A by 2^operand
        registers.A = registers.A / (1n << operand);
        pointer += 2;
        break;
      case 1:
        // bxl: Bitwise XOR of register B and operand
        registers.B = bitwiseXor(registers.B, operand);
        pointer += 2;
        break;
      case 2:
        // bst: Operand modulo 8
        registers.B = operand % 8n;
        pointer += 2;
        break;
      case 3:
        // jnz: GOTO
        pointer = registers.A === 0n ? pointer + 2 : Number(operand);
        break;
      case 4:
        // bxc: Bitwise XOR of register B and register C
        registers.B = bitwiseXor(registers.B, registers.C);
        pointer += 2;
        break;
      case 5:
        // out: Output operand modulo 8
        output.push(Number(operand % 8n));
        pointer += 2;
        break;
      case 6:
        // bdv: Division of register B by 2^operand
        registers.B = registers.A / (1n << operand);
        pointer += 2;
        break;
      case 7:
        // cdv: Division of register C by 2^operand
        registers.C = registers.A / (1n << operand);
        pointer += 2;
        break;
    }
  }

  return output.join(",");
};

console.log(
  `The answer to part one is ${runProgram(programArray, registers)}!`,
);

const minimumSolution = (program: number[]) => {
  let attemptedNumbers = new Set<bigint>([0n]);

  for (let step = 0; step < program.length; step++) {
    const possibleNumbers = new Set<bigint>();

    for (const number of attemptedNumbers) {
      const base = number * 8n;

      for (let i = 0; i < 8; i++) {
        const regA = base + BigInt(i);
        const output = (runProgram(program, { A: regA, B: 0n, C: 0n })).split(
          ",",
        ).map(Number);

        if (
          output.slice(-step - 1).join(",") ===
            program.slice(-step - 1).join(",")
        ) {
          possibleNumbers.add(regA);
        }
      }
    }

    if (possibleNumbers.size === 0) return -1n;

    attemptedNumbers = possibleNumbers;
  }

  return Array.from(attemptedNumbers).reduce(
    (min, current) => min === -1n || current < min ? current : min,
    -1n,
  );
};

console.log(`The answer to part two is ${minimumSolution(programArray)}!`);
