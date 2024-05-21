import assert from "node:assert";
import type { OpenAI } from "openai";

import { flushObject, randomId } from "../../base/util.mjs";
import type { Ollama } from "../ollama.mjs";

export function mapToOllamaCompletionCreateParams(
  params: OpenAI.CompletionCreateParams
): Ollama.CompletionCreateParams {
  const model = params.model;

  const prompt = [params.prompt].flat().join("\n").trim();
  assert(!!prompt.toString(), "Prompt is required");

  return {
    stream: params.stream === true,
    model: model,
    prompt: prompt,
    options: mapToOllamaModelParameters(params),
  };
}

export function mapToOllamaModelParameters(
  params: Pick<
    OpenAI.CompletionCreateParams,
    | "seed"
    | "top_p"
    | "temperature"
    | "presence_penalty"
    | "frequency_penalty"
    | "stop"
    | "max_tokens"
  >
): Ollama.ModelParameters {
  return flushObject({
    seed: params.seed,
    top_p: params.top_p,
    temperature: params.temperature,
    presence_penalty: params.presence_penalty,
    frequency_penalty: params.frequency_penalty,
    stop: params.stop,
    num_predict: params.max_tokens,
  });
}

class OllamaToOpenAICompletionConverter {
  onChunk!: (chunk: string) => void;
  onClose!: () => void;
  onError!: (e?: unknown) => void;

  feed(chunk: string) {
    try {
      const data = JSON.parse(chunk) as Ollama.CompletionChunk;

      if (data.done) {
        this.onChunk("[DONE]");
        this.onClose();
        return;
      }

      const message = JSON.stringify(mapToOpenAICompletionResponse(data));
      this.onChunk(`data: ${message}\n\n`);
    } catch (e) {
      this.onError(e);
    }
  }
}

export class OllamaToOpenAICompletionStream extends TransformStream {
  constructor() {
    const converter = new OllamaToOpenAICompletionConverter();

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

export function mapToOpenAICompletionResponse(
  data: Ollama.Completion | Ollama.CompletionChunk
): OpenAI.Completion {
  const { prompt_eval_count = 0, eval_count = 0 } = data;

  return {
    id: `cmpl-${randomId()}`,
    object: "text_completion",
    created: new Date(data.created_at).getTime(),
    model: data.model,
    choices: [
      {
        text: data.response,
        index: 0,
        logprobs: null,
        finish_reason: mapToOpenAIFinishReason(data, true),
      },
    ],
    usage: {
      prompt_tokens: prompt_eval_count,
      completion_tokens: eval_count,
      total_tokens: eval_count + prompt_eval_count,
    },
  };
}

type CompletionResponse = {
  done: boolean;
  done_reason?: Ollama.Completion.FinishReason | null;
};

export function mapToOpenAIFinishReason(
  res: CompletionResponse,
  force?: boolean
): Ollama.Completion.FinishReason | null;

export function mapToOpenAIFinishReason(
  res: CompletionResponse,
  force: true
): Ollama.Completion.FinishReason;

export function mapToOpenAIFinishReason(
  res: CompletionResponse,
  force?: boolean
): Ollama.Completion.FinishReason | null {
  if (res.done_reason) {
    return res.done_reason;
  }

  if (res.done || force) {
    return "stop";
  }

  return null;
}
