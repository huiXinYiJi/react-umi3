/**
 * * 商品相关
 */
import request from '@/utils/request';

// 商品列表
export async function getList(
  params: {
    current?: number;
    pageSize?: number;
  } & Partial<API.ProductListType>,
) {
  return request('/product/all', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 商品修改
export async function updateProduct(params: Partial<API.ProductListType>) {
  return request('/product/edit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 商品添加
export async function addProduct(params: Partial<API.ProductListType>) {
  return request('/product/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 商品 删除
export async function delProduct(params: { product_id: number }) {
  return request('/product/delete', {
    method: 'post',
    data: {
      ...params,
    },
  });
}
