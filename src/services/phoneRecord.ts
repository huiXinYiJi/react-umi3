/**
 * * 电话记录
 */
import request from '@/utils/request';

// 电话记录列表
export async function getList(params: { pageSize: number; current: number } & Partial<API.PhoneRecordType>) {
  return request('/client/record', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 新增电话记录
export async function addPhoneRecord(params: Partial<API.PhoneRecordType>) {
  return request('/client/record/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}
