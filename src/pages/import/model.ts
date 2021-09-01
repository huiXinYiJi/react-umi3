import { getImportedFiles, getImportedDetail } from '@/services/import';
import type { Effect, Reducer } from 'umi';

export type ImportStateType = {
  recordData: {
    list: API.ImportRecordType[];
    total: number;
  };
  detailData: {
    list: API.ImportDetailType[];
    total: number;
  };
};

export type ImportModelType = {
  namespace: string;
  state: ImportStateType;
  effects: {
    fetchRecord: Effect;
    fetchDetail: Effect;
  };
  reducers: {
    queryRecord: Reducer<Pick<ImportStateType, 'recordData'>>;
    queryDetail: Reducer<Pick<ImportStateType, 'detailData'>>;
  };
};

const Model: ImportModelType = {
  namespace: 'import',
  state: {
    recordData: {
      list: [],
      total: 0,
    },
    detailData: {
      list: [],
      total: 0,
    },
  },
  effects: {
    *fetchRecord({ payload }, { call, put }) {
      const res = yield call(getImportedFiles, payload);
      if (res && res.code === 200) {
        yield put({
          type: 'queryRecord',
          payload: res.data,
        });
      }
    },
    *fetchDetail({ payload }, { call, put }) {
      const res = yield call(getImportedDetail, payload);
      if (res && res.code === 200) {
        yield put({
          type: 'queryDetail',
          payload: res.data,
        });
      }
    },
  },

  reducers: {
    queryRecord(state, { payload }) {
      const { lists, count } = payload;
      return {
        ...state,
        recordData: {
          list: lists,
          total: count,
        },
      };
    },
    queryDetail(state, { payload }) {
      const { lists, count } = payload;
      return {
        ...state,
        detailData: {
          list: lists,
          total: count,
        },
      };
    },
  },
};

export default Model;
