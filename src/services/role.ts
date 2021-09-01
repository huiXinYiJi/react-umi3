// 角色管理页面
import request from '@/utils/request';

// 角色列表
export async function roleList() {
  return request('/role', {
    method: 'get',
  });
}

// 角色对应权限
export async function getRoleAuth(params: { id: number }) {
  return request('/role/auth', {
    method: 'get',
    params: {
      ...params,
    },
  });
}

// 角色权限修改
export async function roleUpdateNode(params: { role_id: number; nodes: string }) {
  return request('/role/doAuth', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 角色 添加/更新
export async function roleAdd(params: { title: string; description: string }) {
  return request('/role/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 角色 添加/更新
export async function roleEdit(params: { id: number; title: string; description: string }) {
  return request('/role/edit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 角色 删除
export async function roleDel(params: { id: number }) {
  return request('/role/delete', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
