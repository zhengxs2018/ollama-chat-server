import { type AssertionError } from "node:assert";
import { STATUS_CODES } from "node:http";
import { format } from "node:util";

type ErrorObject = {
  message?: string | undefined;
  type?: unknown | undefined;
  param?: unknown | undefined;
  code?: string | undefined;
};

export class InternalServerError extends Error {
  expose: boolean = true;
  status?: number;
  type?: unknown | undefined;
  param?: unknown | undefined;
  code?: string | undefined;

  constructor(status?: number, error: ErrorObject = {}, message?: string) {
    super(InternalServerError.makeMessage(status, error, message));

    this.status = status;

    const data = error as Record<string, any>;

    this.code = data?.["code"];
    this.param = data?.["param"];
    this.type = data?.["type"];
  }

  toString() {
    return JSON.stringify({
      message: this.message,
      error: {
        message: this.message,
        code: this.code,
        type: this.type,
        param: this.param,
      },
    });
  }

  private static makeMessage(
    status: number | undefined,
    error: any,
    message: string | undefined
  ) {
    const msg = error?.message
      ? typeof error.message === "string"
        ? error.message
        : JSON.stringify(error.message)
      : error
      ? JSON.stringify(error)
      : message;

    if (status && msg) {
      return `${status} ${msg}`;
    }

    if (status) {
      return `${status} ${STATUS_CODES[status]}`;
    }

    if (msg) {
      return msg;
    }

    return "(no status code or body)";
  }
}

export function makeStatusError(
  status: number | undefined,
  error: ErrorObject | undefined,
  message?: string | undefined
) {
  return new InternalServerError(status, error, message);
}

export function isAssertionError(err: Error): err is AssertionError {
  // Note: Support for AssertionError from other libraries.
  return err.name === "AssertionError";
}

export function isInternalError(err: Error): err is InternalServerError {
  return "expose" in err && "status" in err && typeof err.status === "number";
}

export function castToError(err?: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(format("non-error thrown: %j", err));
}
