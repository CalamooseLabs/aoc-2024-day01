const DayNumber = Deno.args[0].padStart(2, "0");

let inputFile: string = "input.txt";
if (Deno.args[1]) {
  inputFile = Deno.args[1];
}

const command = new Deno.Command(Deno.execPath(), {
  args: [
    "run",
    `--allow-read=day${DayNumber}/${inputFile}`,
    `day${DayNumber}/main.ts`,
    `day${DayNumber}/${inputFile}`,
  ],
});
const { code, stdout } = command.outputSync();

if (code !== 0) {
  throw new Error("Something went wrong in the day's code...");
}

console.log(new TextDecoder().decode(stdout));
