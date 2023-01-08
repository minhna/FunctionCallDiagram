import { FileInfo, API, Options, ASTPath } from "jscodeshift";

// const tsParser = require("jscodeshift/parser/ts");

import { collection } from "./utils/database";
import {
  getFunctionParams,
  getFunctionName,
  getLocation,
  findImportNodeByVariableName,
} from "./utils/utils";

const debug = require("debug")("run:transform-usages");
const debugException = require("debug")("exception:run:transform-usages");

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

  // fetch all function declared in this file from database
  const allFunctions = await collection
    ?.find({ filePath: fileInfo.path })
    .toArray();
  debug("All functions in this file", allFunctions);

  const rootCollection = j(fileInfo.source);

  // find CallExpression
  rootCollection.find(j.CallExpression).map((p) => {
    debug("call expression", getLocation(p)?.start);
    // debug("p.value", p.value);
    const { callee } = p.value;
    switch (callee.type) {
      case "Identifier": {
        // simple function call, e.g: makeStyles()
        debug("simple function call");
        // 1. find function definition in database with function name
        const inThisFile = allFunctions?.find(
          (call) => call.name === callee.name && call.objectName === null
        );
        if (inThisFile) {
          debug("found in this file:", inThisFile);
        } else {
          // 2. if #1 was not found, find imported
          const { importNode, importSource, importSpecType } =
            findImportNodeByVariableName(callee.name, rootCollection, j);
          if (importNode) {
            debug("importSpecType", importSpecType);
            debug("import source", importSource);

            // to to exported file

            // find the function declare
          }
        }

        // 3. find in database then update usages

        break;
      }
      case "MemberExpression": {
        // call method of object, e.g: Meteor.call()
        debug("member expression");
        // 1. find the function declaration in the same file

        // 2. if #1 was not found, find in imported (object)

        // 3. find in database then update usages

        break;
      }
      case "OptionalMemberExpression": {
        // call method of optional object, e.g: info?.version()
        debug("optional member expression");
        // do the same as MemberExpression
        break;
      }
      case "CallExpression": {
        // call expression, e.g: require('debug')('app')
        // this will have other call expression type above
        // we don't handle this
        break;
      }
      case "Import": {
        // call import dynamically, inside a function or with some conditions
        // e.g: React.lazy(() => import('/import...'))
        // we don't handle this
        break;
      }
      case "Super": {
        // call super() inside a class constructor
        // we don't handle this
        break;
      }
      case "FunctionExpression": {
        // define function then call it immediately, e.g: function () {}()
        // we don't handle this
        break;
      }
      default:
        debugException(
          "Unhandled callee type:",
          callee.type,
          getLocation(p)?.start
        );
    }

    return null;
  });

  return undefined;
};
