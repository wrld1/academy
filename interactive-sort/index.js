import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { styleText } from "node:util";

const choices = [
  "Sort the words alphabetically",
  "Display the numbers in ascending order",
  "Display the numbers in descending order",
  "Display the words in ascending order based on the number of letters in each word",
  "Show only unique words",
  "Show only the unique values from the entire set of words and numbers entered by the user",
];

const formattedChoices = choices
  .map((opt, index) => `  ${index + 1}. ${opt}`)
  .join("\n");

function formatInput(words, formatOption) {
  const wordsArray = words.split(" ");
  const option = Number(formatOption);

  switch (option) {
    case 1:
      return wordsArray
        .filter((item) => isNaN(item))
        .sort((a, b) => a.localeCompare(b));
    case 2:
      return wordsArray
        .filter((item) => !isNaN(item))
        .map(Number)
        .sort((a, b) => a - b);
    case 3:
      return wordsArray
        .filter((item) => !isNaN(item))
        .map(Number)
        .sort((a, b) => b - a);
    case 4:
      return wordsArray
        .filter((item) => isNaN(item))
        .sort((a, b) => a.length - b.length);
    case 5:
      return [...new Set(wordsArray.filter((item) => isNaN(item)))];
    case 6:
      return [...new Set(wordsArray)];
    default:
      return "Invalid option selected.";
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });
  try {
    while (true) {
      const words = await rl.question(
        styleText(
          "blue",
          "Hello. Enter 10 digits or words separated by spaces (or type 'exit' to quit): ",
        ),
      );
      if (words.trim().toLowerCase() === "exit") {
        console.log("Goodbye!");
        break;
      }

      const wordsArray = words.trim().split(" ");

      if (!words.trim() || wordsArray.length !== 10) {
        console.log(
          `\nError: You must enter exactly 10 items! (You entered ${words.trim() ? wordsArray.length : 0})`,
        );
        continue;
      }

      const optionSelected = await rl.question(
        `\nHow would you sort values:\n${formattedChoices}\nSelect (1 - ${choices.length}) and press ENTER: `,
      );
      const result = formatInput(words, optionSelected);
      console.log("\n Result:", result);
    }
  } finally {
    rl.close();
  }
}

main();
