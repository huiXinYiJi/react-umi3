import React, { useEffect, useState } from 'react';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Space, Tag, Button, message } from 'antd';
import { useDispatch, useSelector } from 'umi';
import dayjs from 'dayjs';
import {
  ToPaysStatus,
  TrackingStatus,
  FilterStatus,
  OrderStatus,
  OrderPathway,
  TrackingCompany,
  PayType,
  RefundStatus,
} from '@/utils/value.config';
import AddEdit from '@/pages/order/list/components/addEdit';
import type { FormInstance } from 'antd/lib/form';
import type { ConnectState } from '@/models/connect';
import AddEditOrder from '@/pages/order/list/components/addEdit';

export type FieldsItem = {
  id?: number;
  pro_list?: string; // JSON
} & Partial<API.OrderListType>;

type PageProps = {
  startFetch?: boolean;
  curCustomer: API.CustomerListType;
};

const OrderListByCus: React.FC<PageProps> = (props) => {
  const { startFetch, curCustomer } = props;
  const [orderList, setOrderList] = useState<API.OrderListType[]>([]);
  const loading = useSelector((state: ConnectState) => state.loading.effects['customer/orderListByCus']);
  // 添加订单
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [fields, setFields] = useState<FieldsItem | undefined>(undefined);
  const [title, setTitle] = useState<string>('');
  const [promotVisible, setPromotVisible] = useState<boolean>(false);
  const { userinfo } = useSelector((state: ConnectState) => state.app);

  // 获取订单列表
  const handleFetch = async () => {
    dispatch({
      type: 'customer/orderListByCus',
      payload: {
        phone: curCustomer.phone,
      },
      callback: (res: API.ApiDataType<API.OrderListType[]>) => {
        setOrderList(res.data);
      },
    });
  };

  useEffect(() => {
    if (startFetch) handleFetch();
  }, [startFetch]);

  // 添加订单 事件
  const handleAddEdit = async (fields: FieldsItem, form: FormInstance) => {
    const { id, ...rest } = fields;
    dispatch({
      type: 'order/add',
      payload: { ...rest, cid: curCustomer.cid },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        handleFetch();
      },
    });
  };

  // 升单(编辑) 点击事件触发弹窗
  const selectMenu = (key: string, record: API.OrderListType | undefined) => {
    switch (key) {
      case 'promotion':
        setTitle('升单');
        setFields(record);
        setPromotVisible(true);
        break;
      default:
        break;
    }
  };

  //* 升单(编辑)
  const handleAddEditOrder = async (fields: FieldsItem, form: FormInstance) => {
    dispatch({
      type: 'order/update',
      payload: { ...fields },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        handleFetch();
      },
    });
  };

  // 关闭弹窗
  const handleClose = (form: FormInstance) => {
    form.resetFields();
    setModalVisible(false);
    setPromotVisible(false);
    setFields(undefined);
  };

  // table 列表配置项
  const columns: ProColumns<API.OrderListType>[] = [
    {
      title: '订单号',
      dataIndex: 'order_sn',
      align: 'center',
      width: 250,
      fixed: 'left',
    },
    {
      title: '商品名称',
      dataIndex: 'product_name',
      align: 'center',
      width: 200,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        const arr = record.product_name ? record.product_name.split('\n') : [];
        return (
          <Space direction="vertical" size={3}>
            {arr.map((item, index) => {
              return <span key={record.id + '_' + index + '_' + item}>{item}</span>;
            })}
          </Space>
        );
      },
    },
    {
      title: '订单地址',
      dataIndex: 'post_address',
      align: 'center',
      width: 250,
    },
    {
      title: '订单状态',
      dataIndex: 'order_status',
      align: 'center',
      width: 120,
      valueEnum: FilterStatus(OrderStatus, 0),
      filters: true,
      onFilter: true,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        if (!OrderStatus[record.order_status]) return '-';
        return (
          <Tag color={OrderStatus[record.order_status]['color']} key={record.order_status}>
            {OrderStatus[record.order_status]['text']}
          </Tag>
        );
      },
    },
    {
      title: '订单金额（元）',
      dataIndex: 'order_amount',
      align: 'center',
      width: 160,
    },
    {
      title: '店铺收款（元）',
      dataIndex: 'has_pay',
      align: 'center',
      width: 120,
    },
    {
      title: '到付金额（元）',
      dataIndex: 'to_pay',
      align: 'center',
      width: 120,
    },
    {
      title: '线下金额（元）',
      dataIndex: 'offline_pay',
      align: 'center',
      width: 120,
    },
    {
      title: '成交途径',
      dataIndex: 'order_pathway',
      align: 'center',
      width: 120,
      valueEnum: OrderPathway,
      filters: true,
      onFilter: true,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        if (!OrderPathway[record.order_pathway]) return '-';
        return (
          <Tag color={OrderPathway[record.order_pathway]['color']} key={record.order_pathway}>
            {OrderPathway[record.order_pathway]['text']}
          </Tag>
        );
      },
    },
    // {
    //   title: '商户名称',
    //   dataIndex: 'shop_name',
    //   align: 'center',
    //   width: 150,
    // },
    // {
    //   title: '退款状态',
    //   dataIndex: 'refund_status',
    //   align: 'center',
    //   width: 150,
    //   valueEnum: RefundStatus,
    //   filters: true,
    //   onFilter: true,
    //   render: (_: React.ReactNode, record: API.OrderListType) => {
    //     if (!RefundStatus[record.refund_status]) return '-';
    //     return (
    //       <Tag color={RefundStatus[record.refund_status]['color']} key={record.refund_status}>
    //         {RefundStatus[record.refund_status]['text']}
    //       </Tag>
    //     );
    //   },
    // },
    {
      title: '关闭原因',
      dataIndex: 'cancel_reason',
      align: 'center',
      width: 150,
    },
    {
      title: '买家留言',
      dataIndex: 'buyer_words',
      align: 'center',
      width: 150,
    },
    {
      title: '商家备注',
      dataIndex: 'seller_words',
      align: 'center',
      width: 150,
    },
    {
      title: '订单备注',
      dataIndex: 'remark',
      align: 'center',
      width: 150,
    },
    {
      title: '驳回原因',
      dataIndex: 'turn_down',
      align: 'center',
      width: 150,
    },
    {
      title: '支付流水号',
      dataIndex: 'payment_no',
      key: 'payment_no',
      align: 'center',
      width: 150,
    },
    {
      title: '支付类型',
      dataIndex: 'pay_type',
      align: 'center',
      width: 150,
      valueEnum: PayType,
      filters: true,
      onFilter: true,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        if (!PayType[record.pay_type]) return '-';
        return (
          <Tag color={PayType[record.pay_type]['color']} key={record.pay_type}>
            {PayType[record.pay_type]['text']}
          </Tag>
        );
      },
      ellipsis: true,
    },
    // {
    //   title: '待收货款状态',
    //   dataIndex: 'to_paystatus',
    //   valueType: 'radioButton',
    //   valueEnum: ToPaysStatus,
    //   filters: true,
    //   onFilter: true,
    //   align: 'center',
    //   render: (_: React.ReactNode, record: API.OrderListType) => {
    //     if (!ToPaysStatus[record.to_paystatus]) return '-';
    //     return (
    //       <Tag color={ToPaysStatus[record.to_paystatus]['color']} key={record.to_paystatus}>
    //         {ToPaysStatus[record.to_paystatus]['text']}
    //       </Tag>
    //     );
    //   },
    //   width: 120,
    //   fieldProps: {
    //     buttonStyle: 'solid',
    //   },
    // },
    {
      title: '配送快递',
      dataIndex: 'tracking_company',
      align: 'center',
      width: 130,
      valueType: 'select',
      valueEnum: TrackingCompany,
      filters: true,
      onFilter: true,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        if (!TrackingCompany[record.tracking_company]) return '-';
        return (
          <Tag color={TrackingCompany[record.tracking_company]['color']} key={record.tracking_company}>
            {TrackingCompany[record.tracking_company]['text']}
          </Tag>
        );
      },
    },
    {
      title: '快递单号',
      dataIndex: 'tracking_no',
      align: 'center',
      width: 120,
    },
    // {
    //   title: '物流状态',
    //   dataIndex: 'tracking_status',
    //   align: 'center',
    //   width: 100,
    //   valueType: 'select',
    //   valueEnum: TrackingStatus,
    //   render: (_: React.ReactNode, record: API.OrderListType) => {
    //     if (!TrackingStatus[record.tracking_status]) return '-';
    //     return (
    //       <Tag color={TrackingStatus[record.tracking_status]['color']} key={record.tracking_status}>
    //         {TrackingStatus[record.tracking_status]['text']}
    //       </Tag>
    //     );
    //   },
    // },
    // {
    //   title: '订单过期时间',
    //   dataIndex: 'expire_time',
    //   align: 'center',
    //   width: 160,
    //   valueType: 'dateRange',
    //   render: (_: React.ReactNode, record: API.OrderListType) => {
    //     return record.expire_time ? dayjs.unix(record.expire_time).format('YYYY-MM-DD HH:mm:ss') : '';
    //   },
    //   sorter: (a, b) => a.expire_time - b.expire_time,
    // },
    {
      title: '下单时间',
      dataIndex: 'at_time',
      valueType: 'dateRange',
      align: 'center',
      width: 160,
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return record.at_time ? dayjs.unix(record.at_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.at_time - b.at_time,
    },
    // {
    //   title: '预约发货时间',
    //   dataIndex: 'exp_ship_time',
    //   align: 'center',
    //   width: 160,
    //   valueType: 'dateRange',
    //   render: (_: React.ReactNode, record: API.OrderListType) => {
    //     return record.exp_ship_time ? dayjs.unix(record.exp_ship_time).format('YYYY-MM-DD HH:mm:ss') : '';
    //   },
    //   sorter: (a, b) => a.exp_ship_time - b.exp_ship_time,
    // },
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
    },
  ];

  const columnsNew: ProColumns<API.OrderListType>[] =
    userinfo?.role_id === 6 || userinfo?.role_id === 7
      ? [
          ...columns,
          {
            title: '操作',
            key: 'action',
            valueType: 'option',
            align: 'center',
            fixed: 'right',
            width: 80,
            render: (_: React.ReactNode, record: API.OrderListType) => [
              <Button
                type="link"
                key="promotion"
                disabled={record.order_status !== 2 && record.order_status !== 15}
                onClick={() => selectMenu('promotion', record)}
              >
                升单
              </Button>,
            ],
          },
        ]
      : columns;

  return (
    <>
      <ProTable<API.OrderListType>
        headerTitle={
          <Space>
            <span>当前客户订单列表</span>
            <Button
              key="add"
              type="primary"
              onClick={() => {
                setModalVisible(true);
                setFields({
                  id: new Date().getTime(),
                  post_receiver: curCustomer.name,
                  post_tel: curCustomer.phone,
                  post_address: curCustomer.addr,
                  source_id: curCustomer.source_form === 0 ? undefined : curCustomer.source_form,
                });
              }}
            >
              添加订单
            </Button>
          </Space>
        }
        loading={loading}
        rowKey="id"
        columns={columnsNew}
        dataSource={orderList}
        search={false}
        pagination={false}
        dateFormatter="number"
        options={{ reload: handleFetch }}
        scroll={{ x: '100%', y: 500 }}
      />
      <AddEdit title="添加订单" modalVisible={modalVisible} onClose={handleClose} onSubmit={handleAddEdit} fields={fields} />
      <AddEditOrder
        title={title}
        modalVisible={promotVisible}
        onClose={handleClose}
        onSubmit={handleAddEditOrder}
        fields={fields}
        isPromotion={true}
      />
    </>
  );
};

export default OrderListByCus;
