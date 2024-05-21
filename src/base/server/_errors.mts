import { type IncomingMessage, type ServerResponse } from "node:http";
import { Buffer } from "node:buffer";

import { castToError, isAssertionError, isInternalError } from "../error.mjs";
import { canWritable } from "./response.mjs";

export const serverError = (
  _: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  err?: unknown
) => {
  if (!canWritable(res)) return;

  const error = castToError(err);

  let statusCode: number | undefined;
  let message: string = error.message;

  if (isInternalError(error)) {
    statusCode = error.status;
    message = error.toString();
  } else if (isAssertionError(error)) {
    statusCode = 422;
  }

  if (!res.headersSent) {
    if (res.hasHeader("content-type") !== true) {
      res.setHeader("content-type", "text/plan");
    }

    res.setHeader("content-length", Buffer.byteLength(message as string));
  }

  res.statusCode = statusCode || 500;
  res.end(message, "utf8");
};

export const notFound = (
  _: IncomingMessage,
  res: ServerResponse<IncomingMessage>
) => {
  res.writeHead(404, {
    "content-type": "text/plain",
  });
  res.write("Not Found", "utf8");
  res.end();
};
