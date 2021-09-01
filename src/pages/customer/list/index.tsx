import React, { useState, useRef, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Menu, Space, Tag, Modal } from 'antd';
import { useDispatch, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { FormInstance } from 'antd/lib/form';
import type { TablePaginationConfig } from 'antd/lib/table';
import dayjs from 'dayjs';
import AddEdit from './components/addEdit';
import BatchStatus from './components/batchStatus';
import Distribute from './components/distribute';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { CustomerSex, CustomerStatus, AssignType, SharedType, WxType } from '@/utils/value.config';
import CustomerDetail from './components/detail';
import { resetDataToSelect } from '@/utils';
import { timeRangeFieldProps } from '@/utils/antd.config';

export type FieldsItem = {
  id?: number;
} & Partial<API.CustomerListType>;

export type DistributeType = {
  uid: number[];
  cid: number[];
};

type TableSearchType = {
  current?: number;
  pageSize?: number;
} & Partial<API.CustomerListType>;

const CustomerList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const dispatch = useDispatch();
  const { list, total } = useSelector((state: ConnectState) => state.customer);
  const [sourceList, setSourceList] = useState<API.OptionsType<API.SourceListType>[]>([]);
  const [userList, setUserList] = useState<API.OptionsType<API.AdminRoleListType>[]>([]);
  const { userinfo } = useSelector((state: ConnectState) => state.app);
  const loading = useSelector((state: ConnectState) => state.loading.effects['customer/fetch']);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [batchVisible, setBatchVisible] = useState<boolean>(false);
  const [disVisible, setDisVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('添加');
  const [fields, setFields] = useState<FieldsItem | undefined>(undefined);
  const [params, setParams] = useState<TableSearchType>({
    current: 1,
    pageSize: 20,
  });
  const [status, setStatus] = useState<number>(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [detailRecord, setDetailRecord] = useState<API.CustomerListType | undefined>(undefined);
  const distributeTitle = userinfo?.is_super === 1 ? '分配' : '共享';

  useEffect(() => {
    handleFetch();
  }, [params, status]);

  useEffect(() => {
    handleSourceFetch();
    handleFetchUser();
  }, [1]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'customer/fetch',
      payload: {
        ...params,
        is_status: status === 0 ? undefined : status,
      },
    });
  };

  // 获取客户来源列表
  const handleSourceFetch = async () => {
    dispatch({
      type: 'source/fetch',
      callback: (res: API.SourceListType[]) => {
        setSourceList(resetDataToSelect(res, { label: 'name', value: 'id' }));
      },
    });
  };

  // 获取用户列表
  const handleFetchUser = async () => {
    if (userinfo?.is_super === 1) {
      dispatch({
        type: 'adminRole/fetch',
        payload: {
          current: 1,
          pageSize: 1000,
        },
        callback: (res: API.ApiDataType<{ lists: API.AdminRoleListType[] }>) => {
          setUserList(resetDataToSelect(res.data.lists, { label: 'username', value: 'id' }));
        },
      });
    }
  };

  // 编辑 删除 点击事件触发弹窗
  const selectMenu = (key: string, record: API.CustomerListType | undefined) => {
    switch (key) {
      case 'add':
        setTitle('添加客户');
        setFields(undefined);
        setModalVisible(true);
        break;
      case 'edit':
        setTitle('编辑客户');
        setFields(record);
        setModalVisible(true);
        break;
      // 客户详情
      case 'detail':
        setDetailVisible(true);
        setDetailRecord(record);
        break;
      // 批量修改状态
      case 'batchStatus':
        setBatchVisible(true);
        break;
      // 分配客户
      case 'distribute':
        setFields(record);
        // console.log(record);
        setDisVisible(true);
        break;
      // 删除
      case 'delete':
        if (record !== undefined) handleDelete(String(record.cid));
        break;
      default:
        break;
    }
  };

  // 分配客户
  const handleDistribute = (values: DistributeType, form: FormInstance) => {
    const { uid } = values;
    let cid: number[] = [];
    if (fields?.cid) {
      // 行内操作
      cid = [fields.cid];
    } else {
      // 批量操作
      cid = selectedRowKeys;
    }
    if (cid.length < uid.length) {
      message.warning(`您选择的用户人数应 <= 勾选的客户人数`);
      return false;
    }
    dispatch({
      type: 'customer/distribute',
      payload: { uid, cid },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        handleFetch();
        setSelectedRowKeys([]);
      },
    });
  };

  // 批量修改客户状态
  const handleBatchStatus = async (fields: FieldsItem, form: FormInstance) => {
    const { is_status } = fields;
    const cid = selectedRowKeys.length > 0 ? selectedRowKeys.join(',') : '';
    dispatch({
      type: 'customer/batchStatus',
      payload: { id: is_status, cid },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        handleFetch();
        setSelectedRowKeys([]);
      },
    });
  };

  // 编辑
  const handleAddEdit = async (fields: FieldsItem, form: FormInstance) => {
    const type = fields.id ? 'customer/update' : 'customer/add';
    dispatch({
      type,
      payload: { ...fields },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        setSelectedRowKeys([]);
        if (fields.id) {
          // 编辑  刷新当前页
          handleFetch();
        } else {
          // 添加 刷新到第一页
          setParams((prev) => ({
            ...prev,
            current: 1,
          }));
        }
      },
    });
  };

  // 删除 批量删除 id值用,隔开
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '您确定要删除此项数据吗？',
      icon: <ExclamationCircleOutlined />,
      content: '删除操作将不可撤销',
      onOk: () => {
        dispatch({
          type: 'customer/delete',
          payload: { id },
          callback: (res: API.ApiDataType<null>) => {
            message.success(res.msg);
            setSelectedRowKeys([]);
            setParams((prev) => ({
              ...prev,
              current: 1,
            }));
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
    setBatchVisible(false);
    setDisVisible(false);
    setFields(undefined);
  };

  // table change事件
  const onTableChange = (pagination: TablePaginationConfig) => {
    setSelectedRowKeys([]);
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

  // 客户状态 侧边栏
  const MenuElem = () => {
    return Object.keys(CustomerStatus).map((key: string) => {
      return <Menu.Item key={key}>{CustomerStatus[Number(key)].text}</Menu.Item>;
    });
  };

  // table 列表配置项
  const columns: ProColumns<API.CustomerListType>[] = [
    {
      title: '客户姓名',
      dataIndex: 'name',
      align: 'center',
      fixed: 'left',
      width: 140,
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        return (
          <a key="detail" onClick={() => selectMenu('detail', record)}>
            {record.name}
          </a>
        );
      },
    },
    {
      title: '一线',
      dataIndex: 'assign_type',
      align: 'center',
      width: 160,
      hideInTable: true,
      valueEnum: AssignType,
      hideInSearch: userinfo?.is_super !== 1,
    },
    {
      title: '二线',
      dataIndex: 'shared_type',
      align: 'center',
      width: 160,
      hideInTable: true,
      valueEnum: SharedType,
      hideInSearch: userinfo?.is_super !== 1,
    },
    {
      title: '客户电话',
      dataIndex: 'phone',
      align: 'center',
      width: 160,
    },
    {
      title: '加入时间',
      dataIndex: 'at_time',
      valueType: 'dateRange',
      align: 'center',
      width: 160,
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        return record.at_time ? dayjs.unix(record.at_time).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
      sorter: (a, b) => a.at_time - b.at_time,
      fieldProps: timeRangeFieldProps(),
    },
    {
      title: '客户微信号',
      dataIndex: 'wechat',
      align: 'center',
      width: 140,
    },
    {
      title: '客户微信状态',
      dataIndex: 'wx_type',
      align: 'center',
      width: 140,
      valueType: 'select',
      valueEnum: WxType,
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        if (record.wx_type === undefined) return '-';
        return (
          <Tag color={WxType[record.wx_type]['color']} key={record.wx_type}>
            {WxType[record.wx_type]['text']}
          </Tag>
        );
      },
    },
    {
      title: '客服微信号',
      dataIndex: 'kf_wechat',
      align: 'center',
      hideInSearch: true,
      width: 200,
    },
    {
      title: '客户来源',
      dataIndex: 'source_form',
      align: 'center',
      valueType: 'select',
      width: 140,
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        return record.client_source;
      },
      fieldProps: {
        options: sourceList,
        showSearch: true,
      },
    },
    {
      title: '详细地址',
      dataIndex: 'addr',
      align: 'center',
      hideInSearch: true,
      width: 200,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      hideInSearch: true,
      width: 200,
    },
    {
      title: '所属人',
      dataIndex: 'uid',
      align: 'center',
      width: 80,
      hideInSearch: userinfo?.is_super !== 1, // 超管可搜索
      ellipsis: true,
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        return record.user_name;
      },
      valueType: 'select',
      fieldProps: {
        options: userList,
        showSearch: true,
      },
    },
    {
      title: '订单个数',
      dataIndex: 'order_num',
      align: 'center',
      width: 100,
      valueType: 'digit',
      fieldProps: {
        min: 0,
        precision: 0,
      },
      sorter: (a, b) => a.order_num - b.order_num,
      hideInSearch: true,
    },
    {
      title: '客户状态',
      dataIndex: 'is_status',
      align: 'center',
      valueType: 'radio',
      width: 100,
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        if (record.is_status === undefined) return '-';
        return (
          <Tag color={CustomerStatus[record.is_status]['color']} key={record.is_status}>
            {CustomerStatus[record.is_status]['text']}
          </Tag>
        );
      },
      hideInSearch: true,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      valueType: 'radioButton',
      align: 'center',
      valueEnum: CustomerSex,
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        if (CustomerSex[record.sex] === undefined) return '-';
        return CustomerSex[record.sex]['text'];
      },
      width: 100,
      fieldProps: {
        buttonStyle: 'solid',
      },
      order: -1,
    },
    {
      title: '最后下单时间',
      dataIndex: 'last_order_time',
      valueType: 'dateRange',
      align: 'center',
      width: 160,
      render: (_: React.ReactNode, record: API.CustomerListType) => {
        return record.last_order_time ? dayjs.unix(record.last_order_time).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
      sorter: (a, b) => a.last_order_time - b.last_order_time,
      fieldProps: timeRangeFieldProps(),
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      align: 'center',
      fixed: 'right',
      width: 80,
      render: (_: React.ReactNode, record: API.CustomerListType) => (
        <Space direction="vertical" size={3}>
          <a key="edit" onClick={() => selectMenu('edit', record)}>
            编辑
          </a>
          <a key="distribute" onClick={() => selectMenu('distribute', record)}>
            {distributeTitle}
          </a>
          <a className="custom-a-dangerous" key="delete" onClick={() => selectMenu('delete', record)}>
            删除
          </a>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: API.CustomerListType[]) => {
      const idsArr = selectedRows.map((item) => item.cid);
      setSelectedRowKeys(idsArr);
    },
    selectedRowKeys: selectedRowKeys,
  };

  return (
    <>
      <ProTable<API.CustomerListType>
        loading={loading}
        rowKey="cid"
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        dataSource={list}
        search={{
          labelWidth: 100,
        }}
        rowSelection={{
          ...rowSelection,
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
              添加客户
            </Button>
            <Button
              type="primary"
              key="batchStatus"
              disabled={selectedRowKeys.length === 0}
              onClick={() => selectMenu('batchStatus', undefined)}
            >
              批量修改状态
            </Button>
            <Button
              type="primary"
              key="distribute"
              disabled={selectedRowKeys.length === 0}
              onClick={() => selectMenu('distribute', undefined)}
            >
              批量{distributeTitle}
            </Button>
            <Button
              key="delete"
              type="primary"
              disabled={selectedRowKeys.length === 0}
              danger={true}
              onClick={() => {
                if (selectedRowKeys.length > 0) {
                  const ids = selectedRowKeys.length > 0 ? selectedRowKeys.join(',') : '';
                  handleDelete(ids);
                }
              }}
            >
              批量删除
            </Button>
          </Space>
        }
        options={{
          reload: () => {
            handleFetch();
          },
        }}
        onSubmit={onFormSubmit}
        onChange={onTableChange}
        tableRender={(props, dom) => (
          <div style={{ display: 'flex', width: '100%' }}>
            <Menu onSelect={(e) => setStatus(Number(e.key))} style={{ width: 150 }} defaultSelectedKeys={['0']} mode="inline">
              {MenuElem()}
            </Menu>
            <div style={{ width: 'calc(100% - 150px)' }}>{dom}</div>
          </div>
        )}
        scroll={{ x: '100%', y: 500 }}
        tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
          <Space size={24}>
            <span>
              已选 {selectedRowKeys.length} 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
          </Space>
        )}
        tableAlertOptionRender={false}
      />
      <AddEdit title={title} modalVisible={modalVisible} onClose={handleClose} onSubmit={handleAddEdit} fields={fields} />
      <BatchStatus modalVisible={batchVisible} title="批量修改状态" onSubmit={handleBatchStatus} onClose={handleClose} />
      <Distribute modalVisible={disVisible} title={distributeTitle} onSubmit={handleDistribute} onClose={handleClose} fields={fields} />
      <CustomerDetail
        data={detailRecord}
        modalVisible={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setDetailRecord(undefined);
        }}
      />
    </>
  );
};

export default CustomerList;
