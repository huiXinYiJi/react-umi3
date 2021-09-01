//* 页面用固定状态值
type StatusType = Record<number | string, API.ColumnTextStatus>;

//* 状态值 转为 {label: sting | number; value: string | number;}对象数组
export function ResetOptions(obj: StatusType) {
  const res: API.OptionsType[] = [];
  const copyObj = JSON.parse(JSON.stringify(obj));
  const arr = Object.keys(copyObj);

  arr.map((key) => {
    const value = /^[0-9]+$/g.test(key + '') ? Number(key) : key;
    res.push({
      label: obj[key]['text'],
      value,
    });
  });
  return res;
}

//* 过滤 StatusType 中的状态值
export const FilterStatus = (statusList: StatusType, key: string | number): StatusType => {
  const obj = {} as StatusType;
  Object.keys(statusList)
    .filter((index: string) => index !== key + '')
    .map((item) => {
      if (typeof key === 'number') {
        obj[Number(item)] = statusList[Number(item)];
      } else {
        obj[item] = statusList[item];
      }
    });
  return obj;
};

//* 按order大小排序 升序排列
export const sortedObjKeys = (objs: StatusType): string[] => {
  const sortedObjKeys = Object.keys(objs).sort((a: string, b: string) => {
    const keya: number = parseInt(a),
      keyb: number = parseInt(b);
    return (objs[keya].order || 0) - (objs[keyb].order || 0);
  });
  return sortedObjKeys;
};

/**
 * * 客户相关
 */
// 客户性别
export const CustomerSex: StatusType = {
  0: { text: '未知', status: 'default', color: '#f50' },
  1: { text: '男', status: 'default', color: '#2db7f5' },
  2: { text: '女', status: 'default', color: '#87d068' },
};

export const CustomerSexOptions: API.OptionsType[] = ResetOptions(CustomerSex);

// 客户状态
export const CustomerStatus: StatusType = {
  0: { text: '全部客户', status: 'default', color: '#87d068' },
  10: { text: '新线客户', status: 'default', color: 'cyan' },
  11: { text: '意向客户', status: 'processing', color: 'orange' },
  12: { text: '未接通', status: 'warning', color: 'magenta' },
  13: { text: '明确拒绝', status: 'error', color: 'red' },
  14: { text: '下单客户', status: 'default', color: 'green' },
  15: { text: '升单客户', status: 'default', color: 'orange' },
  16: { text: '复购客户', status: 'default', color: 'geekblue' },
  17: { text: '已添加微信', status: 'success', color: 'blue' },
  18: { text: '老数据明确拒绝', status: 'error', color: 'volcano' },
  19: { text: '二线老数据', status: 'default', color: 'lime' },
};

export const CustomerStatusOptions: API.OptionsType[] = ResetOptions(CustomerStatus);

// 客户信息tabs
export const CusInfoMenuTabs: StatusType = {
  1: { text: '客户信息', status: 'default', color: '#87d068' },
  2: { text: '回访记录', status: 'success', color: 'cyan' },
  // 3: { text: '通话记录', status: 'processing', color: 'orange' },
  // 4: { text: '产品订单', status: 'warning', color: 'magenta' },
  5: { text: '状态变更记录', status: 'error', color: 'red' },
};

// 操作记录 类型
export const ForTypeStatus: StatusType = {
  custom: { text: '客户', status: 'default', color: 'green' },
  order: { text: '订单', status: 'processing', color: 'cyan' },
};

// 回访方式
export const ForType: StatusType = {
  1: { text: '微信', status: 'default', color: '#87d068' },
  2: { text: '电话', status: 'default', color: '#2db7f5' },
};

export const ForTypeOptions: API.OptionsType[] = ResetOptions(ForType);

// 一线是否分配
export const AssignType: StatusType = {
  1: { text: '未分配', status: 'default', color: '#87d068' },
  2: { text: '已分配', status: 'success', color: '#2db7f5' },
};

// 二线是否分配
export const SharedType: StatusType = {
  1: { text: '未分配', status: 'default', color: '#87d068' },
  2: { text: '已分配', status: 'success', color: '#2db7f5' },
};

// 微信状态
export const WxType: StatusType = {
  0: { text: '未添加', status: 'default', color: 'default' },
  1: { text: '已添加', status: 'success', color: 'success' },
  2: { text: '已删除', status: 'warning', color: 'warning' },
  3: { text: '拉黑', status: 'error', color: 'error' },
};
export const WxTypeOptions: API.OptionsType[] = ResetOptions(WxType);

/**
 * * 订单相关
 */
// 代收货款状态
export const ToPaysStatus: StatusType = {
  0: { text: '未回款', status: 'default', color: 'red' },
  1: { text: '已回款', status: 'default', color: 'green' },
};

