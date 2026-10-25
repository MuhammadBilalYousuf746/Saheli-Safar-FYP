export const readSecret = (prompt) =>
  new Promise((resolve, reject) => {
    const input = process.stdin;

    if (!input.isTTY || typeof input.setRawMode !== "function") {
      reject(new Error("Run this operation from an interactive terminal."));
      return;
    }

    let value = "";
    process.stdout.write(prompt);
    input.setEncoding("utf8");
    input.setRawMode(true);
    input.resume();

    const finish = (error) => {
      input.removeListener("data", onData);
      input.setRawMode(false);
      input.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === "\u0003") {
          finish(new Error("Operation cancelled."));
          return;
        }

        if (character === "\r" || character === "\n") {
          finish();
          return;
        }

        if (character === "\u007f" || character === "\b") {
          value = [...value].slice(0, -1).join("");
        } else if (character >= " ") {
          value += character;
        }
      }
    };

    input.on("data", onData);
  });
