/**
 * * 渠道相关
 */
import request from '@/utils/request';

// 客户来源列表
export async function getSource() {
  return request('/client/source', {
    method: 'get',
  });
}

// 修改客户
export async function updateSource(params: Partial<API.CustomerListType>) {
  return request('/client/source/edit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 新增客户
export async function addSource(params: Partial<API.CustomerListType>) {
  return request('/client/source/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 客户 删除
export async function delSource(params: { id: string }) {
  return request('/client/source/delete', {
    method: 'post',
    data: {
      ...params,
    },
  });
}
