import React, { useState, useEffect } from 'react';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions/lib';
import { Drawer, Tag, Tabs } from 'antd';
import { CustomerSex, CustomerStatus, CusInfoMenuTabs } from '@/utils/value.config';
import dayjs from 'dayjs';
import PhoneRecord from '@/pages/customer/phoneRecord';
import LogIndex from '@/pages/log';
import OrderListByCus from './orderListByCus';

const { TabPane } = Tabs;

type DetailProps = {
  data?: API.CustomerListType;
  modalVisible: boolean;
  onClose: () => void;
};

const CustomerDetail: React.FC<DetailProps> = (props) => {
  const { modalVisible, data, onClose } = props;
  const [status, setStatus] = useState<number>(1);
  const [startFetch, setStartFetch] = useState<boolean>(false);

  useEffect(() => {
    if (modalVisible && status === 1 && data) {
      setStartFetch(true);
    } else {
      setStartFetch(false);
    }
  }, [modalVisible, status]);

  const columns: ProDescriptionsItemProps<API.CustomerListType>[] = [
    {
      title: '客户姓名',
      dataIndex: 'name',
    },
    {
      title: '客户电话',
      dataIndex: 'phone',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      valueType: 'radioButton',
      valueEnum: CustomerSex,
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        if (CustomerSex[record.sex] === undefined) return '-';
        return CustomerSex[record.sex]['text'];
      },
    },
    {
      title: '微信号',
      dataIndex: 'wechat',
    },
    {
      title: '客户来源',
      dataIndex: 'source_form',
      valueType: 'select',
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        return record.client_source;
      },
    },
    {
      title: '详细地址',
      dataIndex: 'addr',
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
    {
      title: '所属人',
      dataIndex: 'user_name',
    },
    {
      title: '订单个数',
      dataIndex: 'order_num',
      valueType: 'digit',
    },
    {
      title: '客户状态',
      dataIndex: 'is_status',
      valueType: 'radio',
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        return (
          <Tag color={CustomerStatus[record.is_status]['color']} key={record.is_status}>
            {CustomerStatus[record.is_status]['text']}
          </Tag>
        );
      },
      hideInSearch: true,
    },
    {
      title: '加入时间',
      dataIndex: 'at_time',
      valueType: 'dateRange',
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        return record.at_time ? dayjs.unix(record.at_time).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
    {
      title: '最后下单时间',
      dataIndex: 'update_time',
      valueType: 'dateRange',
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        return record.last_order_time ? dayjs.unix(record.last_order_time).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
  ];

  return (
    <>
      <Drawer
        visible={modalVisible}
        width={'80%'}
        onClose={() => {
          setStatus(1);
          onClose();
        }}
      >
        <Tabs
          defaultActiveKey="1"
          activeKey={status + ''}
          tabPosition="top"
          type="card"
          tabBarGutter={0}
          onChange={(activeKey) => setStatus(Number(activeKey))}
        >
          {Object.keys(CusInfoMenuTabs).map((key: string) => (
            <TabPane tab={CusInfoMenuTabs[Number(key)].text} key={key}></TabPane>
          ))}
        </Tabs>
        {data &&
          (status === 1 ? (
            <>
              <div style={{ padding: '24px' }}>
                <ProDescriptions title={false} columns={columns} dataSource={data} />
              </div>
              <OrderListByCus startFetch={startFetch} curCustomer={data} />
            </>
          ) : status === 2 ? (
            <PhoneRecord customerData={data} />
          ) : status === 5 ? (
            <LogIndex forType="custom" id={data.cid} />
          ) : null)}
      </Drawer>
    </>
  );
};

export default CustomerDetail;
