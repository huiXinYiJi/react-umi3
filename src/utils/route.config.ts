/**
 * * 动态路由菜单数据整理相关方法
 */
import type { MenuDataItem } from '@ant-design/pro-layout';
import { cloneDeep, flattenDeep } from '@/utils';

/**
 * * @description: 路由权限
 * @param {string} pathname
 * @param {MenuDataItem} allRoutes
 * @return {Boolean}
 */
export const passAccess = (pathname: string, allRoutes: MenuDataItem[]): boolean => {
  const routes = flattenDeep(allRoutes, 'routes');
  const sameRouteArr = routes.filter((item: MenuDataItem) => item.path === pathname);
  const obj = sameRouteArr[sameRouteArr.length - 1];
  return !obj || !obj['unaccessible'];
};

// *按照layout分组
const groupBy = (arr: API.AuthListType[], key: Exclude<keyof API.AuthListType, 'children'>) => {
  const groups: { [k: string]: API.AuthListType[] } = {};
  cloneDeep(arr).map((item) => {
    let layout = item[key] || '';
    groups[layout] = groups[layout] || [];
    groups[layout].push(item);
  });
  return groups;
};

//* 找出所属layout的path
const findLayoutRoute = (
  item: API.AuthListType | undefined,
  oriRoutes: MenuDataItem[],
  serveRoutes: API.AuthListType[],
): MenuDataItem | undefined => {
  if (item === undefined) return undefined;
  if (item.pid !== 0) {
    const parent: API.AuthListType | undefined = serveRoutes.filter((ele) => ele.id === item.pid)[0];
    return parent !== undefined ? findLayoutRoute(parent, oriRoutes, serveRoutes) : undefined;
  } else {
    // 自身为一级目录
    return oriRoutes.filter((ele: MenuDataItem) => ele.layout === item.layout)[0];
  }
};

//* 找出所属所有父级
const findParentRoutes = (
  item: API.AuthListType | undefined,
  serveRoutes: API.AuthListType[],
  arr: API.AuthListType[] = [],
): MenuDataItem[] | undefined => {
  if (item !== undefined) {
    if (item.pid !== 0) {
      // 自身为子级目录
      const parent: API.AuthListType | undefined = serveRoutes.filter((ele) => ele.id === item.pid)[0];
      if (parent !== undefined) {
        arr.push(parent);
        return findParentRoutes(parent, serveRoutes, arr);
      }
    } else {
      // 自身为一级目录
      const p = serveRoutes.filter((ele: MenuDataItem) => ele.id === item.pid)[0];
      p && arr.push(p);
    }
  }
  return arr;
};

//* 添加 redirect 和 404
const addRedirectNomatch = (arr: MenuDataItem[], redirectRoute: MenuDataItem, noMatchRoute: MenuDataItem) => {
  if (arr && arr.length > 0) {
    return cloneDeep(arr).map((item: MenuDataItem) => {
      if (item.routes && item.routes.length > 0) {
        item.path !== item.routes[0].path && item.routes.unshift({ ...redirectRoute, path: item.path, redirect: item.routes[0].path });
        item.routes.push(noMatchRoute);
        item.routes = addRedirectNomatch(item.routes, redirectRoute, noMatchRoute);
      }
      return item;
    });
  } else {
    return [{ ...redirectRoute, path: '/', redirect: '/login' }, { ...noMatchRoute }];
  }
};

