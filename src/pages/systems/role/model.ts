import { roleList, getRoleAuth, roleUpdateNode, roleAdd, roleEdit, roleDel } from '@/services/role';
import type { Effect, Reducer } from 'umi';

export type RoleStateType = {
  list: API.RoleListType[];
};

export type RoleModelType = {
  namespace: string;
  state: RoleStateType;
  effects: {
    fetch: Effect;
    delete: Effect;
    add: Effect;
    edit: Effect;
    updateNode: Effect;
    fetchRolePermis: Effect;
  };
  reducers: {
    queryList: Reducer<RoleStateType>;
  };
};

const Model: RoleModelType = {
  namespace: 'role',
  state: {
    list: [],
  },
  effects: {
    *fetch({ _, callback }, { call, put }) {
      const res = yield call(roleList);
      if (res && res.code === 200) {
        yield put({
          type: 'queryList',
          payload: res.data,
        });
        callback && callback(res);
      }
    },
    *delete({ payload, callback }, { call }) {
      const res = yield call(roleDel, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *add({ payload, callback }, { call }) {
      const res = yield call(roleAdd, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *edit({ payload, callback }, { call }) {
      const res = yield call(roleEdit, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *updateNode({ payload, callback }, { call }) {
      const res = yield call(roleUpdateNode, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *fetchRolePermis({ payload, callback }, { call }) {
      const res = yield call(getRoleAuth, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
  },

  reducers: {
    queryList(state, { payload }) {
      return {
        ...state,
        list: payload,
      };
    },
  },
};

export default Model;
