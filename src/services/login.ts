import request from '@/utils/request';

// 登陆
export async function accountLogin(params: API.LoginParamsType) {
  return request('/login/doLogin', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 退出
export async function logout() {
  return request('/login/loginOut', {
    method: 'get',
  });
}

// 重置密码
export async function resetPwd(params: API.ResetPwdParamsType) {
  return request('/login/edit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}
