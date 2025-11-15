import ora from 'ora';
import chalk from 'chalk';

export type Logger = {
  info: (message: string) => void;
  success: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  status: (message: string) => void;
};

// Simple console logger - no spinners, just prints
export function createConsoleLogger(): Logger {
  return {
    info: (msg) => console.log(chalk.blue(msg)),
    success: (msg) => console.log(chalk.green(msg)),
    warn: (msg) => console.log(chalk.yellow(msg)),
    error: (msg) => console.log(chalk.red(msg)),
    status: (msg) => console.log(chalk.dim(msg)),
  };
}

// Spinner logger - uses ora for nice UX
export function createSpinnerLogger(): Logger {
  let spinner: ReturnType<typeof ora> | null = null;

  return {
    info: (msg) => {
      spinner?.stop();
      console.log(chalk.blue(msg));
    },
    success: (msg) => {
      spinner?.stop();
      console.log(chalk.green(msg));
    },
    warn: (msg) => {
      spinner?.stop();
      console.log(chalk.yellow(msg));
    },
    error: (msg) => {
      spinner?.stop();
      console.log(chalk.red(msg));
    },
    status: (msg) => {
      if (!spinner) {
        spinner = ora(msg).start();
      } else {
        spinner.text = msg;
      }
    },
  };
}
