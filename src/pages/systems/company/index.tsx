import React, { useState, useRef, useEffect } from 'react';
import type { ProColumnType, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space } from 'antd';
import { useDispatch, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { FormInstance } from 'antd/lib/form';
import type { TablePaginationConfig } from 'antd/lib/table';
import dayjs from 'dayjs';
import AddEdit from './components/addEdit';

export type FieldsItem = Partial<API.CompanyListType>;

type TableSearchType = {
  current?: number;
  pageSize?: number;
  name?: string;
};

const Company: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const dispatch = useDispatch();
  const { list, total } = useSelector((state: ConnectState) => state.company);
  const loading = useSelector((state: ConnectState) => state.loading.effects['company/fetch']);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('添加');
  const [fields, setFields] = useState<FieldsItem | undefined>(undefined);
  const [params, setParams] = useState<TableSearchType>({
    current: 1,
    pageSize: 20,
  });

  useEffect(() => {
    handleFetch();
  }, [params]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'company/fetch',
      payload: {
        ...params,
      },
    });
  };

  // 编辑 删除 设置权限 点击事件触发弹窗
  const selectMenu = (key: string, record: API.CompanyListType | undefined) => {
    switch (key) {
      case 'add':
        setTitle('添加');
        setFields(undefined);
        setModalVisible(true);
        break;
      case 'edit':
        setTitle('编辑');
        setFields(record);
        setModalVisible(true);
        break;
      default:
        break;
    }
  };

  // 添加/编辑
  const handleAddEdit = async (fields: FieldsItem, form: FormInstance) => {
    const type = fields.id ? 'company/edit' : 'company/add';
    dispatch({
      type,
      payload: { ...fields },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        if (fields.id) {
          handleFetch();
        } else {
          setParams((prev) => ({
            ...prev,
            current: 1,
          }));
        }
      },
    });
  };

  // 关闭弹窗
  const handleClose = (form: FormInstance) => {
    form.resetFields();
    setModalVisible(false);
    setFields(undefined);
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
  const columns: ProColumnType<API.CompanyListType>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '公司名',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '公司编号',
      dataIndex: 'social_code',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      align: 'center',
      render: (_: React.ReactNode, record: API.CompanyListType) => (
        <Space size={3} direction="vertical">
          <a key="edit" onClick={() => selectMenu('edit', record)}>
            编辑
          </a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<API.CompanyListType>
        loading={loading}
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        dataSource={list}
        search={false}
        sticky
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
          <Button key="button" type="primary" onClick={() => selectMenu('add', undefined)}>
            添加公司
          </Button>
        }
        options={{
          reload: false,
          setting: false,
          density: false,
          search: {
            onSearch: (value) => onFormSubmit({ name: value }),
            placeholder: '请输入公司名',
          },
        }}
        onChange={onTableChange}
      />
      <AddEdit title={title} modalVisible={modalVisible} onClose={handleClose} onSubmit={handleAddEdit} fields={fields} />
    </>
  );
};

export default Company;
