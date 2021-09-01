import { getCookie } from '@/utils';
/**存储token */
const TokenKey = 'jyt';

export function getToken(): string {
  return getCookie(TokenKey);
}

/**存储routers */
const RoutersName = 'admin-routers';

export function setRouters(routers: []): void {
  const routesJson = JSON.stringify(routers);
  window.localStorage.setItem(RoutersName, routesJson);
  // document.cookie = `${RoutersName}=${routesJson}`;
}

export function getRouters(): API.AuthListType[] {
  const routes = window.localStorage.getItem(RoutersName); // getCookie(RoutersName);
  return JSON.parse(routes || '[]');
}

/**存储userinfo */
const UserKey = 'admin-userinfo';

export function getUser(): API.UserParamsType {
  const userinfo = window.localStorage.getItem(UserKey); // getCookie(UserKey);
  return JSON.parse(userinfo || '{}');
}

export function setUser(val: object): void {
  window.localStorage.setItem(UserKey, JSON.stringify(val));
  // document.cookie = `${UserKey}=${JSON.stringify(val)}`;
}

export function removeUser(): void {
  // document.cookie = UserKey + '=;expires=' + new Date(0).toUTCString();
  window.localStorage.removeItem(UserKey);
}

// 清除所有缓存数据session和cookies
export function clearCache(): void {
  window.localStorage.clear();
  var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
  if (keys) {
    for (let i = keys.length; i--; ) {
      document.cookie = keys[i] + '=;expires=' + new Date(0).toUTCString();
    }
  }
}
