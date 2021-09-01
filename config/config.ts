import { defineConfig } from 'umi';
import proxy from './proxy';
import routes from './routes';
import type IWebpackChainConfig from 'webpack-chain';

// 开启gzip压缩
const CompressionWebpackPlugin = require('compression-webpack-plugin');
// 日期组件使用的moment库换成dayjs
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

export default defineConfig({
  // 菜单动态加载icon
  icons: [
    'HomeOutlined',
    'DashboardOutlined',
    'ProjectOutlined',
    'ScheduleOutlined',
    'OneToOneOutlined',
    'PictureOutlined',
    'InboxOutlined',
    'ShareAltOutlined',
    'SettingOutlined',
    'TeamOutlined',
    // 'UserOutlined',
    // 'DownOutlined',
    // 'UpOutlined',
    // 'DeleteOutlined',
  ],
  favicon: './favicon.ico', // public目录下文件
  publicPath: '/',
  // base: '/',  // 部署到非根目录时才需配置
  hash: true, // 开启打包文件的hash值后缀
  history: {
    type: 'hash',
  },
  title: '尊禧助手',
  define: {
    REACT_APP_PREFIX_URL: '/api',
    REACT_APP_FULL_TITLE: '尊禧订单管理系统',
    REACT_APP_TITLE: '尊禧助手',
    REACT_APP_WATERMASK: '尊禧助手',
    REACT_APP_WEBSITE: '尊禧鹿业',
    REACT_APP_BASE_URL: 'http://192.168.2.116:8080/api', // 用于本地测试dist连接api
  },
  // ant-design-pro 的布局
  // 开启配置,代码需要修改,请勿开启
  // layout: {
  //   name: 'Umi',
  //   locale: false,
  //   layout: 'side',
  // },
  dynamicImport: {
    loading: '@/Components/ILoading/index',
  },
  // antd: {
  //   dark: false,
  //   compact: true,
  // },
  locale: {
    default: 'zh-CN',
    antd: true,
    title: true,
    baseNavigator: false,
    baseSeparator: '-',
  },
  lessLoader: {
    modifyVars: {
      hack: `true; @import "~@/styles/mixins.less";`,
    },
  },
  cssLoader: {
    localsConvention: 'camelCase',
  },
  ignoreMomentLocale: true, // 忽略 moment 的 locale 文件
  dva: {
    immer: false,
    hmr: true,
    lazyLoad: true,
  },
  request: {
    dataField: 'data', // 接口字段 { success: boolean, data: any}
  },
  targets: {
    ie: 11,
  },
  // 设置 node_modules 目录下依赖文件的编译方式。
  nodeModulesTransform: {
    type: 'all', // 全部编译
  },
  fastRefresh: {},
  proxy: proxy,
  // scripts: [
  //   'https://unpkg.com/react@17.0.1/umd/react.production.min.js',
  //   'https://unpkg.com/react-dom@17.0.1/umd/react-dom.production.min.js',
  // ],
  // externals: {
  //   react: 'window.React',
  //   'react-dom': 'ReactDOM',
  // },
  chunks: ['antd', 'vendors', 'lodash', 'umi'], // 页面chunks加载顺序
  chainWebpack: function (config: IWebpackChainConfig) {
    config.merge({
      optimization: {
        splitChunks: {
          chunks: 'all', // 选择哪些 chunk 进行优化，有效值为 all|async|initial
          minSize: 30000, // 生成 chunk 的最小体积，默认20000 bytes
          minChunks: 2, // 拆分前必须共享模块的最小 chunks 数, 默认1
          maxInitialRequests: 3, // 入口点的最大并行请求数, 默认30
          automaticNameDelimiter: '.', // chunk的来源和名称间的分隔符, 默认~
          cacheGroups: {
            lodash: {
              name: 'lodash',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](lodash|lodash-es)/,
              priority: 12, // 抽取权重, 數字越大表示优先级越高
              enforce: true, // 无论这个包的大小，都会进行分包处理
            },
            antd: {
              name: 'antd',
              test: /[\\/]node_modules[\\/](@ant-design|antd)[\\/]/,
              chunks: 'all',
              priority: 11,
              enforce: true,
            },
            vendor: {
              name: 'vendors',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
            },
            // styles: {
            //   name: 'styles',
            //   test: /\.(le|c)ss$/,
            //   chunks: 'all',
            //   enforce: true,
            // },
          },
        },
      },
    });
    // //过滤掉momnet的那些不使用的国际化文件
    // config.plugin("replace").use(require("webpack").ContextReplacementPlugin).tap(() => {
    //   return [/moment[/\\]locale$/, /zh-cn/];
    // })

    //  使用day.js替换moment.js
    config.plugin('AntdDayjsWebpackPlugin').use(AntdDayjsWebpackPlugin);

    // 生产模式开启gzip
    if (process.env.NODE_ENV === 'production') {
      const prodGzipList = ['js', 'css'];
      config.plugin('compression-webpack-plugin').use(
        new CompressionWebpackPlugin({
          // filename: 文件名称，这里我们不设置，让它保持和未压缩的文件同一个名称
          algorithm: 'gzip', // 指定生成gzip格式
          test: new RegExp('\\.(' + prodGzipList.join('|') + ')$'), // 匹配哪些格式文件需要压缩
          threshold: 10240, //对超过10k的数据进行压缩
          minRatio: 0.6, // 压缩比例，值为0 ~ 1
        }),
      );
    }

    //* 移动 css js到对应文件夹
    const isDev = process.env.NODE_ENV === 'development';
    const hash = !isDev ? '.[contenthash:8]' : '';
    config.output.chunkFilename(`static/js/[name]${hash}.async.js`);
    config.output.filename(`static/js/[name]${hash}.js`);
    config.plugin('extract-css').tap((args) => [
      {
        ...args[0],
        chunkFilename: `static/css/[name]${hash}.chunk.css`,
        filename: `static/css/[name]${hash}.css`,
      },
    ]);
  },
  // 生产环境去除console日志打印
  terserOptions: {
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
    },
  },
  routes: routes,
});
