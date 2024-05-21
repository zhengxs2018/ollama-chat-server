import type { OpenAI } from "openai";

/**
 * https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-completion
 */
export namespace Ollama {
  /**
   * See [Ollama Model File](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values)
   */
  export interface ModelParameters {
    /**
     * Enable Mirostat sampling for controlling perplexity. (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)
     *
     * @defaultValue 0
     */
    mirostat?: number;

    /**
     * Influences how quickly the algorithm responds to feedback from the generated text.
     *
     * A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive.
     *
     * @defaultValue 0.1
     */
    mirostat_eta?: number;

    /**
     * Controls the balance between coherence and diversity of the output.
     *
     * A lower value will result in more focused and coherent text.
     *
     * @defaultValue 5.0
     */
    mirostat_tau?: number;

    /**
     * Sets the size of the context window used to generate the next token.
     *
     * @defaultValue 2048
     */
    num_ctx?: number;

    /**
     * Sets how far back for the model to look back to prevent repetition.
     *
     *  (Default: 64, 0 = disabled, -1 = num_ctx)
     *
     * @defaultValue 64
     */
    repeat_last_n?: number;

    /**
     * Sets how strongly to penalize repetitions.
     *
     * A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient.
     *
     * @defaultValue 1.1
     */
    repeat_penalty?: number;

    /**
     * The temperature of the model. Increasing the temperature will make the model answer more creatively.
     *
     * @defaultValue 0.8
     */
    temperature?: number;

    /**
     * Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt.
     *
     * @defaultValue 0
     */
    seed?: number;

    /**
     * Sets the stop sequences to use. When this pattern is encountered the LLM will stop generating text and return.
     *
     * Multiple stop patterns may be set by specifying multiple separate stop parameters in a modelfile.
     */
    stop?: string | string[];

    /**
     * Tail free sampling is used to reduce the impact of less probable tokens from the output.
     *
     * A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting.
     *
     * @defaultValue 1
     */
    tfs_z?: number;

    /**
     * Maximum number of tokens to predict when generating text. (Default: 128, -1 = infinite generation, -2 = fill context)
     *
     * @defaultValue 128
     */
    num_predict?: number;

    /**
     * Reduces the probability of generating nonsense.
     *
     * A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative.
     *
     * @defaultValue 40
     */
    top_k?: number;

    /**
     * 	Works together with top-k.
     *
     * A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text.
     *
     * @defaultValue 0.9
     */
    top_p?: number;
  }

  export interface CompletionCreateParams {
    /**
     * (required) the model name
     */
    model?: string;
    /**
     * system message to (overrides what is defined in the [Modelfile](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#system).
     */
    system?: string;
    /**
     * the prompt to generate a response for
     */
    prompt?: string;
    /**
     * (optional) a list of base64-encoded images (for multimodal models such as llava)
     */
    images?: string[];
    /**
     *  the prompt template to use (overrides what is defined in the [Modelfile](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#template).
     */
    template?: string;
    /**
     * the context parameter returned from a previous request to /generate, this can be used to keep a short conversational memory
     */
    context?: number[];
    /**
     *  the format to return a response in. Currently the only accepted value is json
     */
    format?: "json";
    /**
     *  if `false` the response will be returned as a single response object, rather than a stream of objects
     */
    stream?: boolean;
    /**
     *  if `true` no formatting will be applied to the prompt. You may choose to use the raw parameter if you are specifying a full templated prompt in your request to the API
     */
    raw?: boolean;
    /**
     * controls how long the model will stay loaded into memory following the request (default: `5m`)
     */
    keep_alive?: string;
    /**
     * additional model parameters listed in the documentation for the {@link ModelParameters Modelfile} such as `temperature`
     */
    options?: ModelParameters;
  }

  export namespace Completion {
    export type FinishReason = "stop" | "length" | "content_filter";
  }

  export interface CompletionUsage {
    total_duration: number;
    load_duration: number;
    prompt_eval_count: number;
    prompt_eval_duration: number;
    eval_count: number;
    eval_duration: number;
  }

  export interface Completion extends CompletionUsage {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    done_reason: Completion.FinishReason;
    context: number[];
  }

  export interface CompletionChunk extends Partial<CompletionUsage> {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    done_reason?: Completion.FinishReason | null;
    context?: number[];
  }

  export interface ChatCompletionMessageParam {
    /**
     * the role of the message, either system, user or assistant
     */
    role: string;

    /**
     * the content of the message
     */
    content: string;

    /**
     * a list of images to include in the message (for multimodal models such as llava)
     */
    images?: string[];
  }

  export interface ChatCompletionCreateParams {
    /**
     * (required) the model name
     */
    model?: string;
    /**
     * the messages of the chat, this can be used to keep a chat memory
     */
    messages: ChatCompletionMessageParam[];
    /**
     *  the format to return a response in. Currently the only accepted value is json
     */
    format?: "json";
    /**
     *  if `false` the response will be returned as a single response object, rather than a stream of objects
     */
    stream?: boolean;
    /**
     * controls how long the model will stay loaded into memory following the request (default: `5m`)
     */
    keep_alive?: string;
    /**
     * additional model parameters listed in the documentation for the {@link ModelParameters Modelfile} such as `temperature`
     */
    options?: ModelParameters;
  }

  export interface ChatCompletion extends CompletionUsage {
    model: string;
    created_at: string;
    message: OpenAI.ChatCompletionMessage;
    done: true;
    done_reason?: Completion.FinishReason;
  }

  export interface ChatCompletionChunkBase extends Partial<CompletionUsage> {
    model: string;
    created_at: string;
    message: OpenAI.ChatCompletionChunk.Choice.Delta;
    done: boolean;
    done_reason?: Completion.FinishReason;
  }

  export interface ChatCompletionGenerationChunk
    extends ChatCompletionChunkBase {
    done: false;
  }

  export interface ChatCompletionFinishedChunk extends ChatCompletionChunkBase {
    done: true;
  }

  export type ChatCompletionChunk =
    | ChatCompletionChunkBase
    | ChatCompletionGenerationChunk
    | ChatCompletionFinishedChunk;

  export interface EmbeddingCreateParams {
    /**
     * name of model to generate embeddings from
     */
    model: string;

    /**
     * text to generate embeddings for
     */
    prompt: string;

    /**
     * additional model parameters listed in the documentation for the [Modelfile](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values) such as `temperature`
     */
    options?: ModelParameters;

    /**
     * controls how long the model will stay loaded into memory following the request (default: `5m`)
     */
    keep_alive?: string;
  }

  export interface Embedding {
    embedding: Array<number>;
  }

  export interface ModelDetails {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  }

  export interface Model {
    license: string;
    modelfile: string;
    parameters: string;
    template: string;
    details: ModelDetails;
  }

  export interface ModelsPage {
    models: ModelPage[];
  }

  export interface ModelPage {
    name: string;
    size: number;
    digest: string;
    details: ModelDetails;
    modified_at: string;
    expires_at: string;
  }
}
