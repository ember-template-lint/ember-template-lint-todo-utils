import { join } from 'path';
import { TodoConfig } from './types';
import { readFileSync, writeFileSync } from 'fs-extra';

const DETECT_TRAILING_WHITESPACE = /\s+$/;

/**
 * Gets the todo configuration.
 * Config values can be present in
 *
 * The package.json
 *
 * @example
 * ```json
 * {
 *   "lintTodo": {
 *     "daysToDecay": {
 *       "warn": 5,
 *       "error": 10
 *     }
 *   }
 * }
 * ```
 *
 * Environment variables (`TODO_DAYS_TO_WARN` or `TODO_DAYS_TO_ERROR`)
 * 	- Env vars override package.json config
 *
 * Passed in directly, such as from command line options.
 * 	- Passed in options override both env vars and package.json config
 *
 * @param baseDir - The base directory that contains the project's package.json.
 * @param todoConfig - The optional todo configuration.
 * @returns - The todo config object.
 */
export function getTodoConfig(
  baseDir: string,
  todoConfig: TodoConfig = {}
): TodoConfig | undefined {
  const daysToDecayPackageConfig = getFromPackageJson(baseDir);
  const daysToDecayEnvVars = getFromEnvVars();
  const mergedConfig = Object.assign({}, daysToDecayPackageConfig, daysToDecayEnvVars, todoConfig);

  if (
    typeof mergedConfig.warn === 'number' &&
    typeof mergedConfig.error === 'number' &&
    mergedConfig.warn >= mergedConfig.error
  ) {
    throw new Error(
      `The provided TODO configuration contains invalid values. The \`warn\` value (${mergedConfig.warn}) must be less than the \`error\` value (${mergedConfig.error}).`
    );
  }

  return mergedConfig;
}

/**
 * Writes a todo config to the package.json located at the provided baseDir.
 *
 * @param baseDir - The base directory that contains the project's package.json.
 * @param todoConfig - The todo configuration to write to the package.json.
 */
export function writeTodoConfig(baseDir: string, todoConfig: TodoConfig): boolean {
  const packageJsonPath = join(baseDir, 'package.json');
  const contents = readFileSync(packageJsonPath, { encoding: 'utf8' });
  const trailingWhitespace = DETECT_TRAILING_WHITESPACE.exec(contents);
  const pkg = JSON.parse(contents);

  if (pkg.lintTodo) {
    return false;
  }

  pkg.lintTodo = {
    decayDays: todoConfig,
  };

  let updatedContents = JSON.stringify(pkg, undefined, 2);

  if (trailingWhitespace) {
    updatedContents += trailingWhitespace[0];
  }

  writeFileSync(packageJsonPath, updatedContents, { encoding: 'utf8' });

  return true;
}

function getFromPackageJson(basePath: string): TodoConfig {
  let pkg;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    pkg = require(join(basePath, 'package.json'));
  } catch {}

  return pkg?.lintTodo?.daysToDecay || {};
}

function getFromEnvVars(): TodoConfig {
  const config: TodoConfig = {};

  const warn = getEnvVar('TODO_DAYS_TO_WARN');
  const error = getEnvVar('TODO_DAYS_TO_ERROR');

  if (Number.isInteger(warn)) {
    config.warn = warn;
  }

  if (Number.isInteger(error)) {
    config.error = error;
  }

  return config;
}

function getEnvVar(name: string) {
  if (process.env[name]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return Number.parseInt(process.env[name]!, 10);
  }
}