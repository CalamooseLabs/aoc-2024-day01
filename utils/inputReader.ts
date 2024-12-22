export const getFileContent = (delim: string): number[][] => {
  if (Deno.args.length < 1) {
    throw new Error("Argument of file input is required");
  }

  const FileArg = Deno.args[0];

  const lines: number[][] = [];
  try {
    const decoder = new TextDecoder("utf-8");
    const fileContents = Deno.readFileSync(FileArg);
    const decodedContent = decoder.decode(fileContents);

    const decodedLines = decodedContent.split("\n");
    for (const line of decodedLines) {
      const values = line.split(delim);
      if (values.length <= 1) continue;

      lines.push([...values.map((x) => parseInt(x))]);
    }
  } catch (_e) {
    throw new Error("Something went wrong while reading...");
  }

  return lines;
};

export const getRawFileContent = (inputFile?: string): string => {
  const FileArg = Deno.args.length > 0 ? Deno.args[0] : inputFile;

  if (FileArg === undefined) {
    throw new Error("Argument of file input is required");
  }

  let decodedContent: string;
  try {
    const decoder = new TextDecoder("utf-8");
    const fileContents = Deno.readFileSync(FileArg);
    decodedContent = decoder.decode(fileContents);
  } catch (_e) {
    throw new Error("Something went wrong while reading...");
  }

  return decodedContent;
};
