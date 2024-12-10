import { getRawFileContent } from "#utils";

const input = getRawFileContent();

const diskMap: string[] = input.trim().split("");

let currentID: string = "0";
const FREE_SPACE = ".";

const getNextID = () => {
  currentID = (Number(currentID) + 1).toString();
  return currentID;
};

const getPreviousID = () => {
  currentID = (Number(currentID) - 1).toString();
  return currentID;
};

const block_map: string[] = [];

let isBlockFile: boolean = true;
diskMap.forEach((char) => {
  const currentNum = Number(char);

  if (isBlockFile) {
    for (let i = 0; i < currentNum; i++) {
      block_map.push(currentID);
    }

    getNextID();
  } else {
    for (let i = 0; i < currentNum; i++) {
      block_map.push(FREE_SPACE);
    }
  }

  isBlockFile = !isBlockFile;
});

/// TOGGLE THIS TO SKIP PART ONE
const SKIP_PART_ONE = true;
const SKIP_PART_TWO = false;

if (!SKIP_PART_ONE) {
  const block_array = block_map.slice();
  const freeSpaceCount = block_array.filter((char) =>
    char === FREE_SPACE
  ).length;

  // Move through the block_array and if the current space is free,
  // check if the next space is a block, if it is, move the right most non-freespace into this spot
  // E.G. 00...111...2...333.44.5555.6666.777.888899 -> 0099811188827773336446555566..............

  let endOfBlockArray = block_array.slice(
    block_array.length - freeSpaceCount,
    block_array.length,
  );

  while (endOfBlockArray.join("") !== FREE_SPACE.repeat(freeSpaceCount)) {
    const block_array_copy = block_array.slice();
    const firstBlockIdx = block_array.findIndex((char) => char === FREE_SPACE);

    const reverseArr = block_array_copy.reverse();
    const reverseIdx = reverseArr.findIndex((char) => char !== FREE_SPACE);
    const reverseValue = reverseArr[reverseIdx];

    block_array[firstBlockIdx] = reverseValue;
    block_array[block_array.length - reverseIdx - 1] = FREE_SPACE;

    endOfBlockArray = block_array.slice(
      block_array.length - freeSpaceCount,
      block_array.length,
    );

    // console.log(endOfBlockArray.join(""));
  }

  let checksum: number = 0;

  block_array.filter((char) => char !== FREE_SPACE).forEach((char, idx) => {
    checksum += Number(char) * idx;
  });

  console.log(`Answer to part one is ${checksum}!`);
}

const two_block_array = block_map.slice();

const curr: number = Number(getPreviousID());

if (!SKIP_PART_TWO) {
  for (let currBlock = curr; currBlock >= 0; currBlock--) {
    console.log(currBlock);

    const fileHeaderStartIdx = two_block_array.indexOf(currBlock.toString());

    if (fileHeaderStartIdx === -1) {
      continue;
    }

    const fileHeaderSize = two_block_array.filter((char) =>
      char === currBlock.toString()
    ).length;

    let freeSpaceIdx = -1;
    let freeSpaceSize = 0;

    let freeIdx = -1;

    for (let idx = 0; idx < fileHeaderStartIdx; idx++) {
      if (two_block_array[idx] === FREE_SPACE) {
        if (freeSpaceIdx === -1) {
          freeSpaceIdx = idx;
        }

        freeSpaceSize++;

        if (freeSpaceSize >= fileHeaderSize) {
          freeIdx = idx;
          break;
        }
      } else {
        freeSpaceSize = 0;
        freeSpaceIdx = -1;
      }
    }

    if (freeIdx !== -1) {
      for (let i = 0; i < fileHeaderSize; i++) {
        two_block_array[freeIdx - i] = currBlock.toString();

        two_block_array[fileHeaderStartIdx + i] = FREE_SPACE;
      }
    }
  }

  let checksum: number = 0;

  for (let i = 0; i < two_block_array.length; i++) {
    if (two_block_array[i] !== FREE_SPACE) {
      checksum += Number(two_block_array[i]) * i;
    }
  }

  console.log(`Answer to part two is ${checksum}!`);
}
