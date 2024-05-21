import type { OpenAI } from "openai";

import { flushObject, randomId } from "../../base/util.mjs";
import { mapToOpenAIFinishReason } from "./completions.mjs";
import type { Ollama } from "../ollama.mjs";
import { downloadImageToBase64 } from "../../base/download.mjs";
import { makeStatusError } from "../../base/error.mjs";

/**
 * TODO support images params
 * see https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values
 */
export async function mapToOllamaChatCompletionCreateParams(
  params: OpenAI.ChatCompletionCreateParams
): Promise<Ollama.ChatCompletionCreateParams> {
  const model = params.model;

  const format =
    params.response_format?.type === "json_object" ? "json" : undefined;

  const options = flushObject({
    seed: params.seed,
    top_p: params.top_p,
    temperature: params.temperature,
    presence_penalty: params.presence_penalty,
    frequency_penalty: params.frequency_penalty,
    stop: params.stop,
    num_ctx_tokens: params.max_tokens,
  });

  const messages = await Promise.all(
    params.messages.map(mapToOllamaChatCompletionMessageParam)
  );

  return {
    stream: params.stream === true,
    model: model,
    messages: messages,
    format: format,
    options: options,
  };
}

export async function mapToOllamaChatCompletionMessageParam(
  param: OpenAI.ChatCompletionMessageParam
): Promise<Ollama.ChatCompletionMessageParam> {
  const message: Ollama.ChatCompletionMessageParam = {
    role: param.role,
    content: "",
  };

  const content = param.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part.type === "text") {
        message.content = part.text;
      } else if (part.type === "image_url") {
        const url = part.image_url.url;

        if (url.startsWith("http")) {
          message.images = [await downloadImageToBase64(url)];
        } else {
          message.images = [url];
        }
      }
    }
  } else if (content) {
    message.content = content;
  }

  return message;
}

export function mapToOpenAIChatCompletion(
  data: Ollama.ChatCompletion
): OpenAI.ChatCompletion {
  const { model, message, created_at, eval_count } = data;

  const choice: OpenAI.ChatCompletion.Choice = {
    index: 0,
    message: message,
    logprobs: null,
    finish_reason: mapToOpenAIFinishReason(data, true),
  };

  return {
    id: `chatcmpl-${randomId()}`,
    choices: [choice],
    created: Date.parse(created_at),
    model: model,
    object: "chat.completion",
    usage: {
      completion_tokens: eval_count,
      prompt_tokens: 0,
      total_tokens: eval_count,
    },
  };
}

class OllamaToOpenAIChatCompletionConverter {
  onChunk!: (chunk: string) => void;
  onClose!: () => void;
  onError!: (e?: unknown) => void;

  feed(chunk: string) {
    try {
      const data = JSON.parse(chunk);

      if (data.done) {
        this.onChunk("[DONE]");
        this.onClose();
        return;
      }

      const message = JSON.stringify(mapToOpenAIChatCompletionChunk(data));
      this.onChunk(`data: ${message}\n\n`);
    } catch (e) {
      this.onError(e);
    }
  }
}

export class OllamaToOpenAIChatCompletionStream extends TransformStream {
  constructor() {
    const converter = new OllamaToOpenAIChatCompletionConverter();

    super({
      start(controller) {
        converter.onChunk = (chunk) => controller.enqueue(chunk);
        converter.onClose = () => controller.terminate();
        converter.onError = (e) => controller.error(e);
      },
      transform(chunk) {
        converter.feed(chunk);
      },
    });
  }
}

export function mapToOpenAIChatCompletionChunk(
  data: Ollama.ChatCompletionChunk & { error: string }
): OpenAI.ChatCompletionChunk {
  if (data.error) {
    throw makeStatusError(500, { message: data.error });
  }

  const { model, created_at, message, eval_count } = data;

  const choice: OpenAI.ChatCompletionChunk.Choice = {
    index: 0,
    delta: message,
    finish_reason: mapToOpenAIFinishReason(data),
  };

  return {
    id: `chatcmpl-${randomId()}`,
    choices: [choice],
    created: Date.parse(created_at),
    model: model,
    object: "chat.completion.chunk",
    usage: {
      completion_tokens: eval_count || 0,
      prompt_tokens: 0,
      total_tokens: eval_count || 0,
    },
  };
}
