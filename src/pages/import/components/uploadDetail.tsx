import React, { useRef, useEffect, useState } from 'react';
import { Tag, Drawer, Typography } from 'antd';
import { useDispatch, useSelector } from 'umi';
import ProTable from '@ant-design/pro-table';
import type { FormInstance } from 'antd/lib/form';
import type { ConnectState } from '@/models/connect';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import type { TablePaginationConfig } from 'antd/lib/table';
import type { FieldsItem } from './uploadRecord';
import { DataStatus } from '@/utils/value.config';

const { Text } = Typography;

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: () => void;
  fields: FieldsItem | undefined;
}

type TableSearchType = {
  current: number;
  pageSize: number;
  id: number;
} & API.ImportDetailType;

// 页面逻辑
const UploadDetail: React.FC<ModalProps> = (props) => {
  const { fields, title, modalVisible, onClose } = props;
  const dispatch = useDispatch();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const {
    detailData: { list, total },
  } = useSelector((state: ConnectState) => state.import);
  const loading = useSelector((state: ConnectState) => state.loading.effects['import/fetchDetail']);
  const [params, setParams] = useState<Partial<TableSearchType>>({
    current: 1,
    pageSize: 20,
  });

  useEffect(() => {
    fields?.id && modalVisible && handleFetch();
  }, [modalVisible, params]);

  // 获取table数据
  const handleFetch = async () => {
    if (!fields?.id) return false;
    dispatch({
      type: 'import/fetchDetail',
      payload: {
        ...params,
        id: fields.id,
      },
    });
  };

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

  // table 列表配置项
  const columns: ProColumns<API.ImportDetailType>[] = [
    {
      title: '订单号',
      dataIndex: 'order_id',
      align: 'center',
      fixed: 'left',
      width: 250,
      render: (_: React.ReactNode, record: API.ImportDetailType) => {
        return <Text copyable>{record.order_id}</Text>;
      },
    },
    {
      title: '数据状态',
      dataIndex: 'is_status',
      valueType: 'radioButton',
      align: 'center',
      width: 100,
      valueEnum: DataStatus,
      render: (_: React.ReactNode, record: API.ImportDetailType) => {
        if (DataStatus[record.is_status] === undefined) return '-';
        return (
          <Tag color={DataStatus[record.is_status]['color']} key={record.is_status}>
            {DataStatus[record.is_status]['text']}
          </Tag>
        );
      },
      fieldProps: {
        buttonStyle: 'solid',
      },
    },
    {
      title: '客户名称',
      dataIndex: 'name',
      align: 'center',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '手机',
      dataIndex: 'phone',
      align: 'center',
      width: 120,
      hideInSearch: true,
      render: (_: React.ReactNode, record: API.ImportDetailType) => {
        return <Text copyable>{record.phone}</Text>;
      },
    },
    {
      title: '地址',
      dataIndex: 'address',
      align: 'center',
      width: 200,
      hideInSearch: true,
      render: (_: React.ReactNode, record: API.ImportDetailType) => {
        return <Text copyable>{record.address}</Text>;
      },
    },
    {
      title: '商品编码',
      dataIndex: 'goods_code',
      align: 'center',
      width: 120,
      render: (_: React.ReactNode, record: API.ImportDetailType) => {
        return <Text copyable>{record.goods_code}</Text>;
      },
      ellipsis: true,
    },
    {
      title: '订单数量',
      dataIndex: 'num',
      align: 'center',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '到付金额（￥）',
      dataIndex: 'arrive_pay',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '实收金额（￥）',
      dataIndex: 'receive_pay',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '渠道来源',
      dataIndex: 'source',
      align: 'center',
      width: 160,
      hideInSearch: true,
      fixed: 'right',
    },
  ];

  return (
    <Drawer
      visible={modalVisible}
      title={title}
      forceRender
      destroyOnClose
      maskClosable
      keyboard={false}
      onClose={() => {
        setParams((prev) => ({
          pageSize: 20,
          current: 1,
        }));
        onClose();
      }}
      contentWrapperStyle={{ maxWidth: '100%' }}
      width="90%"
    >
      <ProTable<API.ImportDetailType>
        headerTitle={fields?.original_name || ''}
        loading={loading}
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        dataSource={list}
        search={{
          labelWidth: 100,
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
        options={{
          reload: () => {
            handleFetch();
          },
        }}
        onChange={onTableChange}
        onSubmit={onFormSubmit}
        scroll={{ x: '100%' }}
      />
    </Drawer>
  );
};

export default UploadDetail;
