/**
 * * hideInMenu属性为菜单是否显示标志
 * * 动态路由：以下数据须与后台获取路由数据进行对比筛选（在运行时主文件app.ts/patchRoutes方法中重构路由结构）
 * * 此文件配置作用：预加载组件和页面model（必须）
 * * 若是从后台获取的路由,则wrappers/access属性可以不需要,因为按常规 登录后后台接口获取的路由当前用户都有权限访问,
 * * 非后台获取的路由,权限控制使用wrappers和access属性控制
 * * 若添加access属性,则走AuthComponent中的pathAccess判断
 * * title：页面标题
 * * name: antd-Prolayout菜单显示名称
 * * cname为路由组件标识
 * * layout为布局标识
 */
const WebTitle = '尊禧助手' + ' - ';

export default [
  {
    path: '/login',
    title: WebTitle + '登陆',
    component: '@/pages/login',
    hidden: true,
  },
  {
    path: '/',
    component: '@/layout/BlankLayout',
    dynamic: true,
    routes: [
      {
        path: '/',
        component: '@/layout/HomeLayout',
        // wrappers属性去掉后,在components/AuthComponent组件中判断是否登陆,未登陆跳转到登录页面
        // wrappers: [ '@/wrappers/auth' ],
        layout: 'Home',
        routes: [
          { path: '/', redirect: '/home' },
          {
            cname: 'dashboard',
            title: '控制台',
            name: '控制台',
            icon: 'DashboardOutlined',
            path: '/home',
            component: '@/pages/dashboard',
          },
          {
            title: '客户管理',
            path: '/customer',
            icon: 'TeamOutlined',
            name: '客户管理',
            cname: 'customer',
            routes: [
              { path: '/customer', redirect: '/customer/list' },
              {
                cname: 'customer-list',
                title: '我的客户',
                name: '我的客户',
                path: '/customer/list',
                icon: 'OneToOneOutlined',
                component: '@/pages/customer/list',
              },
              {
                cname: 'phone-record',
                title: '回访记录',
                name: '回访记录',
                path: '/customer/phone/record',
                icon: 'ScheduleOutlined',
                component: '@/pages/customer/phoneRecord',
              },
              {
                cname: 'source-list',
                title: '渠道列表',
                name: '渠道列表',
                path: '/customer/source',
                icon: 'ShareAltOutlined',
                component: '@/pages/customer/source',
              },
              { cname: '*', component: '@/pages/nomatch' },
            ],
          },
          {
            title: '订单管理',
            path: '/order',
            icon: 'ProjectOutlined',
            name: '订单管理',
            cname: 'order',
            routes: [
              { path: '/order', redirect: '/order/list' },
              {
                cname: 'order-list',
                title: '订单列表',
                name: '订单列表',
                path: '/order/list',
                icon: 'OneToOneOutlined',
                component: '@/pages/order/list',
              },
              {
                cname: 'product-list',
                title: '商品列表',
                name: '商品列表',
                path: '/order/product',
                icon: 'ShareAltOutlined',
                component: '@/pages/product',
              },
              {
                cname: 'import-page',
                title: '批量上传',
                name: '批量上传',
                path: '/order/import',
                icon: 'ScheduleOutlined',
                component: '@/pages/import',
              },
              { cname: '*', component: '@/pages/nomatch' },
            ],
          },
          {
            title: '系统管理',
            name: '系统管理',
            path: '/systems',
            icon: 'SettingOutlined',
            cname: 'systems',
            routes: [
              { path: '/systems', redirect: '/systems/admin' },
              {
                cname: 'systems-admin',
                title: '后台管理员',
                icon: 'PictureOutlined',
                name: '后台管理员',
                path: '/systems/admin',
                component: '@/pages/systems/admin',
              },
              {
                cname: 'systems-role',
                title: '角色管理',
                icon: 'InboxOutlined',
                name: '角色管理',
                path: '/systems/role',
                component: '@/pages/systems/role',
              },
              {
                cname: 'systems-company',
                title: '公司管理',
                icon: 'ScheduleOutlined',
                name: '公司管理',
                path: '/systems/company',
                component: '@/pages/systems/company',
              },
              {
                cname: 'systems-permission-node',
                title: '权限节点',
                icon: 'ShareAltOutlined',
                name: '权限节点',
                path: '/systems/node',
                component: '@/pages/systems/node',
              },
              { cname: '*', component: '@/pages/nomatch' },
            ],
          },
          { cname: '*', component: '@/pages/nomatch' },
        ],
      },
      // { cname: '*', component: '@/pages/nomatch' },
    ],
  },
];
