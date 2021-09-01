import { setUser, setRouters, getUser, getRouters, clearCache } from '@/utils/cache';
import { accountLogin, logout } from '@/services/login';
import { message } from 'antd';
import type { Effect, Reducer } from 'umi';

export type AppStateType = {
  userinfo: API.UserParamsType;
  asyncRoutes: API.AuthListType[];
};

export type AppModelType = {
  namespace: string;
  state: AppStateType;
  effects: {
    fetchLogin: Effect;
    fetchLogout: Effect;
  };
  reducers: {
    saveInfo: Reducer<AppStateType>;
    clearInfo: Reducer<AppStateType>;
  };
};

const Model: AppModelType = {
  namespace: 'app',
  state: {
    userinfo: getUser(),
    asyncRoutes: getRouters(),
  },
  effects: {
    *fetchLogin({ payload, callback }, { call, put }) {
      const res = yield call(accountLogin, payload);
      if (res && res.code === 200) {
        yield put({
          type: 'saveInfo',
          payload: res.data,
        });
        const { access_list: authList, ...rest } = res.data;
        if (authList && authList.length > 0) {
          setUser(rest);
          setRouters(authList);
          window.oldRender(); // 重新触发render
          callback(res.data);
        } else {
          clearCache();
          message.warning('您的账号未授予任何可访问的页面权限，请联系管理员！');
        }
      }
    },
    *fetchLogout({ callback }, { call, put }) {
      // 前端登出
      const res = yield call(logout);
      if (res.code === 200) {
        yield put({ type: 'clearInfo' });
        callback();
      }
    },
  },

  reducers: {
    saveInfo(state, { payload }) {
      return {
        ...state,
        userinfo: payload || {},
        asyncRoutes: payload.access_list || [],
      };
    },
    clearInfo(state, { payload }) {
      return {
        ...state,
        userinfo: payload || {},
        asyncRoutes: payload || [],
      };
    },
  },
};

export default Model;
