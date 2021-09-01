/**
 * * 上传相关
 */
import request from '@/utils/request';

// 批量发货
export async function batchShip(formData: FormData) {
  return request('/depository/upload', {
    method: 'post',
    data: formData,
  });
}

// 导入订单
export async function importOrder(formData: FormData) {
  return request('/depository/import/order', {
    method: 'post',
    data: formData,
  });
}

// 获取上传文件
export async function getImportedFiles(
  params: API.ImportRecordType & {
    current: number;
    pageSize: number;
  },
) {
  return request('/depository/import/all', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 获取文件详情
export async function getImportedDetail(params: { current: number; pageSize: number; id: number } & API.ImportDetailType) {
  return request('/depository/import/detail', {
    method: 'post',
    data: {
      ...params,
    },
  });
}
