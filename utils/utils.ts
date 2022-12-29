import fs from "fs";
import {
  ASTNode,
  ASTPath,
  Function,
  JSCodeshift,
  ObjectMethod,
  SourceLocation,
  VariableDeclarator,
} from "jscodeshift";
import { SettingsObject } from "./types";

const debug = require("debug")("run:utils");

export const getSettings = () => {
  try {
    debug("pwd", process.cwd());
    const settings: SettingsObject = JSON.parse(
      fs.readFileSync("./settings.json", "utf-8")
    );
    debug("[getSettings]", settings);

    return settings;
  } catch (e) {
    if (e instanceof Error) {
      debug("[getSettings] Error reading settings:", e.message);
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

export const getParentVariableDeclarator = (
  p: ASTPath<VariableDeclarator>
): ASTPath | undefined => {
  if (!p.parentPath) {
    return undefined;
  }
  if (p.parentPath.value.type === "VariableDeclarator") {
    return p.parentPath;
  }
  return getParentVariableDeclarator(p.parentPath);
};

export type GetFunctionNameResult = {
  name: string;
  objectName?: string;
};

export const getFunctionName = (
  p: ASTPath<Function | ObjectMethod>
): GetFunctionNameResult | undefined => {
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
                return { name: p.parentPath.value.id.name };
              default:
                debug(
                  "[getFunctionName] Unhandled VariableDeclarator id type:",
                  p.parentPath.value.id.type
                );
                return;
            }
          case "Property":
            switch (p.parentPath.value.key.type) {
              case "Identifier":
                return { name: p.parentPath.value.key.name };
              default:
                debug(
                  "[getFunctionName] Unhandled parentPath Property key type:",
                  p.parentPath.value.key.type
                );
                return;
            }
          case "ObjectProperty": {
            const methodName = p.parentPath.value.key.name;
            // get the object name
            const parentVariableDeclarator = getParentVariableDeclarator(
              p.parentPath
            );
            if (
              parentVariableDeclarator?.value.type === "VariableDeclarator" &&
              parentVariableDeclarator.value.id.type === "Identifier"
            ) {
              return {
                name: methodName,
                objectName: parentVariableDeclarator.value.id.name,
              };
            }
            break;
          }

          default:
            debug(
              "[getFunctionName] Unhandled parentPath value type:",
              p.parentPath.value.type
            );
        }
      }
      break;
    }
    case "FunctionDeclaration":
      switch (p.value.id?.type) {
        case "Identifier":
          return { name: p.value.id.name };
        default:
          debug(
            "[getFunctionName] Unhandled FunctionDeclaration id type:",
            p.value.id?.type
          );
          return;
      }
    case "ObjectMethod": {
      // debug("[getFunctionName] ObjectMethod", p.value);
      // typescript is crazy, I don't know how to check type in runtime.
      const px: ASTPath<any> = p;
      const methodName = px.value.key.name;
      // get the object name
      const parentVariableDeclarator = getParentVariableDeclarator(
        p.parentPath
      );
      if (
        parentVariableDeclarator?.value.type === "VariableDeclarator" &&
        parentVariableDeclarator.value.id.type === "Identifier"
      ) {
        return {
          name: methodName,
          objectName: parentVariableDeclarator.value.id.name,
        };
      }
      break;
    }
    default:
      debug("[getFunctionName] Unhandled function type:", p.value.type);
      break;
  }
};

export const getFunctionParams = (p: ASTPath<Function>, j: JSCodeshift) => {
  switch (p.value.type) {
    case "ArrowFunctionExpression":
    case "FunctionExpression":
    case "FunctionDeclaration":
    case "ObjectMethod":
      return j(p.value.params).toSource();
    default:
      debug("[getFunctionParams] Unhandled function type:", p.value.type);
      break;
  }
};

export const getFixedLengthText = (str: string, length: number): string => {
  if (str.length >= length) {
    return str;
  }
  return `${str}${" ".repeat(length - str.length)}`;
};
