export type PathMatcher = {
  test: (path: string) => boolean;
  extract: (path: string) => Record<string, string>;
};

export function compile(rule: string): PathMatcher | undefined {
  if (!rule.includes("{")) return;

  // /user/{id}/profile => ["id"]
  // /user/{id}/profile/{name} => ["id", "name"]
  const keys = rule.match(/{[^}]+}/g) || [];
  const pattern = pathToRegexp(rule);

  return {
    test: (path) => pattern.test(path),
    extract: (path) => extract(path, keys, pattern),
  };
}

export function pathToRegexp(path: string): RegExp {
  return new RegExp(
    `^${path.replace(/\{[^}]+\}/g, "([^/]+)").replace(/\//g, "\\/")}$`
  );
}

export function extract(
  path: string,
  keys: string[],
  pattern: RegExp
): Record<string, string> {
  const values = pattern.exec(path);

  if (!values) return {};

  return keys.reduce((params, key, index) => {
    const name = key.slice(1, -1);
    params[name] = values[index + 1];
    return params;
  }, {} as Record<string, string>);
}