//*生成新路由
const generateRoute = (item: API.AuthListType, allRoutes: MenuDataItem[], flatAsyncRoutes: API.AuthListType[]) => {
  const { title, is_status, is_show, web_path, component } = item;
  const parent = findParentRoutes(item, flatAsyncRoutes);
  const parentPath = parent
    ?.map((item) => item.web_path)
    .reverse()
    .join('');
  const layoutRoute: MenuDataItem | undefined = findLayoutRoute(item, allRoutes, flatAsyncRoutes);
  const layoutPath = layoutRoute?.path === '/' ? '' : layoutRoute?.path; // layout所属路径

  // 目录数据
  if (is_status === 0 && component) {
    //* 新路由
    let newRoute = {
      title,
      name: title, //* 显示menu标题
      hideInMenu: is_show === 1,
    } as MenuDataItem;

    //* 路径
    if (web_path) {
      // 菜单跳转到外部地址时使用
      if (web_path.indexOf('(http://)|(https://)') !== -1) {
        newRoute.target = '_blank';
        newRoute.path = web_path;
      } else {
        newRoute.path = parentPath ? layoutPath + parentPath + web_path.toLowerCase() : layoutPath + web_path.toLowerCase();
      }
    }
    //*图标
    item.icon && (newRoute.icon = item.icon);
    //* cname标识对应路由
    const exactRoute = allRoutes.filter((ele: MenuDataItem) => ele.cname === item.component)[0];
    if (exactRoute) {
      newRoute = { ...exactRoute, ...newRoute };
    }
    if (item.children && item.children.length > 0) {
      const childRoutes = item.children.map((item) => generateRoute(item, allRoutes, flatAsyncRoutes)).filter((item) => item);
      childRoutes.length > 0 && (newRoute.routes = childRoutes);
    }
    return newRoute;
  }
};

//* 过滤后端收到的路由数据,并重构
export const filterServerRoutes = (routes: MenuDataItem[], asyncRoutes: API.AuthListType[]) => {
  const allRoutes = flattenDeep(routes, 'routes');
  const flatAsyncRoutes = flattenDeep(asyncRoutes);

  //* 后端数据 按layout分类
  const routesByLayout: { [k: string]: API.AuthListType[] } = groupBy(asyncRoutes, 'layout');
  //* 新路由 --> 按layout结构
  const routesWithLayout = [] as MenuDataItem[];
  Object.keys(routesByLayout).map((key: string) => {
    //* 原始layout路由
    const layoutRouteOri = cloneDeep(allRoutes.filter((ele: MenuDataItem) => ele.layout === key)[0]);
    //* 新的layout子路由
    const childrenRoutes = routesByLayout[key].map((item) => generateRoute(item, allRoutes, flatAsyncRoutes)) as MenuDataItem[];
    layoutRouteOri.routes = childrenRoutes;
    routesWithLayout.push(layoutRouteOri);
  });

  //* 添加 redirect 和 404
  const noMatchRoute = allRoutes.filter((ele: MenuDataItem) => ele.cname === '*')[0]; // 404组件
  const redirectRoute = allRoutes.filter((s) => s.redirect)[0]; // redirect组件
  const resultRoutes = addRedirectNomatch(routesWithLayout, redirectRoute, noMatchRoute);
  return resultRoutes;
};

//* 菜单用数据
export const MenuRender = (routes: MenuDataItem[]) => {
  const R = cloneDeep(routes);
  // Home 布局的目录放在最上面
  // const index = R.findIndex((item: MenuDataItem) => item.path === '/');
  // const homeRoutes = cloneDeep(R[index]);
  // R.splice(index, 1);
  // R.splice(0, 0, homeRoutes);
  // 路由筛选 有权限的 无hidden属性的路由
  const filterRoutes = (arr: MenuDataItem[]) => {
    return arr.filter((item) => {
      if (item.path && !item.unaccessible && !item.redirect) {
        if (item.routes && item.routes.length > 0) {
          item.routes = filterRoutes(item.routes);
        }
        return true;
      } else {
        return false;
      }
    });
  };
  const rootRoutes = filterRoutes(R);
  const result: MenuDataItem[] = [];
  rootRoutes.map((item: MenuDataItem) => {
    // 展开layout下路由
    if (item.routes) {
      result.push(...item.routes);
    } else {
      result.push(item);
    }
  });
  return result;
};
