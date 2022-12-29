import { FileInfo, API, Options, ASTPath } from "jscodeshift";

// const tsParser = require("jscodeshift/parser/ts");

import { collection } from "./utils/database";
import { getFunctionParams, getFunctionName, getLocation } from "./utils/utils";

const debug = require("debug")("run:transform");

module.exports = async function (
  fileInfo: FileInfo,
  { j }: API,
  options: Options
) {
  debug(
    `**************************************************
*** ${fileInfo.path}
**************************************************`
  );

  const rootCollection = j(fileInfo.source);

  // find all function declaration
  rootCollection.find(j.Function).forEach(async (p) => {
    // insert to the database
    const func = {
      name: getFunctionName(p),
      params: `${getFunctionParams(p, j)}`,
      startLine: getLocation(p)?.start.line,
      filePath: fileInfo.path,
    };
    debug("func", func);
    if (func.name) {
      try {
        const f = await collection?.findOne(func);
        if (!f) {
          await collection?.insertOne(func);
        }
      } catch (e) {
        if (e instanceof Error) {
          debug("Error working with database:", e.message);
        }
      }
    }
  });

  // find function calls
  // rootCollection.find(j.CallExpression).forEach(async (p) => {
  //   debug("call expression", getLocation(p)?.start);
  // });

  return undefined;
};
