import type { IRoute } from 'umi';
import { getRouters, getUser } from '@/utils/cache';
import { filterServerRoutes } from '@/utils/route.config';
import type { MenuDataItem } from '@ant-design/pro-layout';

export const dva = {
  config: {
    onError(err: any) {
      err.preventDefault();
      console.error(err.message);
    },
  },
};

let asyncRoutes: API.AuthListType[] = [];

type RoutesType = {
  routes: IRoute[];
  children?: IRoute[];
} & IRoute[];

// 初始化数据
export async function getInitialState() {
  return Object.assign(
    {},
    {
      userinfo: getUser(),
    },
  );
}

export function patchRoutes({ routes }: MenuDataItem) {
  // 从后端获取的路由数据
  asyncRoutes = getRouters();
  routes[1].routes = filterServerRoutes(routes, asyncRoutes);
  console.log('patchRoutes', routes[1].routes);
  return routes;
}

export function render(oldRender: () => void) {
  window.oldRender = () => {
    console.log('触发render');
    oldRender();
  };
  if (window.oldRender) {
    window.oldRender();
  }
}
