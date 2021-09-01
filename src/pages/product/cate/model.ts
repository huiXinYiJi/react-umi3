import { getProCateList, addProCate, updateProCate, delProCate } from '@/services/productCate';
import type { Effect, Reducer } from 'umi';

export type ProducCateStateType = {
  productCateList: API.ProducCateType[];
};

export type ProductCateModelType = {
  namespace: string;
  state: ProducCateStateType;
  effects: {
    fetchCate: Effect;
    deleteCate: Effect;
    updateCate: Effect;
    addCate: Effect;
  };
  reducers: {
    queryCateList: Reducer<ProducCateStateType>;
  };
};

const Model: ProductCateModelType = {
  namespace: 'productCate',
  state: {
    productCateList: [],
  },
  effects: {
    *fetchCate({ payload, callback }, { call, put }) {
      const res = yield call(getProCateList, payload);
      if (res && res.code === 200) {
        yield put({
          type: 'queryCateList',
          payload: res.data,
        });
        callback && callback(res);
      }
    },
    *deleteCate({ payload, callback }, { call }) {
      const res = yield call(delProCate, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *updateCate({ payload, callback }, { call }) {
      const res = yield call(updateProCate, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *addCate({ payload, callback }, { call }) {
      const res = yield call(addProCate, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
  },

  reducers: {
    queryCateList(state, { payload }) {
      return {
        ...state,
        productCateList: payload || [],
      };
    },
  },
};

export default Model;
