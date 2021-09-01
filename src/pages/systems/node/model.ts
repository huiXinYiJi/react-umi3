import { accessNode, accessAdd, accessEdit, accessDel } from '@/services/node';
import type { Effect, Reducer } from 'umi';

// 筛选空数组
const filterEmptyChildren = <T extends { children?: T[] }>(arr: T[]): T[] => {
  return arr.map((item) => {
    if (item.children) {
      if (item.children.length > 0) {
        item.children = filterEmptyChildren(item.children);
      } else {
        delete item.children;
      }
    }
    return item;
  });
};

export type NodeStateType = {
  list: API.AuthListType[];
};

export type NodeModelType = {
  namespace: string;
  state: NodeStateType;
  effects: {
    fetch: Effect;
    delete: Effect;
    add: Effect;
    edit: Effect;
  };
  reducers: {
    queryList: Reducer<NodeStateType>;
  };
};

const Model: NodeModelType = {
  namespace: 'node',
  state: {
    list: [],
  },
  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const res = yield call(accessNode, payload);
      if (res && res.code === 200) {
        const lists = filterEmptyChildren(JSON.parse(JSON.stringify(res.data)));
        yield put({
          type: 'queryList',
          payload: lists,
        });
        callback(res);
      }
    },
    *delete({ payload, callback }, { call }) {
      const res = yield call(accessDel, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *add({ payload, callback }, { call }) {
      const res = yield call(accessAdd, payload);
      if (res.code === 200) {
        callback(res);
      }
    },
    *edit({ payload, callback }, { call }) {
      const res = yield call(accessEdit, payload);
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
