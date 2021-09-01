/**
 * * 订单相关
 */
import request from '@/utils/request';
import type { RcFile } from 'rc-upload/lib/interface';

// 订单列表
export async function getList(
  params: API.OrderListType & {
    current: number;
    pageSize: number;
  },
) {
  return request('/order/lists', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 修改订单
export async function updateOrder(params: Partial<API.OrderListType>) {
  return request('/order/edit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 新增订单
export async function addOrder(params: Partial<API.OrderListType>) {
  return request('/order/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 订单 删除
export async function delOrder(params: { id: string }) {
  return request('/order/delete', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 订单 审核
export async function auditOrder(params: { id: string; order_status: number; turn_down?: string }) {
  return request('/order/audit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 订单 获取产品
export async function getProList(params: { order_id: number }) {
  return request('/order/sku/list', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 订单 产品 删除
export async function delOrderPro(params: { id: number }) {
  return request('/order/sku/delete', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 导出订单
export async function exportOrder(params: Partial<Omit<API.OrderListType, 'id'>>) {
  return request('/depository/download', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 仓库 发货
export async function shipOrder(params: { tracking_company: string; id: number; tracking_no: string }) {
  return request('/storehouse/ship', {
    method: 'post',
    data: {
      ...params,
    },
  });
}
