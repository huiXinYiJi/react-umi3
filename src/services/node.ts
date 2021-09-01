/**
 * * 权限节点页面
 */
import request from '@/utils/request';

// 权限节点列表
export async function accessNode() {
  return request('/access', {
    method: 'get',
  });
}

// 权限节点添加/修改
export async function accessAdd(params: Partial<API.AuthListType>) {
  return request('/access/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 权限节点添加/修改
export async function accessEdit(params: Partial<API.AuthListType>) {
  return request('/access/edit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 权限节点添加/修改
export async function accessDel(params: { id: number }) {
  return request('/access/delete', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
