import React, { useState, useRef, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Space, Tag } from 'antd';
import { useDispatch, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { FormInstance } from 'antd/lib/form';
import type { TablePaginationConfig } from 'antd/lib/table';
import dayjs from 'dayjs';
import AddEdit from './components/addEdit';
import { ForType } from '@/utils/value.config';
import { timeRangeFieldProps } from '@/utils/antd.config';

export type FieldsItem = Partial<API.PhoneRecordType>;

type TableSearchType = {
  current?: number;
  pageSize?: number;
} & Partial<API.PhoneRecordType>;

type PhoneRecordProps = {
  customerData?: API.CustomerListType; // 客户数据
};

const PhoneRecord: React.FC<PhoneRecordProps> = (props) => {
  const { customerData } = props;
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const dispatch = useDispatch();
  const list = useSelector((state: ConnectState) => state.phoneRecord.list);
  const total = useSelector((state: ConnectState) => state.phoneRecord.total);
  const loading = useSelector((state: ConnectState) => state.loading.effects['phoneRecord/fetch']);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('添加');
  const [params, setParams] = useState<TableSearchType>({
    current: 1,
    pageSize: 20,
    cid: customerData?.cid,
  });

  useEffect(() => {
    handleFetch();
  }, [params]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'phoneRecord/fetch',
      payload: {
        ...params,
      },
    });
  };

  // 点击事件触发弹窗
  const selectMenu = (key: string, record: API.PhoneRecordType | undefined) => {
    switch (key) {
      case 'add':
        setTitle('添加回访记录');
        setModalVisible(true);
        break;
      default:
        break;
    }
  };

  // add
  const handleAddEdit = async (fields: FieldsItem, form: FormInstance) => {
    dispatch({
      type: 'phoneRecord/add',
      payload: { ...fields },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        setParams((prev) => ({
          ...prev,
          current: 1,
        }));
      },
    });
  };

  // 关闭弹窗
  const handleClose = (form: FormInstance) => {
    form.resetFields();
    setModalVisible(false);
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
      cid: customerData?.cid,
    }));
  };

  // 重置表单
  const onFormReset = () => {
    formRef?.current?.resetFields(['for_type', 'at_time']);
  };

  // table 列表配置项
  const columns: ProColumns<API.PhoneRecordType>[] = [
    {
      title: '客户名称',
      dataIndex: 'client_name',
      align: 'center',
      width: 100,
      hideInSearch: customerData !== undefined,
    },
    {
      title: '回访方式',
      dataIndex: 'for_type',
      valueType: 'radioButton',
      align: 'center',
      valueEnum: ForType,
      render: (_: React.ReactNode, record: API.PhoneRecordType) => {
        if (ForType[record.for_type] === undefined) return '-';
        return (
          <Tag color={ForType[record.for_type]['color']} key={record.for_type}>
            {ForType[record.for_type]['text']}
          </Tag>
        );
      },
      width: 100,
      fieldProps: {
        buttonStyle: 'solid',
      },
    },
    {
      title: '操作用户',
      dataIndex: 'user_name',
      align: 'center',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '记录时间',
      dataIndex: 'at_time',
      valueType: 'dateRange',
      align: 'center',
      width: 160,
      render: (_: React.ReactNode, record: API.PhoneRecordType) => {
        return record.at_time ? dayjs.unix(record.at_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.at_time - b.at_time,
      fieldProps: timeRangeFieldProps(),
    },
  ];

  return (
    <>
      <ProTable<API.PhoneRecordType>
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
        headerTitle={
          <Space>
            <Button key="add" type="primary" onClick={() => selectMenu('add', undefined)}>
              添加回访记录
            </Button>
          </Space>
        }
        options={{
          reload: () => {
            handleFetch();
          },
        }}
        onSubmit={onFormSubmit}
        onReset={onFormReset}
        onChange={onTableChange}
        scroll={{ x: '100%' }}
        sticky
      />
      <AddEdit title={title} customerData={customerData} modalVisible={modalVisible} onClose={handleClose} onSubmit={handleAddEdit} />
    </>
  );
};

export default PhoneRecord;
