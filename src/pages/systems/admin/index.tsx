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

export type FieldsItem = Partial<API.AdminRoleListType>;

const Admin: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const dispatch = useDispatch();
  const list = useSelector((state: ConnectState) => state.adminRole.list);
  const total = useSelector((state: ConnectState) => state.adminRole.total);
  const loading = useSelector((state: ConnectState) => state.loading.effects['adminRole/fetch']);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('添加');
  const [fields, setFields] = useState<FieldsItem | undefined>(undefined);
  const [params, setParams] = useState<Partial<API.AdminRoleGet>>({
    current: 1,
    pageSize: 20,
  });

  useEffect(() => {
    handleFetch();
  }, [params]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'adminRole/fetch',
      payload: {
        ...params,
      },
    });
  };

  // 编辑 删除 设置权限 点击事件触发弹窗
  const selectMenu = (key: string, record: API.AdminRoleListType | undefined) => {
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
      // 删除
      case 'delete':
        record && handleDelete(record);
        break;
      default:
        break;
    }
  };

  // 添加/编辑
  const handleAddEdit = async (fields: FieldsItem, form: FormInstance) => {
    const type = fields.id ? 'adminRole/update' : 'adminRole/add';
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

  // 删除
  const handleDelete = (record: API.AdminRoleListType) => {
    dispatch({
      type: 'adminRole/delete',
      payload: { id: record.id },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
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
  const columns: ProColumnType<API.AdminRoleListType>[] = [
    {
      title: '管理员ID',
      dataIndex: 'id',
      align: 'center',
      hideInSearch: true,
      sorter: (a, b) => a.id - b.id,
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      align: 'center',
    },
    {
      title: '座席编号',
      dataIndex: 'work_no',
      align: 'center',
      width: 100,
    },
    {
      title: '角色',
      dataIndex: 'role_name',
      align: 'center',
      hideInSearch: true,
      render: (_: React.ReactNode, record: API.AdminRoleListType) => {
        return record.role.title;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'add_time',
      valueType: 'dateTime',
      align: 'center',
      render: (_: React.ReactNode, record: API.AdminRoleListType) => {
        return record.add_time ? dayjs.unix(record.add_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.add_time - b.add_time,
      hideInSearch: true,
    },
    {
      title: '最后登陆时间',
      dataIndex: 'update_time',
      valueType: 'dateTime',
      align: 'center',
      render: (_: React.ReactNode, record: API.AdminRoleListType) => {
        return record.update_time ? dayjs.unix(record.update_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.update_time! - b.update_time!,
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      align: 'center',
      width: 80,
      render: (_: React.ReactNode, record: API.AdminRoleListType) => (
        <Space size={3} direction="vertical">
          <a key="edit" onClick={() => selectMenu('edit', record)}>
            编辑
          </a>
          <Popconfirm key="delete" title="确定删除?" onConfirm={() => selectMenu('delete', record)}>
            <a className="custom-a-dangerous">删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<API.AdminRoleListType>
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
            添加管理员
          </Button>
        }
        options={{
          reload: false,
          setting: false,
          density: false,
          search: {
            onSearch: (value) => onFormSubmit({ username: value }),
            placeholder: '请输入用户名',
          },
        }}
        onChange={onTableChange}
      />
      <AddEdit title={title} modalVisible={modalVisible} onClose={handleClose} onSubmit={handleAddEdit} fields={fields} />
    </>
  );
};

export default Admin;
