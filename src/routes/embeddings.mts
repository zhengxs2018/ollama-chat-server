import type { IncomingMessage, ServerResponse } from "node:http";

import type { OpenAI } from "openai";

import body from "../base/server/body.mjs";
import { embedding } from "../ollama/services/embeddings.mjs";

export const POST = async function (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
) {
  const params = await body.json<OpenAI.Embeddings.EmbeddingCreateParams>(req);
  const response = await embedding(params);

  res.writeHead(200, {
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(response));
};
