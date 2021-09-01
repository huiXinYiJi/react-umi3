import React, { useState, useRef, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Space, Modal } from 'antd';
import { useDispatch, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { FormInstance } from 'antd/lib/form';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import AddEdit from './components/addEdit';

export type FieldsItem = {
  id?: number;
} & Partial<API.SourceListType>;

const SourceList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const dispatch = useDispatch();
  const { list } = useSelector((state: ConnectState) => state.source);
  const loading = useSelector((state: ConnectState) => state.loading.effects['source/fetch']);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('添加');
  const [fields, setFields] = useState<FieldsItem | undefined>(undefined);

  useEffect(() => {
    handleFetch();
  }, [1]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'source/fetch',
    });
  };

  // 编辑 删除 点击事件触发弹窗
  const selectMenu = (key: string, record: API.SourceListType | undefined) => {
    switch (key) {
      case 'add':
        setTitle('添加渠道');
        setFields(undefined);
        setModalVisible(true);
        break;
      case 'edit':
        setTitle('编辑渠道');
        setFields(record);
        setModalVisible(true);
        break;
      // 删除
      case 'delete':
        record && handleDelete(record.id);
        break;
      default:
        break;
    }
  };

  // 添加/编辑
  const handleAddEdit = async (fields: FieldsItem, form: FormInstance) => {
    const type = fields.id ? 'source/update' : 'source/add';
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

  // 删除 批量删除 id值用,隔开
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '您确定要删除此项数据吗？',
      icon: <ExclamationCircleOutlined />,
      content: '删除操作将不可撤销',
      onOk: () => {
        dispatch({
          type: 'source/delete',
          payload: { id },
          callback: (res: API.ApiDataType<null>) => {
            message.success(res.msg);
            handleFetch();
          },
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  // 关闭弹窗
  const handleClose = (form: FormInstance) => {
    form.resetFields();
    setModalVisible(false);
    setFields(undefined);
  };

  // table 列表配置项
  const columns: ProColumns<API.SourceListType>[] = [
    {
      title: '渠道名称',
      dataIndex: 'name',
      align: 'center',
      width: 200,
    },
    {
      title: '平台标识',
      dataIndex: 'platform',
      align: 'center',
      width: 200,
    },
    {
      title: '店铺ID',
      dataIndex: 'shop_id',
      align: 'center',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      align: 'center',
      width: 150,
      render: (_: React.ReactNode, record: API.SourceListType) => [
        <a key="edit" onClick={() => selectMenu('edit', record)}>
          编辑
        </a>,
        <a className="custom-a-dangerous" key="delete" onClick={() => selectMenu('delete', record)}>
          删除
        </a>,
      ],
    },
  ];

  return (
    <>
      <ProTable<API.SourceListType>
        loading={loading}
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        dataSource={list}
        search={false}
        pagination={false}
        dateFormatter="number"
        headerTitle={
          <Space>
            <Button key="add" type="primary" onClick={() => selectMenu('add', undefined)}>
              添加渠道
            </Button>
          </Space>
        }
        options={{ reload: handleFetch }}
        scroll={{ x: '100%' }}
        sticky
      />
      <AddEdit title={title} modalVisible={modalVisible} onClose={handleClose} onSubmit={handleAddEdit} fields={fields} />
    </>
  );
};

export default SourceList;
