# 使用 PM2 启动

项目主要以学习为主，请谨慎用于生产环境。

## 一、编译代码

你需要手动编译代码。

```sh
$ pnpm build
```

## 二、上传文件

你可以使用任何工具连接你的服务，然后上传以下文件。

> [!IMPORTANT]  
> 本项目生产模式下是无依赖的，无需进行 npm install.

```
Project Files/
│   └── dist/
│      └── main.js
└── package.json
```

## 三、创建 PM2 配置

创建配置文件，可以通过 [pm2 init](https://pm2.keymetrics.io/docs/usage/application-declaration/) 自动生成。

> [!NOTE]  
> 如果已经创建，可以跳过

```js
// ecosystem.config.js
// see https://pm2.keymetrics.io/docs/usage/environment/
module.exports = {
  apps: [
    {
      name: "ollama-chat-server",
      script: "dist/main.js",
      env: {
        // 本服务启动端口
        PORT: "1234",
        // Ollama API 服务地址
        // See https://github.com/ollama/ollama/blob/main/docs/api.md
        OLLAMA_BASE_URL: "http://127.0.0.1:11434",
      },
    },
  ],
};
```

## 四、启动服务

```sh
$ pm2 start ecosystem.config.js
```
