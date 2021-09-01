export default {
  '/api': {
    target: 'http://192.168.2.200:8080/api', // 线下
    // target: 'http://192.168.2.116:8080/api', // cl
    // target: 'http://192.168.2.114:18080/api', //sj
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  },
};
