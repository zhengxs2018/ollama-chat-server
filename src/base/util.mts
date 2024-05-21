import { randomUUID } from "node:crypto";

export function randomId(count = 12): string {
  return randomUUID().replace(/-/g, "").slice(0, count);
}

export function getEnv(name: string): string | undefined;
export function getEnv(name: string, defaultValue: string): string;
export function getEnv(
  name: string,
  defaultValue?: string
): string | undefined {
  const value = process.env[name];
  return value ?? defaultValue;
}

export function safeInteger(value: unknown, defaultValue: number): number {
  if (typeof value === "string") {
    value = parseInt(value, 10);
  }

  if (typeof value === "number") {
    return Number.isSafeInteger(value) ? value : defaultValue;
  }

  return defaultValue;
}

export type RequiredDict<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

export function flushObject<T extends NodeJS.Dict<unknown>>(
  o: T
): RequiredDict<T> {
  const obj = {} as RequiredDict<T>;

  Object.keys(o).forEach((key) => {
    const value = o[key];
    if (value == null) return;

    // @ts-expect-error
    obj[key] = value;
  });

  return obj;
}

export const safeJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return undefined;
  }
};
