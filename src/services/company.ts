/**
 * * 公司管理
 */
import request from '@/utils/request';

// 公司列表
export async function getCompanyList(params: { current?: number; pageSize?: number; name: string }) {
  return request('/user_corp/list', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 添加公司
export async function addCompany(params: { name: string; social_code: string }) {
  return request('/user_corp/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 编辑公司
export async function editCompany(params: API.CompanyListType) {
  return request('/user_corp/edit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}
