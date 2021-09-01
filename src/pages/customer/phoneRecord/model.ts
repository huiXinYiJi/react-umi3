import { getList, addPhoneRecord } from '@/services/phoneRecord';
import type { Effect, Reducer } from 'umi';

export type PhoneRecordStateType = {
  list: API.PhoneRecordType[];
  total: number;
};

export type PhoneRecordModelType = {
  namespace: string;
  state: PhoneRecordStateType;
  effects: {
    fetch: Effect;
    add: Effect;
  };
  reducers: {
    queryList: Reducer<PhoneRecordStateType>;
  };
};

const Model: PhoneRecordModelType = {
  namespace: 'phoneRecord',
  state: {
    list: [],
    total: 0,
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const res = yield call(getList, payload);
      if (res && res.code === 200) {
        yield put({
          type: 'queryList',
          payload: res.data,
        });
      }
    },
    *add({ payload, callback }, { call }) {
      const res = yield call(addPhoneRecord, payload);
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
