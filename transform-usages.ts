import { FileInfo, API, Options, ASTPath } from "jscodeshift";

// const tsParser = require("jscodeshift/parser/ts");

import { collection } from "./utils/database";
import { getFunctionParams, getFunctionName, getLocation } from "./utils/utils";

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

  const rootCollection = j(fileInfo.source);

  // find CallExpression
  rootCollection.find(j.CallExpression).forEach((p) => {
    debug("call expression", getLocation(p)?.start);
    // debug("p.value", p.value);

    switch (p.value.callee.type) {
      case "Identifier": {
        // simple function call, e.g: makeStyles()
        debug("simple function call");
        break;
      }
      case "MemberExpression": {
        // call method of object, e.g: Meteor.call()
        debug("member expression");
        break;
      }
      case "OptionalMemberExpression": {
        // call method of optional object, e.g: info?.version()
        debug("optional member expression");
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
          p.value.callee.type,
          getLocation(p)?.start
        );
    }
    // check if a simple function call
  });

  return undefined;
};
