import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { OpenAI } from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));

const openai = new OpenAI({
  baseURL: "http://localhost:1243/v1",
  apiKey: "ollama",
});

const completion = await openai.chat.completions.create({
  model: "llava-llama3",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "这幅图中有什么？",
        },
        {
          type: "image_url",
          image_url: {
            url: readFileSync(resolve(__dirname, "test.png"), "base64"),
          },
        },
      ],
    },
  ],
});

console.log(completion.choices[0].message.content);
