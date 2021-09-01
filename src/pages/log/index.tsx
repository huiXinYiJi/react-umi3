import React, { useState, useRef, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useDispatch, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { FormInstance } from 'antd/lib/form';
import type { TablePaginationConfig } from 'antd/lib/table';
import dayjs from 'dayjs';

export type FieldsItem = {
  id?: number;
} & Partial<API.LogType>;

type TableSearchType = {
  current?: number;
  pageSize?: number;
} & Partial<API.LogType>;

type LogProps = {
  forType?: 'custom' | 'order'; // 类型
  id: number;
};

const LogIndex: React.FC<LogProps> = (props) => {
  const { forType, id } = props;
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const dispatch = useDispatch();
  const list = useSelector((state: ConnectState) => state.log.list);
  const total = useSelector((state: ConnectState) => state.log.total);
  const loading = useSelector((state: ConnectState) => state.loading.effects['log/fetch']);
  const [params, setParams] = useState<TableSearchType>({
    current: 1,
    pageSize: 20,
    // for_type: forType || undefined,
    for_id: id || undefined,
  });

  useEffect(() => {
    handleFetch();
  }, [params]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'log/fetch',
      payload: {
        ...params,
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
  const columns: ProColumns<API.LogType>[] = [
    {
      title: '操作人',
      dataIndex: 'username',
      align: 'center',
      width: 140,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      width: 150,
    },
    {
      title: '操作时间',
      dataIndex: 'at_time',
      valueType: 'dateRange',
      align: 'center',
      width: 160,
      render: (_: React.ReactNode, record: API.LogType) => {
        return record.at_time ? dayjs.unix(record.at_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.at_time - b.at_time,
    },
  ];

  return (
    <>
      <ProTable<API.LogType>
        loading={loading}
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        dataSource={list}
        search={false}
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
        onSubmit={onFormSubmit}
        onChange={onTableChange}
        scroll={{ x: '100%' }}
        sticky
      />
    </>
  );
};

export default LogIndex;
