import React, { useState, useRef, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Space, Tag, Modal } from 'antd';
import { useDispatch, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { FormInstance } from 'antd/lib/form';
import type { TablePaginationConfig } from 'antd/lib/table';
import dayjs from 'dayjs';
import AddEdit from './components/addEdit';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ProductStatus } from '@/utils/value.config';

export type FieldsItem = {
  id?: number;
} & Partial<API.ProductListType>;

type TableSearchType = {
  current?: number;
  pageSize?: number;
  cateId?: number;
} & Partial<API.ProductListType>;

interface ProductListProps {
  cate?: API.ProducCateType;
  isOPenFrModal?: boolean; // 是否从弹窗打开
}

const ProductList: React.FC<ProductListProps> = (props) => {
  const { isOPenFrModal, cate } = props;
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const dispatch = useDispatch();
  const { list, total, selectedPrds } = useSelector((state: ConnectState) => state.productList);
  const loading = useSelector((state: ConnectState) => state.loading.effects['productList/fetch']);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('添加');
  const [fields, setFields] = useState<FieldsItem | undefined>(undefined);
  const [params, setParams] = useState<TableSearchType>({
    current: 1,
    pageSize: 20,
    cate_id: cate?.id || undefined,
  });

  useEffect(() => {
    handleFetch();
  }, [params]);

  // 点击商品分类 刷新商品列表
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      current: 1,
      cate_id: cate?.id || undefined,
    }));
    saveSelectedPrds([]);
  }, [cate]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'productList/fetch',
      payload: {
        ...params,
      },
    });
  };
  // 编辑 删除 点击事件触发弹窗
  const selectMenu = (key: string, record: API.ProductListType | undefined) => {
    switch (key) {
      case 'add':
        setTitle('添加商品');
        setFields(undefined);
        setModalVisible(true);
        break;
      case 'edit':
        setTitle('编辑商品');
        setFields(record);
        setModalVisible(true);
        break;
      // 删除
      case 'delete':
        if (record !== undefined) handleDelete(String(record.product_id));
        break;
      default:
        break;
    }
  };

  // 添加/编辑
  const handleAddEdit = async (fields: FieldsItem, form: FormInstance) => {
    const type = fields.product_id ? 'productList/update' : 'productList/add';
    dispatch({
      type,
      payload: { ...fields },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        if (fields.product_id) {
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

  // 删除 批量删除 id值用,隔开
  const handleDelete = (product_id: string) => {
    Modal.confirm({
      title: '您确定要删除此项数据吗？',
      icon: <ExclamationCircleOutlined />,
      content: '删除操作将不可撤销',
      onOk: () => {
        dispatch({
          type: 'productList/delete',
          payload: { product_id },
          callback: (res: API.ApiDataType<null>) => {
            message.success(res.msg);
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

  // 多选配置
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: API.ProductListType[]) => {
      saveSelectedPrds(selectedRows);
    },
    selectedRowKeys: selectedPrds.map((item) => item.product_id),
  };

  //* 存储勾选的产品
  const saveSelectedPrds = (record: API.ProductListType[]) => {
    dispatch({
      type: 'productList/setSelectedPrds',
      payload: record,
    });
  };

  // table 列表配置项
  const columns: ProColumns<API.ProductListType>[] = [
    {
      title: '商品名称',
      dataIndex: 'name',
      align: 'center',
      fixed: 'left',
      width: 300,
      className: 'custom-fixed-column',
    },
    {
      title: '商品分类',
      dataIndex: 'cate_id',
      align: 'center',
      hideInSearch: true,
      width: 160,
      render: (_: React.ReactNode, record: API.ProductListType) => {
        return record.cate_name;
      },
    },
    {
      title: '商品价格(￥)',
      dataIndex: 'price',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '商品数量',
      dataIndex: 'number',
      align: 'center',
      width: 120,
      valueType: 'digit',
      hideInSearch: true,
    },
    {
      title: '商品编码',
      dataIndex: 'code',
      align: 'center',
      width: 200,
      ellipsis: true,
    },
    {
      title: '商品状态',
      dataIndex: 'status',
      align: 'center',
      width: 160,
      valueType: 'radioButton',
      fieldProps: {
        buttonStyle: 'solid',
      },
      valueEnum: ProductStatus,
      render: (_: React.ReactNode, record: API.ProductListType) => {
        if (!ProductStatus[record.is_status]) return '-';
        return (
          <Tag color={ProductStatus[record.is_status]['color']} key={record.is_status}>
            {ProductStatus[record.is_status]['text']}
          </Tag>
        );
      },
    },
    {
      title: '添加时间',
      dataIndex: 'add_time',
      align: 'center',
      width: 160,
      hideInSearch: true,
      valueType: 'dateRange',
      render: (_: React.ReactNode, record: API.ProductListType) => {
        return record.add_time ? dayjs.unix(record.add_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.add_time - b.add_time,
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      align: 'center',
      width: 160,
      valueType: 'dateRange',
      hideInSearch: true,
      render: (_: React.ReactNode, record: API.ProductListType) => {
        return record.update_time ? dayjs.unix(record.update_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      sorter: (a, b) => a.update_time - b.update_time,
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      align: 'center',
      fixed: 'right',
      width: 100,
      render: (_: React.ReactNode, record: API.ProductListType) => [
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
      <ProTable<API.ProductListType>
        loading={loading}
        rowKey="product_id"
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
              添加商品
            </Button>
            <Button
              key="delete"
              type="primary"
              disabled={selectedPrds.length <= 0}
              danger={true}
              onClick={() => {
                if (selectedPrds.length > 0) {
                  const idsArr = selectedPrds.map((item) => item.product_id);
                  const ids = idsArr.join(',');
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
        scroll={{ x: '100%' }}
        className={!isOPenFrModal ? '' : 'modal-in-table'}
        sticky
        tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
          <Space size={24}>
            <span>
              已选 {selectedRowKeys.length} 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
            <span>{`总金额: ￥${selectedRows.reduce((pre, item) => pre + Number(item.price), 0)} `}</span>
          </Space>
        )}
        tableAlertOptionRender={false}
      />
      <AddEdit title={title} modalVisible={modalVisible} onClose={handleClose} onSubmit={handleAddEdit} fields={fields} />
    </>
  );
};

export default ProductList;
