import { FileInfo, API, Options, ASTPath } from "jscodeshift";

// const tsParser = require("jscodeshift/parser/ts");

import { collection } from "./utils/database";
import { getFunctionParams, getFunctionName, getLocation } from "./utils/utils";

const debug = require("debug")("run:transform-usages");

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

  // find function calls
  rootCollection.find(j.CallExpression).forEach((p) => {
    debug("call expression", getLocation(p)?.start);
  });

  return undefined;
};
