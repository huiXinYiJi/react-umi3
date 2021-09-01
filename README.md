# umi3 + ant-design-pro/antd 4 + ts

## Getting Started

Install dependencies,

```bash
$ yarn install
```

Start the dev server,

```bash
$ yarn start
```

打包

```bash
$ yarn build
```

打包分析

```bash
$ yarn build:analyze
```

## 兼容到IE11，11以下无法支持，需要更改到antd3, 目前umi3版本使用antd4


### 目录结构
```
├── config                   # umi 配置，包含路由，构建等配置
├── mock                     # 本地模拟数据 （未使用）
├── public
│   └── favicon.png          # Favicon
├── src
│   ├── assets               # 本地静态资源
│   ├── components           # 业务通用组件
│   ├── hooks                # 自定义hook
│   ├── layout               # 通用布局
│   ├── models               # 全局 dva model
│   ├── pages                # 业务页面入口和通用模板
│   ├── services             # 后台接口服务
│   ├── styles               # antd样式修改及样式变量
│   ├── utils                # 工具库
│   ├── wrappers             # 固定路由守卫 （未使用）
│   ├── access.ts            # 固定路由权限 （未使用）
│   ├── app.ts               # 运行时文件，登陆后动态路由重置
│   ├── global.less          # 全局样式
├── README.md
└── package.json
```


### 开发使用版本号
> 若git clone后启动项目出现异常，请使用以下node对应版本

node v14.16.0

npm v6.14.11


### 代码风格: Prettier

vscode 插件搭配使用: Prettier - Code formatter


