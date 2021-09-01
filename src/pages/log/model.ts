import { logList } from '@/services/log';
import type { Effect, Reducer } from 'umi';

export type LogStateType = {
  list: API.LogType[];
  total: number;
};

export type LogModelType = {
  namespace: string;
  state: LogStateType;
  effects: {
    fetch: Effect;
  };
  reducers: {
    queryList: Reducer<LogStateType>;
  };
};

const Model: LogModelType = {
  namespace: 'log',
  state: {
    list: [],
    total: 0,
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const res = yield call(logList, payload);
      if (res && res.code === 200) {
        yield put({
          type: 'queryList',
          payload: res.data,
        });
      }
    },
  },

  reducers: {
    queryList(state, { payload }) {
      const { list, count } = payload;
      return {
        ...state,
        list: list,
        total: count,
      };
    },
  },
};

export default Model;
