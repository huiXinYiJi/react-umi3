import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Space, Tag, Modal, Tabs, Alert, Typography, Popover } from 'antd';
import { useDispatch, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { FormInstance, FormItemProps } from 'antd/lib/form';
import type { TablePaginationConfig } from 'antd/lib/table';
import dayjs from 'dayjs';
import AddEdit from './components/addEdit';
import Audit from './components/audit';
import Import from './components/import';
import Shipping from './components/shipping';
import ShipAudit from './components/shipAudit';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { sortedObjKeys, OrderStatus, OrderPathway, TrackingCompany, PayType } from '@/utils/value.config';
import { InputRange, TimeRangeSelect } from '@/components';
import { resetDataToSelect, downloadFile, numberFormat } from '@/utils';
import { timeRangeFieldProps } from '@/utils/antd.config';

export type FieldsItem = {
  id?: number;
  pro_list?: string; // JSON
} & Partial<API.OrderListType>;

type TableSearchType = {
  current?: number;
  pageSize?: number;
} & Partial<API.OrderListType>;

//* 搜索框 时间选择下拉框
const TimeSelectOptions = [
  { label: '下单时间', value: 'at_time' },
  { label: '发货时间', value: 'ship_time' },
  // { label: '退款时间', value: 'refund_time' },
  { label: '订单完成时间', value: 'finish_time' },
];

const OrderList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const dispatch = useDispatch();
  const { userinfo } = useSelector((state: ConnectState) => state.app);
  const { list, total, isover_money, total_money, count_list: countList } = useSelector((state: ConnectState) => state.order);
  const loading = useSelector((state: ConnectState) => state.loading.effects['order/fetch']);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('添加');
  const [fields, setFields] = useState<FieldsItem | undefined>(undefined);
  const [params, setParams] = useState<TableSearchType>({
    current: 1,
    pageSize: 20,
  });
  const [status, setStatus] = useState<number>(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [auditVisible, setAuditVisible] = useState<boolean>(false);
  const [importVisible, setImportVisible] = useState<boolean>(false);
  const [sourceList, setSourceList] = useState<API.OptionsType<API.SourceListType>[]>([]);
  const [userList, setUserList] = useState<API.OptionsType<API.AdminRoleListType>[]>([]);
  const [shipVisible, setShipVisible] = useState<boolean>(false);
  const [shipAuditVisible, setShipAuditVisible] = useState<boolean>(false);
  const [shipAuditFields, setShipAuditFields] = useState<API.OrderListType | undefined>(undefined);

  useEffect(() => {
    handleFetch();
  }, [params, status]);

  useEffect(() => {
    handleSourceFetch();
    handleFetchUser();
  }, [1]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'order/fetch',
      payload: {
        ...params,
        order_status: status === 0 ? undefined : status,
      },
    });
  };

  // 获取客户来源列表
  const handleSourceFetch = async () => {
    dispatch({
      type: 'source/fetch',
      callback: (res: API.SourceListType[]) => {
        setSourceList(resetDataToSelect(res, { label: 'name', value: 'id' }));
      },
    });
  };

  // 获取用户列表
  const handleFetchUser = async () => {
    if (userinfo?.is_super === 1) {
      dispatch({
        type: 'adminRole/fetch',
        payload: {
          current: 1,
          pageSize: 1000,
        },
        callback: (res: API.ApiDataType<{ lists: API.AdminRoleListType[] }>) => {
          setUserList(resetDataToSelect(res.data.lists, { label: 'username', value: 'id' }));
        },
      });
    }
  };

  // 导出
  const handleExport = (form: FormInstance) => {
    const values = form.getFieldsValue();
    const { tracking_company, at_time, ship_time, refund_time, finish_time } = values;
    if (!at_time || at_time.length <= 0) {
      message.warning('请选择下单时间');
      return false;
    }
    dispatch({
      type: 'order/export',
      payload: {
        ...values,
        order_status: status === 0 ? undefined : status,
        tracking_label: tracking_company ? TrackingCompany[tracking_company]['text'] : undefined,
        at_time: [dayjs(at_time[0]).valueOf(), dayjs(at_time[1]).valueOf()],
        ship_time: ship_time ? [dayjs(ship_time[0]).valueOf(), dayjs(ship_time[1]).valueOf()] : undefined,
        refund_time: refund_time ? [dayjs(refund_time[0]).valueOf(), dayjs(refund_time[1]).valueOf()] : undefined,
        finish_time: finish_time ? [dayjs(finish_time[0]).valueOf(), dayjs(finish_time[1]).valueOf()] : undefined,
      },
      callback: (res: API.ApiDataType<string>) => {
        const nowTime = dayjs(new Date().getTime()).format('YYYY-MM-DD');
        downloadFile(res.data, `尊禧鹿业发货表_${nowTime}`);
      },
    });
  };

  // 点击事件触发弹窗
  const selectMenu = (key: string, record: API.OrderListType | undefined) => {
    switch (key) {
      case 'add':
        setTitle('添加订单');
        setFields(undefined);
        setModalVisible(true);
        break;
      case 'edit':
        setTitle('编辑订单');
        setFields(record);
        setModalVisible(true);
        break;
      //*审核
      case 'audit':
        setFields(record);
        setAuditVisible(true);
        break;
      case 'shipAudit':
        setShipAuditFields(record);
        setShipAuditVisible(true);
        break;
      //* 批量发货
      case 'batchShip':
        setFields(record);
        setImportVisible(true);
        break;
      //* 仓库发货
      case 'shipping':
        setFields(record);
        setShipVisible(true);
        break;
      // 删除
      case 'delete':
        if (record !== undefined) handleDelete(String(record.id));
        break;
      default:
        break;
    }
  };

  //* 仓库 发货
  const handleShip = async (fields: FieldsItem, form: FormInstance) => {
    dispatch({
      type: 'order/ship',
      payload: { ...fields },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        setParams((prev) => ({
          ...prev,
        }));
      },
    });
  };

  // 添加/编辑
  const handleAddEdit = async (fields: FieldsItem, form: FormInstance) => {
    const type = fields.id ? 'order/update' : 'order/add';
    dispatch({
      type,
      payload: { ...fields },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        if (fields.id) {
          setParams((prev) => ({
            ...prev,
          }));
        } else {
          setParams((prev) => ({
            ...prev,
            current: 1,
          }));
        }
      },
    });
  };

  // 审核
  const handleAudit = async (fields: FieldsItem, form: FormInstance) => {
    dispatch({
      type: 'order/audit',
      payload: { ...fields },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        setParams((prev) => ({
          ...prev,
          current: fields.order_status !== status && list.length === 1 ? 1 : prev.current,
        }));
      },
    });
  };

  // 删除 批量删除 id值用,隔开
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '您确定要关闭此订单吗？',
      icon: <ExclamationCircleOutlined />,
      content: '关闭操作将不可撤销',
      onOk: () => {
        dispatch({
          type: 'order/delete',
          payload: { id },
          callback: (res: API.ApiDataType<null>) => {
            message.success(res.msg);
            setParams((prev) => ({
              ...prev,
              current: list.length === 1 ? 1 : prev.current,
            }));
          },
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  // 关闭弹窗
  const handleClose = useCallback((form: FormInstance) => {
    form.resetFields();
    setFields(undefined);
    setModalVisible(false);
    setAuditVisible(false);
    setImportVisible(false);
    setShipVisible(false);
    setShipAuditVisible(false);
    setShipAuditFields(undefined);
  }, []);

  // table change事件
  const onTableChange = (pagination: TablePaginationConfig) => {
    const { current, pageSize } = pagination;
    setParams((prev) => ({
      ...prev,
      current,
      pageSize,
    }));
  };

  // 搜索
  const onFormSubmit = (params: FieldsItem) => {
    setParams((prev) => ({
      ...params,
      current: 1,
      pageSize: prev.pageSize,
    }));
  };

  // 多选配置
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: API.OrderListType[]) => {
      const idsArr = selectedRows.map((item) => item.id);
      setSelectedRowKeys(idsArr);
    },
    selectedRowKeys,
  };

  // 数字区间验证
  const formItemProps = (form: FormInstance): FormItemProps => {
    return {
      rules: [
        ({ getFieldValue }) => ({
          validator(_, value: number[]) {
            if (value && (value[0] === undefined || value[1] === undefined || value[0] > value[1])) {
              return Promise.reject(new Error('请输入合法区间值'));
            }
            return Promise.resolve();
          },
        }),
      ],
    };
  };

  // table 列表配置项
  const columns: ProColumns<API.OrderListType>[] = [
    {
      title: '客户联系人',
      dataIndex: 'post_receiver',
      align: 'center',
      width: 100,
      hideInTable: true,
    },
    {
      title: '订单号',
      dataIndex: 'order_sn',
      align: 'center',
      width: 120,
      hideInTable: true,
    },
    {
      title: '渠道',
      dataIndex: 'source_id',
      align: 'center',
      width: 120,
      renderText: (_: string, record: API.OrderListType) => {
        return record.source_name;
      },
      valueType: 'select',
      fieldProps: {
        options: sourceList,
        showSearch: true,
      },
      hideInTable: true,
    },
    {
      title: '订单地址',
      dataIndex: 'post_address',
      align: 'center',
      width: 120,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '手机号',
      dataIndex: 'post_tel',
      align: 'center',
      width: 120,
      hideInTable: true,
    },
    {
      title: '订单状态',
      dataIndex: 'order_status',
      align: 'center',
      width: 120,
      hideInSearch: true,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        if (!OrderStatus[record.order_status]) return '-';
        return (
          <Tag color={OrderStatus[record.order_status]['color']} key={record.order_status}>
            {OrderStatus[record.order_status]['text']}
          </Tag>
        );
      },
      hideInTable: true,
    },
    {
      title: '订单金额',
      dataIndex: 'order_amount',
      align: 'center',
      width: 160,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '店铺收款',
      dataIndex: 'has_pay',
      align: 'center',
      width: 120,
      formItemProps,
      renderFormItem: (_, { type, defaultRender, ...rest }, form: FormInstance) => {
        return (
          <InputRange
            {...rest}
            onChange={(val?: [number | undefined, number | undefined]) => {
              form.setFieldsValue({ has_pay: val });
            }}
          />
        );
      },
      fieldProps: {
        formatter: (value: number) => `￥ ${value}`,
      },
      hideInTable: true,
    },
    {
      title: '到付金额',
      dataIndex: 'to_pay',
      align: 'center',
      width: 120,
      formItemProps,
      renderFormItem: (_, { type, defaultRender, ...rest }, form: FormInstance) => {
        return (
          <InputRange
            {...rest}
            onChange={(val?: [number | undefined, number | undefined]) => {
              form.setFieldsValue({ to_pay: val });
            }}
          />
        );
      },
      fieldProps: {
        formatter: (value: number) => `￥ ${value}`,
      },
      hideInTable: true,
    },
    {
      title: '线下收款(￥)',
      dataIndex: 'offline_pay',
      align: 'center',
      width: 120,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '成交途径',
      dataIndex: 'order_pathway',
      align: 'center',
      width: 120,
      valueEnum: OrderPathway,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        if (!OrderPathway[record.order_pathway]) return '-';
        return (
          <Tag color={OrderPathway[record.order_pathway]['color']} key={record.order_pathway}>
            {OrderPathway[record.order_pathway]['text']}
          </Tag>
        );
      },
      hideInTable: true,
    },
    {
      title: '所属人',
      dataIndex: 'uid',
      align: 'center',
      width: 120,
      hideInSearch: userinfo?.is_super !== 1, // 超管可搜索
      ellipsis: true,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return record.username;
      },
      valueType: 'select',
      fieldProps: {
        options: userList,
        showSearch: true,
      },
      hideInTable: true,
    },
    {
      title: '关闭原因',
      dataIndex: 'cancel_reason',
      align: 'center',
      width: 150,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '买家留言',
      dataIndex: 'buyer_words',
      align: 'center',
      width: 150,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '商家备注',
      dataIndex: 'seller_words',
      align: 'center',
      width: 150,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '订单备注',
      dataIndex: 'remark',
      align: 'center',
      width: 150,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '驳回原因',
      dataIndex: 'turn_down',
      align: 'center',
      width: 150,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '支付流水号',
      dataIndex: 'payment_no',
      key: 'payment_no',
      align: 'center',
      width: 150,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '支付类型',
      dataIndex: 'pay_type',
      align: 'center',
      width: 150,
      valueEnum: PayType,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        if (!PayType[record.pay_type]) return '-';
        return (
          <Tag color={PayType[record.pay_type]['color']} key={record.pay_type}>
            {PayType[record.pay_type]['text']}
          </Tag>
        );
      },
      hideInSearch: true,
      ellipsis: true,
      hideInTable: true,
    },
    {
      title: '配送快递',
      dataIndex: 'tracking_company',
      align: 'center',
      width: 160,
      valueType: 'select',
      valueEnum: TrackingCompany,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        if (!TrackingCompany[record.tracking_company]) return '-';
        return (
          <Tag color={TrackingCompany[record.tracking_company]['color']} key={record.tracking_company}>
            {TrackingCompany[record.tracking_company]['text']}
          </Tag>
        );
      },
      hideInTable: true,
    },
    {
      title: '快递单号',
      dataIndex: 'tracking_no',
      align: 'center',
      width: 120,
      hideInTable: true,
    },
    {
      title: '发货时间',
      dataIndex: 'ship_time',
      valueType: 'dateRange',
      align: 'center',
      width: 160,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return record.ship_time ? dayjs.unix(record.ship_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.ship_time - b.ship_time,
      fieldProps: timeRangeFieldProps(),
      hideInTable: true,
    },
    {
      title: '退款时间',
      dataIndex: 'refund_time',
      valueType: 'dateRange',
      align: 'center',
      width: 160,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return record.refund_time ? dayjs.unix(record.refund_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.refund_time - b.refund_time,
      fieldProps: timeRangeFieldProps(),
      hideInTable: true,
    },
    {
      title: '订单完成时间',
      dataIndex: 'finish_time',
      valueType: 'dateRange',
      align: 'center',
      width: 160,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return record.finish_time ? dayjs.unix(record.finish_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.finish_time - b.finish_time,
      fieldProps: timeRangeFieldProps(),
      hideInTable: true,
    },
    {
      title: '下单时间',
      dataIndex: 'at_time',
      valueType: 'dateTimeRange',
      align: 'center',
      width: 120,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return record.at_time ? dayjs.unix(record.at_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.at_time - b.at_time,
      colSize: 1.5,
      fieldProps: timeRangeFieldProps(),
      hideInTable: true,
    },
    {
      title: '时间',
      dataIndex: 'time',
      valueType: 'dateRange',
      align: 'center',
      renderFormItem: (_, { type, defaultRender, ...rest }, form: FormInstance) => {
        console.log(rest);
        return (
          <TimeRangeSelect
            {...rest}
            onChange={(val?: [string | number | undefined, [number, number] | undefined]) => {
              if (val) {
                const keyName = val[0];
                keyName && form.setFieldsValue({ [keyName]: val[1] });
              }
            }}
          />
        );
      },
      fieldProps: {
        selectProps: {
          options: TimeSelectOptions,
          width: 250,
        },
        timeProps: timeRangeFieldProps(),
      },
      colSize: 2,
      hideInTable: true,
    },
  ];

  const tableColumns: ProColumns<API.OrderListType>[] = columns.concat([
    {
      title: '商品信息',
      dataIndex: 'product_info',
      align: 'left',
      hideInSearch: true,
      width: 260,
      ellipsis: true,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        const eleDom = (
          <div className="order-info-top">
            <div className="left">
              <span className="label">订单号：</span>
              <Typography.Paragraph copyable>{record.order_sn}</Typography.Paragraph>
              <span className="label">下单时间：</span>
              <span>{record.at_time ? dayjs.unix(record.at_time).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
            </div>
          </div>
        );
        return {
          children: eleDom,
          props: {
            colSpan: 7,
          },
        };
      },
    },
    {
      title: '单价/数量',
      dataIndex: 'product_price_num',
      align: 'right',
      width: 114,
      hideInSearch: true,
      render: (value, row, index) => {
        return {
          children: null,
          props: {
            colSpan: 0,
          },
        };
      },
    },
    {
      title: '售后状态',
      dataIndex: 'after_sale',
      align: 'right',
      width: 114,
      hideInSearch: true,
      render: (value, row, index) => {
        return {
          children: null,
          props: {
            colSpan: 0,
          },
        };
      },
    },
    {
      title: '应付',
      dataIndex: 'order_amount',
      align: 'right',
      hideInSearch: true,
      width: 129,
      render: (value, row, index) => {
        return {
          children: null,
          props: {
            colSpan: 0,
          },
        };
      },
    },
    {
      title: '客户',
      dataIndex: 'post_receiver',
      align: 'left',
      width: 185,
      hideInSearch: true,
      render: (value, row, index) => {
        return {
          children: null,
          props: {
            colSpan: 0,
          },
        };
      },
    },
    {
      title: '订单状态',
      dataIndex: 'order_status',
      align: 'left',
      hideInSearch: true,
      width: 120,
      render: (value, row, index) => {
        return {
          children: null,
          props: {
            colSpan: 0,
          },
        };
      },
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      align: 'center',
      width: 85,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return {
          children: null,
          props: {
            colSpan: 0,
          },
        };
      },
    },
  ]);

  const expandedColumns: ProColumns<API.OrderListType>[] = [
    {
      title: '商品信息',
      dataIndex: 'info_pro',
      align: 'left',
      width: 374,
      ellipsis: true,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        if (!record.product_list) return '-';
        return (
          <Space size={15} align="start" direction="vertical" className="info-pro">
            {record.product_list.map((item) => {
              const { price, name, number, id } = item;
              return (
                <Space size={8} align="start" direction="horizontal" key={id}>
                  <Space size={8} align="start" direction="horizontal">
                    <div className="pro-img">
                      <img src="https://via.placeholder.com/48x48" alt="product image" width="48px" height="48px" />
                    </div>
                    <Space size={4} align="start" direction="vertical">
                      <div className="name">{name}</div>
                      <div className="num">{number}</div>
                      <div className="source">{record.source_name}</div>
                    </Space>
                  </Space>
                  <Space size={4} align="end" direction="vertical">
                    <span className="price">￥{numberFormat(price)}</span>
                    <span className="num">x{number}</span>
                  </Space>
                </Space>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: '售后状态',
      dataIndex: 'info_after_sale',
      align: 'right',
      width: 114,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return (
          <Space size={4} align="end" direction="vertical">
            <a key="openAfterSale" onClick={() => selectMenu('openAfterSale', record)}>
              申请售后
            </a>
          </Space>
        );
      },
    },
    {
      title: '应付',
      dataIndex: 'info_price',
      align: 'right',
      width: 129,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        const popContent = (
          <Space size={12} direction="vertical">
            <div>店铺收款(￥): {numberFormat(record.has_pay)}</div>
            <div>到付金额(￥): {numberFormat(record.to_pay)}</div>
            <div>线下收款(￥): {numberFormat(record.offline_pay)}</div>
          </Space>
        );
        return (
          <Popover content={popContent}>
            <Space size={4} align="end" direction="vertical">
              <div className="type">{!PayType[record.pay_type] ? '-' : PayType[record.pay_type]['text']}</div>
              <div className="order-amount">￥{numberFormat(record.order_amount)}</div>
            </Space>
          </Popover>
        );
      },
    },
    {
      title: '客户',
      dataIndex: 'info_customer',
      align: 'left',
      width: 185,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return (
          <Space size={4} align="start" direction="vertical">
            <div className="username">{record.username || '-'}</div>
            <div className="detail">
              <Typography.Paragraph copyable>{`${record.post_receiver}，${record.post_tel}，${record.post_address}`}</Typography.Paragraph>
            </div>
          </Space>
        );
      },
    },
    {
      title: '订单状态',
      dataIndex: 'info_status',
      align: 'left',
      width: 120,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return (
          <Space size={4} align="start" direction="vertical">
            <div className="status-type">
              {!OrderStatus[record.order_status] ? (
                '-'
              ) : (
                <Tag color={OrderStatus[record.order_status]['color']} key={record.order_status}>
                  {OrderStatus[record.order_status]['text']}
                </Tag>
              )}
            </div>
            <div className="cus-status">{!OrderPathway[record.order_pathway] ? '-' : OrderPathway[record.order_pathway]['text']}</div>
            <a key="checkTrack" onClick={() => selectMenu('checkTrack', record)}>
              查看物流
            </a>
          </Space>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'info_action',
      align: 'center',
      width: 85,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return (
          <Space direction="vertical" size={8}>
            {(record.order_status !== 2 && record.order_status !== 15 && (userinfo?.role_id === 6 || userinfo?.role_id === 7)) ||
            userinfo?.role_id === 8 ||
            record.order_status === 17 ? null : (
              <a key="edit" className="active" onClick={() => selectMenu('edit', record)}>
                编辑
              </a>
            )}
            {/* 待审核 待发货 */}
            {((userinfo?.role_id === 8 && (record.order_status === 1 || record.order_status === 13)) || userinfo?.is_super === 1) &&
            record.order_status !== 17 ? (
              <a
                key="audit"
                onClick={() => {
                  const type = userinfo?.role_id === 8 ? 'shipAudit' : 'audit';
                  selectMenu(type, record);
                }}
              >
                审核
              </a>
            ) : null}
            {/* 仓库角色 发货 */}
            {userinfo?.role_id === 8 && record.order_status === 13 ? (
              <a key="shipping" onClick={() => selectMenu('shipping', record)}>
                发货
              </a>
            ) : null}
            {record.order_status !== 17 ? (
              <a className="custom-a-dangerous" key="delete" onClick={() => selectMenu('delete', record)}>
                关闭
              </a>
            ) : null}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      {total > 0 ? (
        <Alert
          type="info"
          banner
          message={
            <Space direction="horizontal" size={50}>
              <div>
                <span style={{ marginRight: '10px' }}>（{OrderStatus[Number(status)].text}）</span>
                总成交金额：<span>{total_money}元</span>
              </div>
              <div>
                已完成金额：<span>{isover_money}元</span>
              </div>
            </Space>
          }
        />
      ) : null}
      <Tabs
        tabPosition="top"
        activeKey={status + ''}
        onChange={(activeKey) => {
          setStatus(Number(activeKey));
          setParams((prev) => ({
            ...prev,
            current: 1,
          }));
        }}
      >
        {sortedObjKeys(OrderStatus).map((key: string) => {
          const numKey = OrderStatus[Number(key)].othKey;
          return (
            <Tabs.TabPane
              tab={
                <span>
                  {OrderStatus[Number(key)].text} {key !== '0' ? `(${numKey !== undefined ? countList[numKey] : 0}) ` : null}
                </span>
              }
              key={key}
            ></Tabs.TabPane>
          );
        })}
      </Tabs>
      <ProTable<API.OrderListType>
        className="info-table"
        loading={loading}
        rowKey="id"
        columns={tableColumns}
        actionRef={actionRef}
        formRef={formRef}
        dataSource={list}
        form={{
          ignoreRules: false,
          size: 'small',
          // onValuesChange: (changedValues) => {
          //   console.log(changedValues);
          // },
        }}
        search={{
          labelWidth: 80,
          optionRender: (searchConfig, formProps, dom) => [
            ...dom.reverse(),
            <Button
              key="export"
              onClick={() => {
                if (!formProps?.form) return;
                formProps.form
                  .validateFields(['has_pay', 'to_pay', 'offline_pay'])
                  .then(() => {
                    formProps?.form && handleExport(formProps.form);
                  })
                  .catch((err) => false);
              }}
            >
              导出订单
            </Button>,
          ],
        }}
        rowSelection={{
          ...rowSelection,
        }}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          hideOnSinglePage: false,
          total,
          current: params.current,
          pageSize: params.pageSize,
        }}
        dateFormatter="number"
        headerTitle={
          <Space>
            <Button key="batchShip" onClick={() => selectMenu('batchShip', undefined)}>
              批量发货
            </Button>
            <Button
              key="delete"
              disabled={selectedRowKeys.length === 0}
              onClick={() => {
                if (selectedRowKeys.length > 0) {
                  const ids = selectedRowKeys.length > 0 ? selectedRowKeys.join(',') : '';
                  handleDelete(ids);
                }
              }}
            >
              批量关闭
            </Button>
          </Space>
        }
        options={false}
        onSubmit={onFormSubmit}
        onChange={onTableChange}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={() => selectMenu('add', undefined)}>
            添加订单
          </Button>,
        ]}
        sticky
        expandable={{
          expandedRowRender: (record) => (
            <ProTable<API.OrderListType>
              className="expanded-info"
              rowKey="id"
              columns={expandedColumns}
              dataSource={[record]}
              search={false}
              pagination={false}
              showHeader={false}
              options={false}
            />
          ),
          expandedRowKeys: list.map((item) => item.id),
          rowExpandable: (record) => true,
          expandIcon: () => null,
        }}
      />
      <AddEdit title={title} modalVisible={modalVisible} onClose={handleClose} onSubmit={handleAddEdit} fields={fields} />
      <Audit title="订单审核" modalVisible={auditVisible} onClose={handleClose} onSubmit={handleAudit} fields={fields} />
      <Import title="批量发货" modalVisible={importVisible} onClose={handleClose} />
      <Shipping title="发货" modalVisible={shipVisible} onClose={handleClose} onSubmit={handleShip} fields={fields} />
      <ShipAudit title="订单审核" modalVisible={shipAuditVisible} onClose={handleClose} onSubmit={handleAudit} fields={shipAuditFields} />
    </>
  );
};

export default OrderList;
