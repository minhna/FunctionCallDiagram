import fs from "fs";
import { ASTPath, Function, JSCodeshift, SourceLocation } from "jscodeshift";
import { SettingsObject } from "./types";

const debug = require("debug")("run:utils");

export const getSettings = () => {
  try {
    debug("pwd", process.cwd());
    const settings: SettingsObject = JSON.parse(
      fs.readFileSync("./settings.json", "utf-8")
    );
    debug("getSettings", settings);

    return settings;
  } catch (e) {
    if (e instanceof Error) {
      debug("Error reading settings:", e.message);
    }
  }
};

export const getLocation = (
  p: ASTPath | ASTPath<any>
): SourceLocation | undefined => {
  if (!p) {
    return undefined;
  }
  if (p.value.loc) {
    return p.value.loc;
  }

  if (p.value.id?.type === "Identifier" && p.value.id.loc) {
    return p.value.id.loc;
  }

  return getLocation(p.parentPath);
};

export const getFunctionName = (p: ASTPath<Function>) => {
  switch (p.value.type) {
    case "ArrowFunctionExpression":
    case "FunctionExpression": {
      // debug("ArrowFunctionExpression, parent", p.parentPath.value);
      if (Array.isArray(p.parentPath.value)) {
        if (!p.parentPath.value.type) {
          // debug("p.parentPath.value:", p.parentPath.value);
        }
      } else {
        switch (p.parentPath.value.type) {
          case "VariableDeclarator":
            switch (p.parentPath.value.id.type) {
              case "Identifier":
                return p.parentPath.value.id.name;
              default:
                debug(
                  "Unhandled VariableDeclarator id type:",
                  p.parentPath.value.id.type
                );
                return;
            }
          case "Property":
            switch (p.parentPath.value.key.type) {
              case "Identifier":
                return p.parentPath.value.key.name;
              default:
                debug(
                  "Unhandled parentPath Property key type:",
                  p.parentPath.value.key.type
                );
                return;
            }
          default:
            debug("Unhandled parentPath value type:", p.parentPath.value.type);
        }
      }
      break;
    }
    case "FunctionDeclaration":
      switch (p.value.id?.type) {
        case "Identifier":
          return p.value.id.name;
        default:
          debug("Unhandled FunctionDeclaration id type:", p.value.id?.type);
          return;
      }
    default:
      debug("Unhandled function type:", p.value.type);
      break;
  }
};

export const getFunctionParams = (p: ASTPath<Function>, j: JSCodeshift) => {
  switch (p.value.type) {
    case "ArrowFunctionExpression":
    case "FunctionExpression":
    case "FunctionDeclaration":
      return j(p.value.params).toSource();
    default:
      debug("Unhandled function type:", p.value.type);
      break;
  }
};

export const getFixedLengthText = (str: string, length: number): string => {
  if (str.length >= length) {
    return str;
  }
  return `${str}${" ".repeat(length - str.length)}`;
};
