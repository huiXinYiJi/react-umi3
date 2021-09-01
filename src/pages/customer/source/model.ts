import { getSource, delSource, addSource, updateSource } from '@/services/source';
import type { Effect, Reducer } from 'umi';

export type SourceStateType = {
  list: API.SourceListType[];
};

export type SourceModelType = {
  namespace: string;
  state: SourceStateType;
  effects: {
    fetch: Effect;
    delete: Effect;
    update: Effect;
    add: Effect;
  };
  reducers: {
    queryList: Reducer<SourceStateType>;
  };
};

const Model: SourceModelType = {
  namespace: 'source',
  state: {
    list: [],
  },
  effects: {
    *fetch({ _, callback }, { call, put }) {
      const res = yield call(getSource);
      if (res && res.code === 200) {
        yield put({ type: 'queryList', payload: res.data });
        callback && callback(res.data);
      }
    },
    *delete({ payload, callback }, { call }) {
      const res = yield call(delSource, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *update({ payload, callback }, { call }) {
      const res = yield call(updateSource, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *add({ payload, callback }, { call }) {
      const res = yield call(addSource, payload);
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
