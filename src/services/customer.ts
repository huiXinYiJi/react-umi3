/**
 * * 客户相关
 */
import request from '@/utils/request';

// 客户列表
export async function getList(
  params: {
    current?: number;
    pageSize?: number;
  } & Partial<API.CustomerListType>,
) {
  return request('/client/all', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 修改客户
export async function updateCus(params: Partial<API.CustomerListType>) {
  return request('/client/edit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 新增客户
export async function addCus(params: Partial<API.CustomerListType>) {
  return request('/client/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 客户 删除
export async function delCus(params: { id: string }) {
  return request('/client/delete', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 客户状态 批量修改
export async function batchCusStatus(params: { id: number; cid: string }) {
  return request('/client/status/edits', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 分配/共享客户
export async function distributeCustomer(params: { cid: number[]; uid: number[] }) {
  return request('/client/shared/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 根据客户phone查拥有的订单列表
export async function getOrderByCus(params: { phone: string }) {
  return request('/client/order_list', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 根据当前用户 获取可分配用户列表
export async function getCusList() {
  return request('/client/shared', {
    method: 'get',
  });
}
