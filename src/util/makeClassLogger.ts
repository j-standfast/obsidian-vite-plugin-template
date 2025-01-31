export type Logger = (...args: any[]) => void;
export type LevelLogger = (level: number, ...args: any[]) => void;
type LogArgs = Parameters<typeof console.log>; 

const logWithPrefix = (prefix: string, ...args: LogArgs) => {
  console.log(...[
    typeof args[0] === 'string' ? `${prefix} / ${args[0]} / ` : prefix,
    ...args.slice(typeof args[0] === 'string' ? 1 : 0)
  ]);
}

export function makeClassLogger(prefix: string, callback: () => boolean): Logger {
  return (...args: LogArgs) => {
    if (callback()) logWithPrefix(prefix, ...args);
  }
}

export function makeClassLevelLogger(prefix: string, loggingLevel: () => number): LevelLogger {
  return (logLevel: number, ...args: LogArgs) => {
    if (logLevel <= loggingLevel()) logWithPrefix(prefix, ...args);
  }
} 