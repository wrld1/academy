import { input, select, number, Separator, confirm } from "@inquirer/prompts";
import { styleText } from "node:util";

const users = [];

async function promptUser() {
  const name = await input({
    message: "Enter the user's name. To cancel press ENTER:",
  });
  if (!name.trim()) {
    return null;
  }
  const gender = await select({
    message: "Choose gender:",
    choices: [
      { name: "male", value: "male" },
      new Separator(),
      { name: "female", value: "female" },
    ],
  });
  const age = await number({
    message: "Enter user's age:",
  });
  return { name, gender, age };
}

async function searchUser() {
  if (users.length === 0) {
    console.log(
      styleText("yellow", "\nNo users registered yet to search from."),
    );
    return;
  }
  const searchName = await input({
    message: "Enter the user's name you want to search for:",
  });
  const found = users.filter((u) =>
    u.name.toLowerCase().includes(searchName.trim().toLowerCase()),
  );
  if (found.length > 0) {
    console.log(styleText("green", `\n✔ Found ${found.length} user(s):`));
    console.log(found);
  } else {
    console.log(
      styleText("red", `\n✖ No user found with the name "${searchName}".`),
    );
  }
}

async function main() {
  while (true) {
    const user = await promptUser();

    if (!user) {
      break;
    }

    users.push(user);
    console.log(styleText("cyan", `✔ Added ${user.name} to the list!\n`));
  }

  const wantsToSearch = await confirm({
    message: "Do you want to search for a particular user?",
    default: true,
  });
  if (wantsToSearch) {
    await searchUser();
  }

  console.log("\nAll registered users:");
  console.table(users);
}

main();
