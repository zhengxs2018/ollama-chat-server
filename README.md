```
  ######   :::        :::            :::     ::::    ::::      :::
:+:    :+: :+:        :+:          :+: :+:   +:+:+: :+:+:+   :+: :+:
+:+    +:+ +:+        +:+         +:+   +:+  +:+ +:+:+ +:+  +:+   +:+
+#+    +:+ +#+        +#+        +#++:++#++: +#+  +:+  +#+ +#++:++#++:
+#+    +#+ +#+        +#+        +#+     +#+ +#+       +#+ +#+     +#+
#+#    #+# #+#        #+#        #+#     #+# #+#       #+# #+#     #+#
  ######   ########## ########## ###     ### ###       ### ###     ###

欢迎使用 Ollama！
=====================

Connecting to http://127.0.0.1:1243
```

# OLLAAMA Chat Server

本仓库主要演示如何通过自定义服务，将 [ollama][ollama-repo-link] 完美适配 OpenAI 的输入输出。


> [!IMPORTANT]  
> 你需要启动一个 [ollama][ollama-repo-link] 的服务，并且确保 [API][ollama-api-docs-link] 可被正常调用。

本项目代码仅仅是请求转发以及兼容 OpenAI 协议。

> [!WARNING]  
> 本项目只支持 `node.js>=18`。

## 启动服务

```sh
# or pnpm install
$ yarn install

# 启动开发者服务
$ yarn dev
```

## 本地测试

```sh
# 启动本地对话功能
$ yarn chat
```

### 覆盖官方 SDK

可以在任何支持 OpenAI 格式的应用中使用

```ts
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://127.0.0.1:1243/v1",
  apiKey: "ollama", // 防止 SDK 报错
});

const completion = await openai.chat.completions.create({
  model: "llama",
  messages: [{ role: "user", content: "hello" }],
});

console.log(completion.choices[0].message.content);
```

## 部署到服务器

本项目代码构建后，可以在任何支持的环境中运行。

- [使用 PM2 启动](./doc/deploy/pm2.md)
- [使用 docker 启动](./doc/deploy/docker.md)

# 常见问题

### 与 [OpenAI compatibility](https://github.com/ollama/ollama/blob/main/docs/openai.md) 的区别？

本服务适配多个 openai 的请求地址，但速度和效率没有 ollama 的好，唯一的用处是作为 BFF 层，方便接入授权协议。

### 是否推荐作为生产项目？

不推荐，仅用于学习。

### 是否会持续维护此项目？

不一定，看情况可能会更新代码。

### 项目使用原生代码开发，是有什么含义么？

没有，为了学习新的 API，暂用不到框架。

## License

MIT

[ollama-repo-link]: https://github.com/ollama/ollama
[ollama-api-docs-link]: https://github.com/ollama/ollama/blob/main/docs/api.md
