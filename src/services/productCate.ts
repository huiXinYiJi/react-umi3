/**
 * * 商品分类相关
 */
import request from '@/utils/request';

// 商品分类列表
export async function getProCateList(params: { name?: string }) {
  return request('/product/cate/lists', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 商品分类添加
export async function addProCate(params: { pid: number; name: string }) {
  return request('/product/cate/add', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 商品分类 编辑
export async function updateProCate(params: { id: number; pid?: number; name?: string }) {
  return request('/product/cate/edit', {
    method: 'post',
    data: {
      ...params,
    },
  });
}

// 商品分类 删除
export async function delProCate(params: { id: number }) {
  return request('/product/cate/delete', {
    method: 'post',
    data: {
      ...params,
    },
  });
}
