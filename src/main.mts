import { createServer } from "node:http";

import { createRouter } from "./base/server/router.mjs";
import { HOST, PORT } from "./environment.mjs";

import * as OpenAICompletions from "./routes/completions.mjs";
import * as OpenAIChatCompletions from "./routes/chat.mjs";
import * as OpenAIEmbeddings from "./routes/embeddings.mjs";
import * as OpenAIModels from "./routes/models.mjs";
import * as OpenAIModel from "./routes/model.mjs";

const router = createRouter([
  // Compatible with OpenAI's official API calls
  ["/v1/embeddings", OpenAIEmbeddings],
  ["/v1/completions", OpenAICompletions],
  ["/v1/chat/completions", OpenAIChatCompletions],
  ["/v1/models", OpenAIModels],
  ["/v1/models/{model}", OpenAIModel],
  // fallback route
  ["*", (_, res) => res.end("hello, Ollama!")],
]);

const server = createServer(router);

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
