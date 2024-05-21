import type { ServerResponse } from "node:http";

export function isFinished(res: ServerResponse) {
  return res.writableFinished || res.finished;
}

export function canWritable(res: ServerResponse) {
  if (res.writableEnded || isFinished(res)) {
    return false;
  }

  const socket = res.socket;

  // There are already pending outgoing res, but still writable
  // https://github.com/nodejs/node/blob/v4.4.7/lib/_http_server#L486
  return !socket || socket.writable;
}
