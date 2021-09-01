import { getList, updateAdmin, addAdmin, delAdmin } from '@/services/admin';
import type { Effect, Reducer } from 'umi';

export type AdminStateType = {
  list: [];
  total: number;
};

export type AdminModelType = {
  namespace: string;
  state: AdminStateType;
  effects: {
    fetch: Effect;
    delete: Effect;
    update: Effect;
    add: Effect;
  };
  reducers: {
    queryList: Reducer<AdminStateType>;
  };
};

const Model: AdminModelType = {
  namespace: 'adminRole',
  state: {
    list: [],
    total: 0,
  },
  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const res = yield call(getList, payload);
      if (res && res.code === 200) {
        yield put({
          type: 'queryList',
          payload: res.data,
        });
        callback && callback(res);
      }
    },
    *delete({ payload, callback }, { call }) {
      const res = yield call(delAdmin, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *update({ payload, callback }, { call }) {
      const res = yield call(updateAdmin, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *add({ payload, callback }, { call }) {
      const res = yield call(addAdmin, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
  },

  reducers: {
    queryList(state, { payload }) {
      const { lists, count } = payload;
      return {
        ...state,
        list: lists,
        total: count,
      };
    },
  },
};

export default Model;
