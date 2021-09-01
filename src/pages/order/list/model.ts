import { getList, updateOrder, addOrder, delOrder, auditOrder, getProList, delOrderPro, exportOrder, shipOrder } from '@/services/order';
import type { Effect, Reducer } from 'umi';

export type OrderStateType = {
  list: API.OrderListType[];
  total: number;
  isover_money: number;
  total_money: number;
  count_list: {
    closeCount: number;
    hasTrace: number;
    refundCount: number;
    resetCount: number;
    successCount: number;
    waitAudit: number;
    waitHandle: number;
    waitTrace: number;
  };
};

export type OrderModelType = {
  namespace: string;
  state: OrderStateType;
  effects: {
    fetch: Effect;
    delete: Effect;
    update: Effect;
    add: Effect;
    audit: Effect;
    getOrderList: Effect;
    delOrderPro: Effect;
    export: Effect;
    ship: Effect;
  };
  reducers: {
    queryList: Reducer<OrderStateType>;
  };
};

const Model: OrderModelType = {
  namespace: 'order',
  state: {
    list: [],
    total: 0,
    isover_money: 0,
    total_money: 0,
    count_list: {
      closeCount: 0, //关闭的订单
      hasTrace: 0, // 已发货
      refundCount: 0, // 售后中
      resetCount: 0, // 重新处理
      successCount: 0, // 成功的订单
      waitAudit: 0, // 待审核
      waitHandle: 0, // 待处理
      waitTrace: 0, // 等待发货
    },
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
      const res = yield call(delOrder, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *update({ payload, callback }, { call }) {
      const res = yield call(updateOrder, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *add({ payload, callback }, { call }) {
      const res = yield call(addOrder, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *audit({ payload, callback }, { call }) {
      const res = yield call(auditOrder, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *getOrderList({ payload, callback }, { call }) {
      const res = yield call(getProList, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *delOrderPro({ payload, callback }, { call }) {
      const res = yield call(delOrderPro, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *export({ payload, callback }, { call }) {
      const res = yield call(exportOrder, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *ship({ payload, callback }, { call }) {
      const res = yield call(shipOrder, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
  },

  reducers: {
    queryList(state, { payload }) {
      const { lists, count, isover_money, total_money, count_list } = payload;
      return {
        ...state,
        list: lists,
        total: count,
        isover_money,
        total_money,
        count_list,
      };
    },
  },
};

export default Model;
