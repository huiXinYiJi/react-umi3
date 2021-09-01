import React, { useState, useRef, useEffect } from 'react';
import type { ProColumnType, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { FormInstance } from 'antd/lib/form';
import dayjs from 'dayjs';
import AddEdit from './components/addEdit';
import SetRole from './components/setRole';
import type { SetNodesPerType } from './components/setRole';

const Role: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const dispatch = useDispatch();
  const list = useSelector((state: ConnectState) => state.role.list);
  const loading = useSelector((state: ConnectState) => state.loading.effects['role/fetch']);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('添加');
  const [fields, setFields] = useState<Partial<API.RoleListType> | undefined>(undefined);
  const [roleVisible, setRoleVisible] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<API.AuthListType[] | undefined>(undefined);

  useEffect(() => {
    handleFetch();
  }, [1]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'role/fetch',
    });
  };

  // 删除
  const handleDelete = (record: API.RoleListType) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '您确定要删除此项数据？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'role/delete',
          payload: { id: record.id },
          callback: (res: API.ApiDataType<null>) => {
            message.success(res.msg);
            handleFetch();
          },
        });
      },
    });
  };

  // 编辑 删除 设置权限 点击事件触发弹窗
  const selectMenu = (key: string, record: API.RoleListType) => {
    switch (key) {
      case 'edit':
        setTitle('编辑');
        setFields(record);
        setModalVisible(true);
        break;
      // 设置权限
      case 'set-permis':
        setFields(record);
        dispatch({
          type: 'role/fetchRolePermis',
          payload: { id: record.id },
          callback: (res: API.ApiDataType<{ access_list: API.AuthListType[]; roleId: number }>) => {
            setTreeData(res.data.access_list);
          },
        });
        setRoleVisible(true);
        break;
      // 删除
      case 'delete':
        handleDelete(record);
        break;
      default:
        break;
    }
  };

  // 编辑添加
  const handleAddEdit = async (fields: Partial<Pick<API.RoleListType, 'id' | 'title' | 'description'>>, form: FormInstance) => {
    const type = fields.id ? 'role/edit' : 'role/add';
    dispatch({
      type,
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
    setFields(undefined);
    setRoleVisible(false);
    setTreeData(undefined);
  };

  // 设置权限
  const handleSetRole = (fields: SetNodesPerType, form: FormInstance) => {
    dispatch({
      type: 'role/updateNode',
      payload: { ...fields },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        handleFetch();
      },
    });
  };

  const columns: ProColumnType<API.RoleListType>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      width: 80,
    },
    {
      title: '角色名称',
      dataIndex: 'title',
      align: 'center',
    },
    {
      title: '角色描述',
      dataIndex: 'description',
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'add_time',
      valueType: 'dateTime',
      align: 'center',
      render: (_: React.ReactNode, record: API.RoleListType) => {
        return record.add_time ? dayjs.unix(record.add_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      align: 'center',
      render: (_: React.ReactNode, record: API.RoleListType) => [
        <a key="edit" onClick={() => selectMenu('edit', record)}>
          编辑
        </a>,
        record.id !== 1 && (
          <a key="set-permis" onClick={() => selectMenu('set-permis', record)}>
            设置权限
          </a>
        ),
        // record.id !== 1 && (
        //   <a key="delete" className="custom-a-dangerous" onClick={() => selectMenu('delete', record)}>
        //     删除
        //   </a>
        // ),
      ],
    },
  ];

  return (
    <>
      <ProTable<API.RoleListType>
        loading={loading}
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        dataSource={list}
        search={false}
        sticky
        pagination={false}
        dateFormatter="number"
        headerTitle={
          <Button
            key="button"
            type="primary"
            onClick={() => {
              setTitle('添加');
              setFields(undefined);
              setModalVisible(true);
            }}
          >
            添加角色
          </Button>
        }
        options={false}
      />
      <AddEdit title={title} modalVisible={modalVisible} onClose={handleClose} onSubmit={handleAddEdit} fields={fields} />
      <SetRole modalVisible={roleVisible} treeData={treeData} fields={fields} onClose={handleClose} onSubmit={handleSetRole} />
    </>
  );
};

export default Role;
