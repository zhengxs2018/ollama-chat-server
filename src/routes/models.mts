import type { IncomingMessage, ServerResponse } from "node:http";

import { listModels } from "../ollama/services/models.mjs";

export const GET = async function (
  _: IncomingMessage,
  res: ServerResponse<IncomingMessage>
) {
  const response = await listModels();

  res.writeHead(200, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(response));
};
