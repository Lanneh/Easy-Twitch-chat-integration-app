import chalk from "chalk";

export const log = {
  info: (msg) => console.log(chalk.cyan(`[INFO] ${new Date().toISOString()} ${msg}`)),
  warn: (msg) => console.warn(chalk.yellow(`[WARN] ${new Date().toISOString()} ${msg}`)),
  error: (msg) => console.error(chalk.red(`[ERROR] ${new Date().toISOString()} ${msg}`))
};
