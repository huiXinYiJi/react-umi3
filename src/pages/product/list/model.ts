import { getList, updateProduct, addProduct, delProduct } from '@/services/product';
import type { Effect, Reducer } from 'umi';

export type ProductListStateType = {
  list: API.ProductListType[];
  total: number;
  selectedPrds: API.ProductListType[]; // 选择的产品（添加产品用）
};

export type ProductListModelType = {
  namespace: string;
  state: ProductListStateType;
  effects: {
    fetch: Effect;
    delete: Effect;
    update: Effect;
    add: Effect;
  };
  reducers: {
    queryList: Reducer<Pick<ProductListStateType, 'list' | 'total'>>;
    setSelectedPrds: Reducer<Pick<ProductListStateType, 'selectedPrds'>>;
  };
};

const Model: ProductListModelType = {
  namespace: 'productList',
  state: {
    list: [],
    total: 0,
    selectedPrds: [],
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
    *delete({ payload, callback }, { call }) {
      const res = yield call(delProduct, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *update({ payload, callback }, { call }) {
      const res = yield call(updateProduct, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *add({ payload, callback }, { call }) {
      const res = yield call(addProduct, payload);
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
    setSelectedPrds(state, { payload }) {
      return {
        ...state,
        selectedPrds: payload,
      };
    },
  },
};

export default Model;
