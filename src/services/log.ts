import request from '@/utils/request';

// 操作记录
export async function logList(params: { pageSize: number; current: number } & API.LogType) {
  return request('/action_logs/list', {
    method: 'post',
    data: {
      ...params,
    },
  });
}
