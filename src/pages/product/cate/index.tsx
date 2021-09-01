import React, { useState, useEffect } from 'react';
import { Button, message, Space, Modal, Table } from 'antd';
import { useDispatch, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { FormInstance } from 'antd/lib/form';
import AddEdit from './components/addEdit';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnProps } from 'antd/lib/table';

export type FieldsItem = {
  id?: number;
} & Partial<API.ProductListType>;

interface ProductCateProps {
  cate?: API.ProducCateType;
  onChange?: (cate: API.ProducCateType | undefined) => void;
}

const ProductCate: React.FC<ProductCateProps> = (props) => {
  const { onChange } = props;
  const dispatch = useDispatch();
  const list = useSelector((state: ConnectState) => state.productCate.productCateList);
  const loading = useSelector((state: ConnectState) => state.loading.effects['productCate/fetchCate']);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('添加');
  const [fields, setFields] = useState<FieldsItem | undefined>(undefined);
  const [params, setParams] = useState<{ name: string }>({
    name: '',
  });
  const [activeRow, setActiveRow] = useState<API.ProducCateType | undefined>(undefined);

  useEffect(() => {
    handleFetch();
  }, [params]);

  // 获取table数据
  const handleFetch = async () => {
    dispatch({
      type: 'productCate/fetchCate',
      payload: {
        ...params,
      },
    });
  };
  // 编辑 删除 点击事件触发弹窗
  const selectMenu = (key: string, record: API.ProducCateType | undefined) => {
    switch (key) {
      case 'add':
        setTitle('添加分类');
        setFields(undefined);
        setModalVisible(true);
        break;
      case 'edit':
        setTitle('编辑分类');
        setFields(record);
        setModalVisible(true);
        break;
      // 删除
      case 'delete':
        if (record !== undefined) handleDelete(String(record.id));
        break;
      default:
        break;
    }
  };

  const reload = () => {
    setParams((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  // 添加/编辑
  const handleAddEdit = async (fields: FieldsItem, form: FormInstance) => {
    const type = fields.id ? 'productCate/updateCate' : 'productCate/addCate';
    dispatch({
      type,
      payload: { ...fields },
      callback: (res: API.ApiDataType<null>) => {
        message.success(res.msg);
        handleClose(form);
        if (fields.id) {
          handleFetch();
        } else {
          reload();
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
          type: 'productCate/deleteCate',
          payload: { id },
          callback: (res: API.ApiDataType<null>) => {
            message.success(res.msg);
            reload();
            // 若删除的id 是当前选择的行，则刷新产品列表
            if (activeRow && id === activeRow.id + '') {
              setActiveRow(undefined);
              onChange && onChange(undefined);
            }
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

  // 商品类别 侧边栏
  const getCateData = (arr: API.ProducCateType[]): API.ProducCateType[] => {
    const copy: API.ProducCateType[] = JSON.parse(JSON.stringify(arr));
    return copy.map((item) => {
      if (item.child && item.child.length > 0) {
        item.children = getCateData(item.child);
      }
      return item;
    });
  };

  const columns: ColumnProps<API.ProducCateType>[] = [
    {
      title: '商品分类',
      dataIndex: 'name',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 130,
      render: (_: React.ReactNode, record: API.ProducCateType) => (
        <Space size="middle">
          <a
            key="edit"
            onClick={(e) => {
              e.stopPropagation();
              selectMenu('edit', record);
            }}
          >
            编辑
          </a>
          <a
            className="custom-a-dangerous"
            key="delete"
            onClick={(e) => {
              e.stopPropagation();
              selectMenu('delete', record);
            }}
          >
            删除
          </a>
        </Space>
      ),
    },
  ];

  // 重构弹窗中父级目录树形数据
  const getTreeData = (list: API.ProducCateType[]): API.treeDataType[] => {
    const copy: API.ProducCateType[] = JSON.parse(JSON.stringify(list));
    const menusArr: API.treeDataType[] = [];
    menusArr.push({
      value: 0,
      title: '根分类',
    });
    const loop = (arr: API.ProducCateType[]) => {
      const res: API.treeDataType[] = [];
      arr.map((item: API.ProducCateType) => {
        const obj: API.treeDataType = {
          value: item.id,
          title: item.name,
          disabled: fields?.id === item.id,
        };
        if (item.hasOwnProperty('child') && item.child && item.child.length > 0) {
          const children = loop(item.child);
          obj.children = children;
        }
        res.push(obj);
        return item;
      });
      return res;
    };
    menusArr.push(...loop(copy));
    return menusArr;
  };

  const clickRow = (record: API.ProducCateType) => {
    if (record.id === activeRow?.id) {
      // 再次点击当前行时
      setActiveRow(undefined);
      onChange && onChange(undefined);
    } else {
      setActiveRow(record);
      onChange && onChange(record);
    }
  };

  return (
    <>
      <Button
        key="3"
        type="primary"
        style={{ marginBottom: '10px' }}
        onClick={() => {
          setFields(undefined);
          setTitle('添加');
          setModalVisible(true);
        }}
      >
        添加分类
      </Button>
      <Table<API.ProducCateType>
        indentSize={10}
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={getCateData(list)}
        loading={loading}
        pagination={false}
        onRow={(record: API.ProducCateType) => {
          return {
            onClick: () => clickRow(record),
          };
        }}
        rowClassName={(record, index) => {
          if (record.id === activeRow?.id) {
            return 'ant-table-row-selected';
          } else {
            return '';
          }
        }}
      />
      <AddEdit
        title={title}
        treeData={getTreeData(list)}
        modalVisible={modalVisible}
        onClose={handleClose}
        onSubmit={handleAddEdit}
        fields={fields}
      />
    </>
  );
};

export default ProductCate;
