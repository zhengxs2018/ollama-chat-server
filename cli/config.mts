import { parseArgs } from "node:util";
import { extname, resolve } from "node:path";
import { createRequire } from "node:module";

import ora from "ora";

import { stringToArray } from "./util.mjs";

export interface UserConfig {
  apiKey: string;
  organization?: string;
  project?: string;
  baseURL: string;
  model: string;
  models: string[];
  system: string
  seed?: number;
  top_p?: number;
  temperature?: number;
  stop?: string[];
}

export async function getUserConfig(): Promise<UserConfig> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      port: { type: "string", short: "p", default: process.env.PORT || "1243" },
      host: {
        type: "string",
        short: "h",
        default: "127.0.0.1",
      },
      apiKey: {
        type: "string",
        short: "t",
        default: "ollama",
      },
      organization: {
        type: "string",
        short: "o",
      },
      project: {
        type: "string",
        short: "p",
      },
      model: {
        type: "string",
        short: "m",
        default: "llama3",
      },
      models: {
        type: "string",
        default: "",
      },
      system: {
        type: "string",
        short: "s",
        default: "You are a helpful assistant.",
      },
      temperature: {
        type: "string",
      },
      top_p: {
        type: "string",
      },
      seed: {
        type: "string",
      },
      stop: {
        type: "string",
      },
      config: {
        type: "string",
        short: "c",
      },
    },
    strict: false,
  });

  const [baseURL = normalizeURL(values.host as string, values.port as string)] =
    positionals;

  const config = {
    baseURL: baseURL,
    apiKey: values.apiKey as string,
    organization: values.organization as string,
    project: values.project as string,
    model: values.model as string,
    system: values.system as string,
  } as UserConfig;

  if (values.models) {
    config.models = stringToArray(values.models as string);
  } else {
    config.models = [];
  }

  if (values.temperature) {
    config.temperature = parseFloat(values.temperature as string);
  }

  if (values.top_p) {
    config.top_p = parseFloat(values.top_p as string);
  }

  if (values.seed) {
    config.seed = parseInt(values.seed as string, 10);
  }

  if (values.stop) {
    config.stop = stringToArray(values.stop as string);
  }

  if (values.configPath) {
    return Object.assign(
      config,
      await loadProjectConfig(values.configPath as string, config)
    );
  }

  return config;
}

async function loadProjectConfig(configPath: string, config: UserConfig) {
  console.clear();
  const spinner = ora("✦ Load config...").start();

  const impl = (mod: any) => {
    const exports = mod.default || mod;
    return typeof exports === "function" ? exports(config) : exports;
  };

  const esmLoader = (moduleId: string) => {
    return import(resolve(process.cwd(), moduleId)).then(impl);
  };

  const legacyLoader = (moduleId: string) => {
    return impl(createRequire(process.cwd())(moduleId));
  };

  const loaders: Record<string, (moduleId: string) => Promise<any>> = {
    ".mjs": esmLoader,
    ".cjs": esmLoader,
    ".js": esmLoader,
    ".json": legacyLoader,
  };

  const ext = extname(configPath);

  const loader = loaders[ext];

  if (!loader) {
    throw new Error(`Unsupported profile types: ${configPath}`);
  }

  try {
    return await loader(configPath);
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      err.code === "ERR_MODULE_NOT_FOUND"
    ) {
      throw new Error(`Configuration file does not exist: ${configPath}`);
    }

    throw err;
  } finally {
    spinner.stop();
  }
}

function normalizeURL(host: string, port: string) {
  const protocol = host.startsWith("http") ? "" : "http://";
  return `${protocol}${host}:${port}/v1`;
}
