const LEVELS = ["debug", "info", "warn", "error"] as const;

function ts(): string {
  return new Date().toISOString();
}

function fmt(level: string, args: unknown[]): string {
  return `[${ts()}] [${level.toUpperCase()}] ${args
    .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
    .join(" ")}`;
}

export const logger = {
  debug: (...args: unknown[]) => console.debug(fmt("debug", args)),
  info: (...args: unknown[]) => console.info(fmt("info", args)),
  warn: (...args: unknown[]) => console.warn(fmt("warn", args)),
  error: (...args: unknown[]) => console.error(fmt("error", args)),
  levels: LEVELS
};
