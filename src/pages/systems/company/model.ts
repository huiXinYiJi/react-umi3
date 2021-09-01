import { getCompanyList, editCompany, addCompany } from '@/services/company';
import type { Effect, Reducer } from 'umi';

export type CompanyStateType = {
  list: [];
  total: number;
};

export type CompanyModelType = {
  namespace: string;
  state: CompanyStateType;
  effects: {
    fetch: Effect;
    edit: Effect;
    add: Effect;
  };
  reducers: {
    queryList: Reducer<CompanyStateType>;
  };
};

const Model: CompanyModelType = {
  namespace: 'company',
  state: {
    list: [],
    total: 0,
  },
  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const res = yield call(getCompanyList, payload);
      if (res && res.code === 200) {
        yield put({
          type: 'queryList',
          payload: res.data,
        });
        callback && callback(res);
      }
    },
    *edit({ payload, callback }, { call }) {
      const res = yield call(editCompany, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *add({ payload, callback }, { call }) {
      const res = yield call(addCompany, payload);
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
