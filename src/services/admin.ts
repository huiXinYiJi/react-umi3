/**
 * * 后台管理员页面
 */
import request from '@/utils/request';

// 管理员列表
export async function getList(params: API.AdminRoleGet) {
  return request('/manager', {
    method: 'get',
    params,
  });
}

// 管理员编辑
export async function updateAdmin(params: API.AdminRoleUpdate) {
  return request('/manager/edit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 管理员添加
export async function addAdmin(params: API.AdminRoleUpdate) {
  return request('/manager/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 管理员 删除
export async function delAdmin(params: { id: number }) {
  return request('/manager/delete', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