// 物流状态
export const TrackingStatus: StatusType = {
  1: { text: '配货中', status: 'default', color: 'cyan' },
  2: { text: '已发货', status: 'default', color: 'magenta' },
  3: { text: '签收', status: 'default', color: 'green' },
  4: { text: '退货（回仓）', status: 'default', color: 'volcano' },
  5: { text: '未妥投', status: 'default', color: 'orange' },
  6: { text: '问题件', status: 'default', color: 'red' },
};
export const TrackingStatusOptions: API.OptionsType[] = ResetOptions(TrackingStatus);

type NumKey = 'waitAudit' | 'waitHandle' | 'waitTrace' | 'hasTrace' | 'resetCount' | 'refundCount' | 'closeCount' | 'successCount';

// 订单状态
export const OrderStatus: Record<number | string, API.ColumnTextStatus & { othKey?: NumKey }> = {
  0: { text: '全部订单', status: 'default', color: '#87d068', order: 0 },
  1: { text: '待审核', status: 'default', color: 'cyan', order: 2, othKey: 'waitAudit' },
  2: { text: '待处理', status: 'processing', color: 'orange', order: 1, othKey: 'waitHandle' },
  5: { text: '成功的订单', status: 'success', color: 'lime', order: 6, othKey: 'successCount' },
  // 3: { text: '处理中', status: 'warning', color: 'magenta' },
  // 4: { text: '待结算', status: 'error', color: 'red' },
  // 6: { text: '审核未通过', status: 'default', color: 'orange' },
  // 7: { text: '结算未通过', status: 'default', color: 'geekblue' },
  // 8: { text: '待收尾款', status: 'default', color: 'blue' },
  // 9: { text: '退单', status: 'error', color: 'volcano' },
  // 10: { text: '无效订单', status: 'default', color: 'lime' },
  // 11: { text: '特殊审核', status: 'default', color: 'gold' },
  // 12: { text: '退货中', status: 'error', color: 'purple' },
  13: { text: '等待发货', status: 'error', color: 'purple', order: 3, othKey: 'waitTrace' },
  14: { text: '已发货', status: 'error', color: 'gold', order: 4, othKey: 'hasTrace' },
  15: { text: '重新处理', status: 'error', color: 'red', order: 8, othKey: 'resetCount' },
  16: { text: '售后中', status: 'error', color: 'geekblue', order: 5, othKey: 'refundCount' },
  17: { text: '关闭的订单', status: 'error', color: 'magenta', order: 7, othKey: 'closeCount' },
};

export const OrderStatusOptions: API.OptionsType[] = ResetOptions(OrderStatus);

// 成交途径
export const OrderPathway: StatusType = {
  0: { text: '一线', status: 'processing', color: 'red' },
  1: { text: '一线升单', status: 'warning', color: 'blue' },
  2: { text: '复购', status: 'success', color: 'green' },
};

export const OrderPathwayOptions: API.OptionsType[] = ResetOptions(OrderPathway);

// 配送快递
export const TrackingCompany: StatusType = {
  ems: { text: 'EMS', status: 'default', color: 'magenta' },
  shunfeng: { text: '顺丰快递', status: 'default', color: 'volcano' },
  // yd: { text: '韵达快递', status: 'default', color: 'orange' },
  // st: { text: '申通快递', status: 'default', color: 'gold' },
  yuantong: { text: '圆通快递', status: 'default', color: 'green' },
  // zt: { text: '中通快递', status: 'default', color: 'cyan' },
  // td: { text: '天地华宇', status: 'default', color: 'geekblue' },
};

export const TrackingCompanyOptions: API.OptionsType[] = ResetOptions(TrackingCompany);

// 支付类型
export const PayType: StatusType = {
  0: { text: '货到付款', status: 'default', color: 'magenta' },
  1: { text: '微信', status: 'default', color: 'volcano' },
  2: { text: '支付宝', status: 'default', color: 'orange' },
  3: { text: '银行卡支付', status: 'default', color: 'purple' },
  4: { text: '在线支付', status: 'default', color: 'cyan' },
};

export const PayTypeOptions: API.OptionsType[] = ResetOptions(PayType);

// 退款状态
export const RefundStatus: StatusType = {
  0: { text: '无需退款', status: 'default', color: 'green' },
  1: { text: '待退款', status: 'default', color: 'cyan' },
  2: { text: '退款中', status: 'default', color: 'orange' },
  3: { text: '退款成功', status: 'default', color: 'gold' },
  4: { text: '退款失败', status: 'default', color: 'red' },
};

/**
 * * 商品相关
 */
// 商品状态
export const ProductStatus: StatusType = {
  0: { text: '上架', status: 'default', color: 'green' },
  1: { text: '下架', status: 'default', color: 'red' },
};
export const ProductStatusOptions: API.OptionsType[] = ResetOptions(ProductStatus);

//*上传文件 数据状态
export const DataStatus: StatusType = {
  0: { text: '失败', status: 'error', color: 'red' },
  1: { text: '成功', status: 'success', color: 'green' },
};
