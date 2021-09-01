import React, { useState, useEffect } from 'react';
import type { BasicLayoutProps as ProLayoutProps, Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-layout';
import ProLayout, { PageHeaderWrapper } from '@ant-design/pro-layout';
// import { getMenuData } from '@ant-design/pro-layout';
import { AuthComponent, RightContent, Footer } from '@/components';
import { Link, Icon, history, useLocation, useSelector } from 'umi';
import { MenuRender } from '@/utils/route.config';
import { Space } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import type { ConnectState } from '@/models/connect';
import useWinSize from '@/hooks/useWinSize';

type HomeLayoutPropsType = {
  routes: MenuDataItem[];
} & Partial<ProLayoutProps>;

const HomeLayout: React.FC<HomeLayoutPropsType> = (props) => {
  const app = useSelector((state: ConnectState) => state.app);
  const { userinfo } = app;
  const { routes } = props;
  const location = useLocation();
  const size = useWinSize();
  const menuData = MenuRender(routes[1].routes);

  // const { breadcrumb: breadcrumbNameMaps } = getMenuData(routes);

  // 获取面包屑信息
  // const getBreadcrumbs = () => {
  //   const pathSnippets = location.pathname.split('/').filter((i) => i);
  //   const extraBreadcrumbItems: { path: string; breadcrumbName: string }[] = [];
  //   pathSnippets.map((_, index) => {
  //     const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
  //     const menu = breadcrumbNameMaps[url];
  //     if (menu) {
  //       extraBreadcrumbItems.push({
  //         path: url,
  //         breadcrumbName: getMenuName(menu),
  //       });
  //     }
  //   });
  //   return extraBreadcrumbItems;
  // };

  // 获取菜单名
  const getMenuName = (item: MenuDataItem): string => {
    return item.name as string;
  };

  // 菜单显示名称
  // 不需要国际化 可以删掉相关代码
  const menuSpanDom = (item: MenuDataItem) => {
    if (item.pro_layout_parentKeys.length === 0) {
      return (
        <Space size={10}>
          {item.icon ? <Icon type={item.icon as 'HomeOutlined'} /> : null}
          {getMenuName(item)}
        </Space>
      );
    } else {
      //* 子目录 不显示icon
      return getMenuName(item);
    }
  };

  // const siteLogo = <HomeOutlined style={{ color: '#fff', fontSize: '20px' }} onClick={() => history.push('/')} />;

  return (
    <div className="app-wrapper">
      <ProLayout
        className="home-layout"
        disableMobile
        headerTheme="dark"
        navTheme="light"
        layout="mix"
        // splitMenus={true}
        location={location}
        menu={{
          locale: false,
          defaultOpenAll: true,
        }}
        openKeys={false}
        siderWidth={size.width > 1350 ? 246 : 160}
        logo={false}
        fixedHeader
        fixSiderbar
        collapsed={false}
        collapsedButtonRender={false}
        title={REACT_APP_TITLE}
        onMenuHeaderClick={() => history.push('/')}
        menuDataRender={() => menuData}
        // route={{ routes: menuData }}
        // breadcrumbRender={(_) => {
        //   return [
        //     {
        //       path: '/',
        //       breadcrumbName: '首页'
        //     },
        //     ...getBreadcrumbs(),
        //   ];
        // }}
        // itemRender={(route, params, routes, paths) => {
        //   const first = routes.indexOf(route) === 0;
        //   const isCurrentpage = route.path === location.pathname;
        //   return first ? (
        //     <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        //   ) : !isCurrentpage ? (
        //     <Link to={route.path}>{route.breadcrumbName}</Link>
        //   ) : (
        //     <span>{route.breadcrumbName}</span>
        //   );
        // }}
        subMenuItemRender={(itemProps) => {
          return menuSpanDom(itemProps);
        }}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || !menuItemProps.path || location!.pathname === menuItemProps.path) {
            return menuSpanDom(menuItemProps);
          }
          return <Link to={menuItemProps.path}>{menuSpanDom(menuItemProps)}</Link>;
        }}
        // footerRender={() => <Footer />}
        rightContentRender={() => <RightContent />}
        // waterMarkProps={{
        //   content: userinfo?.username ? REACT_APP_WATERMASK + ' ' + userinfo?.username : REACT_APP_WATERMASK,
        //   fontColor: 'rgba(24, 144, 255, .15)',
        //   gapY: 100,
        // }}
      >
        <PageHeaderWrapper title={false} header={{ breadcrumb: undefined }}>
          <AuthComponent routes={routes || []}>{props.children}</AuthComponent>
        </PageHeaderWrapper>
      </ProLayout>
    </div>
  );
};

export default HomeLayout;
