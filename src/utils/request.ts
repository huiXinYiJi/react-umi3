import { message, notification } from 'antd';
import { history } from 'umi';
import { extend } from 'umi-request';
import { clearCache } from './cache';

const baseURL = REACT_APP_PREFIX_URL; // process.env.NODE_ENV === 'development' ? REACT_APP_PREFIX_URL : REACT_APP_BASE_URL;

const codeMessage: { [status: number]: string } = {
  // 200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

// 异常处理程序(HTTP响应状态的异常)
const errorHandler = (error: { response: Response }): Response => {
  const { response } = error;
  // console.log('error', error, response);
  if (response && response.status) {
    const errortext = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errortext,
    });
  } else {
    notification.error({
      message: '网络异常',
      description: '您的网络发生异常，无法连接服务器。',
    });
  }
  return response;
};

const service = extend({
  errorHandler, // 默认错误处理
  prefix: baseURL,
  credentials: 'include', // 默认请求是否带上cookie
  timeout: 60000,
  headers: {
    'x-type': 'admin',
  },
  requestType: 'form',
});

// 添加请求拦截器
service.interceptors.request.use((url, options) => {
  // if (getToken()) {
  //   options.headers = { ...options.headers, token: getToken() };
  // }
  return {
    options,
    url,
  };
});

// 添加响应拦截器
service.interceptors.response.use(async (response) => {
  if (response.status !== 200) {
    return response;
  }
  const res = await response.clone().json();
  const code = parseInt(res.code);
  res.success = code === 200;
  if (code !== 200) {
    // 10000: 无权限; -1: 退出登陆
    if (code === -1) {
      message.warning({ content: res.msg, duration: 5 });
      clearCache();
      history.replace('/login');
    } else if (code === 10000) {
      message.error({
        content: res.msg,
        duration: 5,
        onClose: () => {
          history.goBack();
        },
      });
    } else {
      message.error({ content: res.msg, duration: 3 });
    }
  }
  return res;
});

export default service;
