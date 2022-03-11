import { exit } from "process";
import { createInterface } from "readline";
import { promisify } from "util";

const rlInterface = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = promisify(rlInterface.question).bind(rlInterface);

function greeting(name: unknown) {
  console.log(`Hello, ${name}!`);
}

async function main() {
  try {
    const name = await question("Type your name: ");

    greeting(name);

    rlInterface.close();
  } catch (e) {
    console.error(e);
  }
}

main();
