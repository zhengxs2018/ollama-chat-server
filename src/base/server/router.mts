import { type IncomingMessage, type ServerResponse } from "node:http";

import { notFound, serverError } from "./_errors.mjs";
import { compile, type PathMatcher } from "./path.mjs";

export type Params = Record<string, string>;

export type Handle = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  params: Params
) => unknown;

export type Route = {
  GET?: Handle;
  POST?: Handle;
  PUT?: Handle;
  DELETE?: Handle;
  PATCH?: Handle;
  HEAD?: Handle;
  handle?: Handle;
};

export function createRouter(routes: Array<readonly [string, Route | Handle]>) {
  const ROUTES = new Map<string, Route>(
    routes.map(([path, handle]) => {
      return [path, typeof handle === "function" ? { handle } : handle];
    })
  );

  const REGEX_ROUTER = new Map<string, PathMatcher>(
    routes.reduce((acc, [rule]) => {
      if (rule === "*") return acc;

      const result = compile(rule);

      if (result) acc.push([rule, result]);

      return acc;
    }, [] as [string, PathMatcher][])
  );

  function lookupRoute(path: string): [Route | undefined, Params] {
    const route = ROUTES.get(path);
    if (route) return [route, {}];

    for (const [rule, matcher] of REGEX_ROUTER) {
      if (matcher.test(path)) {
        return [ROUTES.get(rule), matcher.extract(path)];
      }
    }

    return [ROUTES.get("*"), {}];
  }

  function getHandle(req: IncomingMessage): [Handle, Params] {
    const [route, params] = lookupRoute(req.url || "/");

    let handle: Handle | undefined;

    if (route) {
      const method = (req.method?.toUpperCase() || "GET") as keyof Route;
      handle = route[method] || route.handle;
    }

    return [handle || notFound, params];
  }

  return async function (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>
  ) {
    try {
      const [handler, params] = getHandle(req);

      await handler(req, res, params);
    } catch (error) {
      serverError(req, res, error);
    }
  };
}
