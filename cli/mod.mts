import OpenAI from "openai";
import { castToError } from "openai/core.mjs";

import colors from "ansi-colors";
import enquirer from "enquirer";
import ora from "ora";

import { UserConfig, getUserConfig } from "./config.mts";

const BANNER = `
  ######   :::        :::            :::     ::::    ::::      :::     
:+:    :+: :+:        :+:          :+: :+:   +:+:+: :+:+:+   :+: :+:   
+:+    +:+ +:+        +:+         +:+   +:+  +:+ +:+:+ +:+  +:+   +:+  
+#+    +:+ +#+        +#+        +#++:++#++: +#+  +:+  +#+ +#++:++#++: 
+#+    +#+ +#+        +#+        +#+     +#+ +#+       +#+ +#+     +#+ 
#+#    #+# #+#        #+#        #+#     #+# #+#       #+# #+#     #+# 
  ######   ########## ########## ###     ### ###       ### ###     ### 
                                            
欢迎使用 ${colors.cyan("Ollama")}！
=====================

Connecting to %s`;

const AI_MESSAGE_FORMAT = `${colors.blueBright("⚉")} 助手 ${colors.dim(
  "·"
)} %s`;

const MSG_ERROR_FORMAT = `${colors.redBright("✘")} 系统 ${colors.dim("·")} %s`;

const config = await getUserConfig();
const openai = await createOpenAI(config);

await ensureChatModels(config);

const historyMessages: OpenAI.ChatCompletionMessageParam[] = [];

const commands = new Map([
  [
    "/new",
    () => {
      historyMessages.length = 0;
      showBanner();
      console.log(AI_MESSAGE_FORMAT, "好的，让我们重新开始吧。");
      console.log("");
    },
  ],
  [
    "/select-model",
    async () => {
      const rest = await enquirer.prompt<{ model: string }>({
        type: "autocomplete",
        name: "model",
        message: "选择一个模型",
        choices: config.models,
      });

      showBanner();
      console.log(
        AI_MESSAGE_FORMAT,
        `好的，现在让我们使用 ${rest.model} 进行对话吧`
      );
      console.log("");
      config.model = rest.model;
    },
  ],
  [
    "/bye",
    () => {
      console.clear();
      console.log(AI_MESSAGE_FORMAT, "好的，期待我们下一次相遇！");
      process.exit(0);
    },
  ],
]);

showBanner();
startChat();

function showBanner() {
  console.clear();
  console.log(BANNER, config.baseURL);
  console.log("");
}

async function startChat() {
  while (true) {
    const prompt = await getUserInput();
    if (prompt.startsWith("/")) {
      await execCommand(prompt);
      continue;
    }

    const spinner = ora("Thinking...").start();

    const content = await sendChatRequest(prompt).catch((e) => castToError(e));

    spinner.stop();

    if (content instanceof Error) {
      console.error(MSG_ERROR_FORMAT, content.message);
      console.log("");
      continue;
    }

    console.log(AI_MESSAGE_FORMAT, content);
    console.log("");

    historyMessages.push(
      {
        role: "user",
        content: prompt,
      },
      {
        role: "assistant",
        content: content,
      }
    );
  }
}

function createOpenAI(config: UserConfig) {
  return new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    project: config.project,
    organization: config.organization,
  });
}

async function ensureChatModels(config: UserConfig) {
  const remoteModels = await getModels(openai);

  if (config.models.length) {
    config.models = config.models.filter((m) => remoteModels.includes(m));
  }

  if (config.models.length === 0) {
    config.models = remoteModels;
  }

  config.model = config.models.includes(config.model)
    ? config.model
    : config.models[0];
}

async function getModels(openai: OpenAI) {
  console.clear();
  const spinner = ora("✦ Load ai models...").start();

  const models = await openai.models.list().catch((e) => castToError(e));

  spinner.stop();

  if (models instanceof Error) {
    throw models;
  }

  return models.getPaginatedItems().map((m) => m.id);
}

async function getUserInput() {
  const { prompt } = await enquirer.prompt<{ prompt: string }>({
    type: "text",
    name: "prompt",
    message: "你说",
    required: true,
    // @ts-ignore
    footer() {
      return colors.dim('(输入 "/" 回车，可选择指令)');
    },
  });

  return prompt;
}

async function execCommand(cmd: string) {
  if (!commands.has(cmd)) {
    const rest = await enquirer.prompt<{ command: string }>({
      type: "autocomplete",
      name: "command",
      message: "选择指令",
      choices: Array.from(commands.keys()),
    });

    cmd = rest.command;
  }

  const handle = commands.get(cmd);
  if (handle) await handle();
}

async function sendChatRequest(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: config.model,
    messages: [
      {
        role: "system",
        content: config.system,
      },
      ...historyMessages,
      { role: "user", content: prompt },
    ],
  });

  return completion.choices[0].message.content!;
}
