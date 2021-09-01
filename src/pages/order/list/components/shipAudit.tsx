import React, { useRef } from 'react';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions/lib';
import type { FormInstance } from 'antd/lib/form';
import { DrawerForm, ProFormTextArea } from '@ant-design/pro-form';
import { Space, Tag, Button, message } from 'antd';
import { ToPaysStatus, TrackingStatus, OrderStatus, TrackingCompany, PayType } from '@/utils/value.config';
import dayjs from 'dayjs';
import type { FieldsItem } from '../index';
import type { SubmitterProps } from '@ant-design/pro-form/lib/components/Submitter';

type DetailProps = {
  title: string;
  fields?: API.OrderListType;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
};

const ShipAudit: React.FC<DetailProps> = (props) => {
  const { title, modalVisible, onClose, onSubmit, fields } = props;
  const formRef = useRef<FormInstance>();

  // 提交表单数据
  const onFinish = async (values: FieldsItem, type?: string) => {
    if (fields) {
      if (type) {
        // 驳回  订单状态为 重新处理
        if (!values.turn_down?.trim()) {
          message.warning('请输入驳回理由');
          return false;
        }
        const params = Object.assign({}, values, { id: fields.id, order_status: 15 });
        onSubmit(params, formRef!.current!);
      } else {
        // 审核通过 订单状态改为 发货中
        const params = { id: fields.id, order_status: 13 };
        onSubmit(params, formRef!.current!);
      }
    }
  };

  const columns: ProDescriptionsItemProps<API.OrderListType>[] = [
    {
      title: '客户联系人',
      dataIndex: 'post_receiver',
    },
    {
      title: '下单时间',
      dataIndex: 'at_time',
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return record.at_time ? dayjs.unix(record.at_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    },
    {
      title: '订单号',
      dataIndex: 'order_id',
    },
    {
      title: '商品名称',
      dataIndex: 'product_name',
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
      title: '渠道名称',
      dataIndex: 'source_id',
      renderText: (_: string, record: API.OrderListType) => {
        return record.source_name;
      },
    },
    {
      title: '订单地址',
      dataIndex: 'post_address',
    },
    {
      title: '手机号',
      dataIndex: 'post_tel',
    },
    {
      title: '订单状态',
      dataIndex: 'order_status',
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
      title: '订单金额(￥)',
      dataIndex: 'order_amount',
    },
    {
      title: '店铺收款(￥)',
      dataIndex: 'has_pay',
    },
    {
      title: '到付金额(￥)',
      dataIndex: 'to_pay',
    },
    {
      title: '线下收款(￥)',
      dataIndex: 'offline_pay',
    },
    {
      title: '成交途径',
      dataIndex: 'order_pathway',
    },
    {
      title: '所属人',
      dataIndex: 'username',
    },
    // {
    //   title: '退款状态',
    //   dataIndex: 'refund_status',
    // },
    {
      title: '关闭原因',
      dataIndex: 'cancel_reason',
    },
    {
      title: '买家留言',
      dataIndex: 'buyer_words',
    },
    {
      title: '商家备注',
      dataIndex: 'seller_words',
    },
    {
      title: '订单备注',
      dataIndex: 'remark',
    },
    {
      title: '支付流水号',
      dataIndex: 'payment_no',
    },
    {
      title: '支付类型',
      dataIndex: 'pay_type',
      render: (_: React.ReactNode, record: API.OrderListType) => {
        if (!PayType[record.pay_type]) return '-';
        return (
          <Tag color={PayType[record.pay_type]['color']} key={record.pay_type}>
            {PayType[record.pay_type]['text']}
          </Tag>
        );
      },
    },
    // {
    //   title: '代收货款状态',
    //   dataIndex: 'to_paystatus',
    //   render: (_: React.ReactNode, record: API.OrderListType) => {
    //     if (!ToPaysStatus[record.to_paystatus]) return '-';
    //     return (
    //       <Tag color={ToPaysStatus[record.to_paystatus]['color']} key={record.to_paystatus}>
    //         {ToPaysStatus[record.to_paystatus]['text']}
    //       </Tag>
    //     );
    //   },
    // },
    {
      title: '配送快递',
      dataIndex: 'tracking_company',
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
    },
    // {
    //   title: '物流状态',
    //   dataIndex: 'tracking_status',
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
    //   render: (_: React.ReactNode, record: API.OrderListType) => {
    //     return record.expire_time ? dayjs.unix(record.expire_time).format('YYYY-MM-DD HH:mm:ss') : '';
    //   },
    // },
    // {
    //   title: '预约发货时间',
    //   dataIndex: 'exp_ship_time',
    //   render: (_: React.ReactNode, record: API.OrderListType) => {
    //     return record.exp_ship_time ? dayjs.unix(record.exp_ship_time).format('YYYY-MM-DD HH:mm:ss') : '';
    //   },
    // },
    {
      title: '发货时间',
      dataIndex: 'ship_time',
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return record.ship_time ? dayjs.unix(record.ship_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    },
    {
      title: '退款时间',
      dataIndex: 'refund_time',
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return record.refund_time ? dayjs.unix(record.refund_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    },
    {
      title: '订单完成时间',
      dataIndex: 'finish_time',
      render: (_: React.ReactNode, record: API.OrderListType) => {
        return record.finish_time ? dayjs.unix(record.finish_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    },
  ];

  return (
    <>
      <DrawerForm
        formRef={formRef}
        visible={modalVisible}
        title={title}
        drawerProps={{
          forceRender: true,
          destroyOnClose: true,
          maskClosable: true,
          keyboard: false,
          onClose: () => onClose(formRef!.current!),
          contentWrapperStyle: {
            maxWidth: '100%',
          },
          width: '80%',
        }}
        submitter={{
          render: (props: SubmitterProps & { form?: FormInstance }, defaultDoms) => {
            return [
              ...defaultDoms,
              <Button
                key="turnDown"
                danger
                onClick={() => {
                  onFinish(props?.form?.getFieldsValue(), 'turnDown');
                }}
              >
                驳回
              </Button>,
            ];
          },
          searchConfig: {
            submitText: '审核通过',
            resetText: '取消',
          },
          submitButtonProps: {
            style: {
              display: fields?.order_status === 1 ? 'block' : 'none', // 待审核 显示 审核通过按钮
            },
          },
        }}
        onFinish={(values: FieldsItem) => onFinish(values)}
      >
        <div style={{ padding: '24px' }}>
          <ProDescriptions title={false} columns={columns} dataSource={fields} />
        </div>
        <ProFormTextArea name="turn_down" label="驳回理由" placeholder="请输入驳回理由" />
      </DrawerForm>
    </>
  );
};

export default ShipAudit;
