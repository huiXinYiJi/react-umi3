// 接口相关数据类型
declare namespace API {
  export type ApiDataType<T> = {
    code: number;
    msg: string;
    data: T;
    success: boolean;
  };

  export type OptionsType<T = any> = {
    label: string | number;
    value: string | number;
  } & T;

  // tree组件需要加载的数据 类型
  export type DataNode = {
    checkable?: boolean;
    children?: DataNode[];
    disabled?: boolean;
    disableCheckbox?: boolean;
    key: string | number;
    title?: React.ReactNode;
    selectable?: boolean;
  };

  export type treeDataType = {
    value: number;
    title: string;
    children?: treeDataType[];
    disabled?: boolean;
  };

  export type ColumnTextStatus = {
    text: string | number;
    status: 'success' | 'processing' | 'default' | 'error' | 'warning';
    color?: string;
    order?: number; // 排序
  };

  export type LoginParamsType = {
    username: string;
    password: string;
  };

  export type ResetPwdParamsType = {
    old_pwd: string;
    new_pwd: string;
  };

  export type AuthListType = {
    id: number; // 当前数据id
    pid: number; // 父级id
    title: string;
    api_path: string; // 接口地址
    component: string; // 组件地址标识
    is_show: 0 | 1; // 路由是否显示在左侧sidebar, 0 显示 1隐藏
    is_status: 0 | 1; // 0目录 1节点API
    layout: string; // 布局
    web_path: string; // 网页路径地址
    sort: number; // 排序
    children?: AuthListType[];
    icon?: string;
    name?: string; // 组件地址标识 与配置文件中组件地址标识相同. 若不提供, 则根据component属性生成
    checked?: number; // 是否选中
  };

  export type UserParamsType = {
    is_super: number; // 1 是 0 否  顶级管理员
    role_id: number; // 角色ID
    uid: number;
    username: string;
    access_list: AuthListType; // 权限数据
    avatar?: string;
  };

  // 角色列表
  export type RoleListType = {
    id: number; // 角色ID
    title: string; // 角色名
    description: string; // 角色描述
    add_time: number; // 创建时间
    nodes: string; // 角色权限id字符串
    current?: number;
    pageSize?: number;
  };

  // 后台管理员
  export type AdminRoleListType = {
    id: number; // 管理员ID
    username: string; // 用户名
    role_id: number;
    role: {
      id: 1;
      title: string;
      description: string;
      status: 0 | 1;
      add_time: number;
      nodes: string;
    };
    add_time: number; // 创建时间
    update_time: number; // 更新时间
    work_no: string; // 座席编号
  };

  // 后台管理员获取列表 传参
  export type AdminRoleGet = {
    username?: string; // 管理员名称
    current: number;
    pageSize: number;
  };

  // 管理员编辑/添加
  export type AdminRoleUpdate = {
    id?: number;
    role_id: number;
    username: string;
    password: string;
  };

  // 客户列表
  export type CustomerListType = {
    cid: number;
    name: string; // 昵称
    phone: string; // 手机号
    sex: 0 | 1 | 2; // 0:未知 1: 男 2:女
    wechat: string; //微信
    source_form: number; // 客户来源 id
    client_source: string; // 客户来源 名称
    is_status: number; // 客户状态
    addr: string; // 详细地址
    remark: string; // 备注
    order_num: number; //订单个数
    at_time: number; // 加入时间
    last_order_time: number; // 最后下单时间
    user_name: string; // 所属人名称
    uid: number; // 所属人ID
    wx_type: number; // 微信号状态
  };

  // 客户渠道来源列表
  export type SourceListType = {
    id: number;
    name: string;
    shop_id: number;
    platform: string;
  };

