import React, { useState, useEffect } from 'react';
import { Space, Button, Tag, Popconfirm, message, Table, Badge, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'umi';
import AddEdit, { isShowList, isStatusList } from './components/addEdit';
import type { treeDataType } from './components/addEdit';
import type { FormInstance } from 'antd/lib/form';
import type { ConnectState } from '@/models/connect';
import type { ColumnProps } from 'antd/es/table';
import { QuestionCircleOutlined } from '@ant-design/icons';

// 表单字段
export type FieldsItem = Partial<API.AuthListType>;

const Node: React.FC = () => {
  const dispatch = useDispatch();
  const list = useSelector((state: ConnectState) => state.node.list);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('添加');
  const [fields, setFields] = useState<FieldsItem | undefined>(undefined);
  const [treeData, setTreeData] = useState<treeDataType[]>([]);
  const loading = useSelector((state: ConnectState) => state.loading.effects['node/fetch']);

  useEffect(() => {
    handleFetch();
  }, [1]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'node/fetch',
      callback: (res: API.ApiDataType<API.AuthListType[]>) => {
        setTreeData(getTreeData(res.data));
      },
    });
  };

  // 重构弹窗中父级目录树形数据
  const getTreeData = (list: API.AuthListType[]): treeDataType[] => {
    const copy: API.AuthListType[] = JSON.parse(JSON.stringify(list));
    const menusArr: treeDataType[] = [];
    menusArr.push({
      value: 0,
      title: '根目录',
    });

    const loop = (arr: API.AuthListType[]) => {
      const res: treeDataType[] = [];
      arr.map((item: API.AuthListType) => {
        // if (item.is_status === 0) {
        const obj: treeDataType = {
          value: item.id,
          title: item.title,
        };
        if (item.hasOwnProperty('children') && item.children && item.children.length > 0) {
          const children = loop(item.children!);
          obj.children = children;
        }
        res.push(obj);
        // }
        return item;
      });
      return res;
    };
    menusArr.push(...loop(copy));
    return menusArr;
  };

  // 删除
  const handleDelete = async (row: API.AuthListType) => {
    dispatch({
      type: 'node/delete',
      payload: { id: row.id },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleFetch();
      },
    });
  };

  // 编辑添加
  const handleAddEdit = async (fields: FieldsItem, form: FormInstance) => {
    const type = fields.id ? 'node/edit' : 'node/add';
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
  };

  const TipIcon = <QuestionCircleOutlined style={{ marginLeft: '3px' }} />;

  // table列表配置
  const columns: ColumnProps<API.AuthListType>[] = [
    {
      title: '名称',
      dataIndex: 'title',
    },
    {
      title: '布局组件',
      dataIndex: 'layout',
      align: 'center',
    },
    {
      title: '组件标识',
      dataIndex: 'component',
      align: 'center',
    },
    {
      title: '前端地址',
      dataIndex: 'web_path',
      align: 'center',
    },
    {
      title: () => {
        return (
          <Tooltip title="is_status: 目录(0)/节点(1)">
            类型
            {TipIcon}
          </Tooltip>
        );
      },
      dataIndex: 'is_status',
      align: 'center',
      render: (_: React.ReactNode, record: API.AuthListType) => {
        const status = record.is_status;
        return status !== null && status !== undefined ? (
          <Badge status={isStatusList[status].status} text={isStatusList[status].text} />
        ) : null;
      },
    },
    {
      title: '接口路径',
      dataIndex: 'api_path',
      align: 'center',
    },
    {
      title: () => {
        return (
          <Tooltip title="is_show: 显示(0)/隐藏(1)">
            状态
            {TipIcon}
          </Tooltip>
        );
      },
      dataIndex: 'is_show',
      align: 'center',
      render: (_: React.ReactNode, record: API.AuthListType) => {
        return record.is_show !== null && record.is_show !== undefined ? (
          <Tag color={isShowList[record.is_show].status}>{isShowList[record.is_show].text}</Tag>
        ) : null;
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 80,
      render: (_: React.ReactNode, record: API.AuthListType) => (
        <Space size={3} direction="vertical">
          <a
            onClick={() => {
              setTitle('编辑');
              setFields(record);
              setModalVisible(true);
            }}
          >
            编辑
          </a>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record)}>
            <a className="custom-a-dangerous">删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button
        key="add"
        type="primary"
        style={{ marginBottom: '10px' }}
        onClick={() => {
          setFields(undefined);
          setTitle('添加');
          setModalVisible(true);
        }}
      >
        添加
      </Button>
      <Table<API.AuthListType>
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={false}
        expandable={{
          indentSize: 8,
        }}
      />
      <AddEdit
        title={title}
        modalVisible={modalVisible}
        treeData={treeData}
        onClose={handleClose}
        onSubmit={handleAddEdit}
        fields={fields}
      />
    </>
  );
};

export default Node;
