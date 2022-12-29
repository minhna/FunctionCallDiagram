import { exit } from "process";
import { ArgsObject } from "./utils/types";
import { getFixedLengthText } from "./utils/utils";
import { client, collection } from "./utils/database";

const { run: jscodeshift } = require("jscodeshift/src/Runner");
const path = require("node:path");

const debug = require("debug")("run:index");

const options = {
  dry: true,
  print: true,
  verbose: 1,
  parser: "tsx",
  extensions: "js,jsx,ts,tsx",
  cpus: 1,
};

const [, mainPath, ...args] = process.argv;
// debug({ mainPath, args });
const availableArgs: { [key: string]: string } = {
  "--debug": "set debug filter, e.g: --debug=run:*",
  "-d": "set debug filter, e.g: -d run:*",
  "--reset": "empty database collection",
  "--scanUsages": "scan function usages",
};

const printAvailableArgs = () => {
  process.stdout.write("Available args:\n");
  Object.keys(availableArgs).forEach((item) => {
    process.stdout.write(
      `  ${getFixedLengthText(item, 10)} \t ${availableArgs[item]}\n`
    );
  });
};

const getProcessArgs = () => {
  let isValid = true;
  const objArgs: ArgsObject = {};
  for (let i = 0; i < args.length; i += 1) {
    let argKey: string = "",
      argValue: string | boolean = "";
    if (/^[-]/.test(args[i])) {
      // long
      const matches = args[i].match(/^(--.*?)=(.*)/);
      if (matches) {
        debug("matches", matches);
        argKey = matches[1];
        argValue = matches[2];
      } else {
        argKey = args[i];
        if (["-d"].includes(argKey)) {
          argValue = args[i + 1];
        } else {
          argValue = true;
        }
      }
    } else {
      continue;
    }

    if (!Object.keys(availableArgs).includes(argKey)) {
      process.stdout.write(`ERROR: Unknown arg: ${argKey}\n`);
      isValid = false;
    } else {
      objArgs[argKey] = argValue;
    }
  }

  objArgs.path = args[args.length - 1];

  return {
    isValid,
    objArgs,
  };
};

async function run(task: string) {
  try {
    await client?.connect();
    await collection?.createIndex(
      { name: 1, filePath: 1 },
      { name: "by_name_filePath" }
    );
  } catch (e) {
    if (e instanceof Error) {
      debug("Unable to connect database", e.message);
    }
    return;
  }

  switch (task) {
    case "scan": {
      const transformPath = path.resolve("transform.ts");
      await jscodeshift(transformPath, [objArgs.path], options);
      break;
    }
    case "reset": {
      try {
        debug("Resetting data...");
        await collection?.deleteMany({});
        debug("Reset completed");
      } catch (e) {
        if (e instanceof Error) {
          debug("Unable to connect database", e.message);
        }
      }

      break;
    }
    case "scanUsages": {
      const transformPath = path.resolve("transform-usages.ts");
      await jscodeshift(transformPath, [objArgs.path], options);
      break;
    }
  }

  try {
    await client?.close();
  } catch (e) {
    if (e instanceof Error) {
      debug("Error close database connection", e.message);
    }
  }
}

const { isValid, objArgs } = getProcessArgs();

if (!isValid) {
  printAvailableArgs();
  exit();
}

debug("args", objArgs);
if (objArgs["--debug"]) {
  process.env.DEBUG = objArgs["--debug"];
}

let task;
if (objArgs["--reset"]) {
  task = "reset";
} else if (objArgs["--scanUsages"]) {
  task = "scanUsages";
} else {
  task = "scan";
}
if (task) {
  run(task);
}
