import { getList, updateCus, addCus, delCus, batchCusStatus, distributeCustomer, getOrderByCus, getCusList } from '@/services/customer';
import type { Effect, Reducer } from 'umi';

export type CustomerStateType = {
  list: API.CustomerListType[]; // 客户列表数据
  total: number; // 客户列表 数量
};

export type CustomerModelType = {
  namespace: string;
  state: CustomerStateType;
  effects: {
    fetch: Effect;
    delete: Effect;
    update: Effect;
    add: Effect;
    batchStatus: Effect;
    distribute: Effect;
    orderListByCus: Effect;
    cusListByCur: Effect;
  };
  reducers: {
    queryList: Reducer<CustomerStateType>;
  };
};

const Model: CustomerModelType = {
  namespace: 'customer',
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
    *delete({ payload, callback }, { call }) {
      const res = yield call(delCus, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *update({ payload, callback }, { call }) {
      const res = yield call(updateCus, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *add({ payload, callback }, { call }) {
      const res = yield call(addCus, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *batchStatus({ payload, callback }, { call }) {
      const res = yield call(batchCusStatus, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *distribute({ payload, callback }, { call }) {
      const res = yield call(distributeCustomer, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    // 客户信息里面的订单列表
    *orderListByCus({ payload, callback }, { call }) {
      const res = yield call(getOrderByCus, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    // 可分配的下拉列表
    *cusListByCur({ _, callback }, { call }) {
      const res = yield call(getCusList);
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
