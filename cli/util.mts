export function stringToArray(
  value: string | undefined,
  separator: string | RegExp = /[ ,;\n]/
): string[] {
  if (value == null) return [];

  return value
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function defaultsArray<T>(source: T[], defaultsArray: T[]): T[] {
  return source.length ? source : defaultsArray;
}
