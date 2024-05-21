import type { IncomingMessage, ServerResponse } from "node:http";

import { showModel, deleteModel } from "../ollama/services/model.mjs";

export const GET = async function (
  _: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  params: Record<string, string>
) {
  const response = await showModel(params.model);

  res.writeHead(200, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(response));
};

export const DELETE = async function (
  _: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  params: Record<string, string>
) {
  const response = await deleteModel(params.model);

  res.writeHead(200, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(response));
};