  // 订单列表
  export type OrderListType = {
    id: number;
    order_id: string;
    order_sn: string; // 店铺订单号
    parent_order_id: number; // 父订单
    shop_id: number; // 店铺ID
    shop_name: string; // 商户名称
    order_status: number; // 订单状态
    order_pathway: number; // 成交途径 0 一线 1 一线升单 2 复购
    cancel_reason: string; // 关闭原因
    buyer_words: string; // 买家留言
    seller_words: string; // 商家备注
    payment_no: string; // 支付流水号
    pay_type: number; // 支付类型 0 货到付款 1 微信 2 支付宝
    order_amount: number; // 订单金额（元）
    post_tel: string; // 收件人电话
    post_receiver: string; // 收件人名字
    post_address: string; // 收件人地址
    source_id: number; // 渠道来源
    source_name: string; // 渠道名称
    product_name: string; // 商品名称
    product_id: number; // 商品ID
    uid: number; // 所属操作用户
    username: string; // 所属用户名
    after_sale_status: number; // 售后状态
    // refund_status: number; // 退款状态 0 无需退款 1 待退款 2 退款中 3 退款成功 4 退款失败
    pay_time: number; // 支付时间
    remark: string; // 订单备注
    // expire_time: number; // 订单过期时间
    // exp_ship_time: number; // 预计发货时间
    ship_time: number; // 发货时间
    tracking_company: string; // 物流公司
    tracking_no: string; // 物流单号
    tracking_status: number; // 物流状态
    has_pay: number; // 店铺收款
    to_pay: number; // 到付金额
    offline_pay: number; // 线下金额
    // to_paystatus: number; // 0 未回款 1 已回款
    finish_time: number; // 订单完成时间
    at_time: number; // 下单时间
    refund_time: number; // 退款时间
    turn_down: string; // 驳回理由
    product_list: OrderProListType[]; // 产品信息
  };

  // 商品列表
  export type ProductListType = {
    id: number;
    product_id: number; // 商品id
    name: string; // 商品名称
    price: number; // 价格
    number: number; // 数量
    code: string; // 产品编码
    cate_id: number; // 产品分类ID
    cate_name: string; // 产品分类名称
    is_status: number; // 状态
    add_time: number; // 添加时间
    update_time: number; // 修改时间
  };

  export type OrderProListType = {
    discount: number; // 折扣
    remark: string; // 备注
    zk_price: number; // 总价
  } & ProductListType;

  // 添加商品 编辑
  export type EditProListType = {
    edit_number: number;
    edit_price: string;
    discount: number;
    total?: number;
    edit_id?: string;
    remark: string;
    id?: number;
    del_id?: number;
  } & Partial<API.ProductListType>;

  // 商品分类
  export type ProducCateType = {
    id: number; // 分类ID
    name: string; // 分类名称
    pid: number; // 父ID
    child?: ProducCateType[]; // 子集
    children?: ProducCateType[];
  };

  // 通话记录
  export type PhoneRecordType = {
    id: number; //记录id
    uid: number; // 用户id
    for_type: number; // 回访方式
    cid: number; // 客户id
    user_name: string; // 用户名
    client_name: string; // 客户名称
    at_time: number; // 时间
    remark: string; // 备注
  };

  // 操作记录
  export type LogType = {
    id: number; //记录id
    at_time: number; // 时间
    for_id: number; // 自增id
    for_type: string; // 类型 custom：客户; order：订单
    remark: string; // 备注
    to_uid: number;
    uid: number;
    username: string;
  };

  // 上传文件记录
  export type ImportRecordType = {
    id: number;
    original_name: string;
    up_num: number; // 上传数据总数量
    success_num: number; // 成功上传数量
    fail_num: number; // 失败上传数量
    at_time: number; // 上传时间
    user_name: string; // 上传者
    file_addr: string; // 文件下载地址
  };

  // 上传文件详情
  export type ImportDetailType = {
    id: number;
    order_id: string; // 订单号
    name: string; // 客户名称
    phone: string; // 手机
    address: string; // 地址
    goods_code: number; // 商品编码
    num: number; // 订单数量
    arrive_pay: number; // 到付金额
    receive_pay: number; // 实收金额
    source: string; // 渠道来源
    channel: number; // 成交途径
    is_status: number; // 数据状态
    [key: string]: string | number;
  };

  // 公司列表
  export type CompanyListType = {
    id: number; // 自增ID
    name: string; // 公司名
    social_code: string; // 公司编号
  };
}
