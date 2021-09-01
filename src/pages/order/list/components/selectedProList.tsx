import React, { useState, useRef, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { Space, Popconfirm, message } from 'antd';
import { useDispatch } from 'umi';
import useStateCB from '@/hooks/useStateCB';
import styles from './index.less';

type SelectedProListProps = {
  list: API.EditProListType[];
  onListChange: (list: API.EditProListType[]) => void; // 更改后的数据
};

const SelectedProList: React.FC<SelectedProListProps> = (props) => {
  const dispatch = useDispatch();
  const { list, onListChange } = props;
  const [dataSource, setDataSource] = useStateCB<API.EditProListType[]>([]);
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    setDataSource(list);
    setEditableRowKeys(list.map((item) => item.edit_id!));
  }, [list]);

  const handleEditChange = (value: API.EditProListType[]) => {
    onListChange(value);
  };

  // 删除
  const handleDelete = (record: API.EditProListType) => {
    if (record.del_id) {
      // 编辑时删除
      dispatch({
        type: 'order/delOrderPro',
        payload: { id: record.del_id },
        callback: (res: API.ApiDataType<null>) => {
          message.success(res.msg);
          setDataSource(
            (prev) => {
              return prev.filter((item) => item.id !== record.id);
            },
            (newState) => {
              newState !== undefined && handleEditChange(newState);
            },
          );
        },
      });
    } else {
      // 添加时删除
      setDataSource(
        (prev) => {
          return prev.filter((item) => item.product_id !== record.product_id);
        },
        (newState) => {
          newState !== undefined && handleEditChange(newState);
        },
      );
    }
  };

  // table 列表配置项
  const columns: ProColumns<API.EditProListType>[] = [
    {
      title: '商品名称',
      dataIndex: 'name',
      align: 'center',
      fixed: 'left',
      width: 160,
      editable: false,
    },
    {
      title: '商品分类',
      dataIndex: 'cate_id',
      align: 'center',
      hideInSearch: true,
      width: 120,
      render: (_: React.ReactNode, record: API.EditProListType) => {
        return record.cate_name;
      },
      editable: false,
    },
    {
      title: '单价(￥)',
      dataIndex: 'edit_price',
      align: 'center',
      valueType: 'digit',
      width: 120,
      hideInSearch: true,
      fieldProps: {
        min: 1,
      },
    },
    {
      title: '数量',
      dataIndex: 'edit_number',
      align: 'center',
      width: 120,
      valueType: 'digit',
      hideInSearch: true,
      fieldProps: {
        min: 1,
        precision: 0,
      },
    },
    {
      title: '优惠(￥)',
      dataIndex: 'discount',
      align: 'center',
      width: 120,
      valueType: 'digit',
    },
    {
      title: '合计(￥)',
      dataIndex: 'total',
      align: 'center',
      width: 100,
      editable: false,
      render: (_: React.ReactNode, record: API.EditProListType) => {
        const { edit_price, edit_number, discount } = record;
        return Number(edit_price) * edit_number - discount;
      },
      // ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      valueType: 'textarea',
      fieldProps: {
        autoSize: {
          minRows: 1,
          maxRows: 3,
        },
        maxLength: 300,
      },
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      align: 'center',
      fixed: 'right',
      width: 100,
      render: () => null,
    },
  ];

  return (
    <>
      <EditableProTable<API.EditProListType>
        className={styles.editTable}
        rowKey="edit_id"
        columns={columns}
        actionRef={actionRef}
        value={dataSource}
        onChange={handleEditChange}
        recordCreatorProps={false}
        size="small"
        bordered
        editable={{
          type: 'multiple',
          editableKeys,
          actionRender: (row, config, defaultDoms) => {
            if (row.edit_id !== 'sum') {
              return [
                <Popconfirm key="custom" title="确定删除?" onConfirm={() => handleDelete(row)}>
                  <a className="custom-a-dangerous">删除</a>
                </Popconfirm>,
              ];
            } else {
              return [];
            }
          },
          onChange: setEditableRowKeys,
          onValuesChange: (record, recordList) => {
            setDataSource(recordList);
            handleEditChange(recordList);
          },
        }}
        scroll={{ x: '100%' }}
        footer={() => {
          return (
            <Space size={24}>
              <span>
                订单总额:{' '}
                <i className="custom-a-dangerous" style={{ fontStyle: 'normal' }}>
                  ￥{`${dataSource.reduce((pre, item) => pre + (Number(item.edit_price) * item.edit_number - item.discount), 0)} `}
                </i>
              </span>
              <span>
                优惠金额:{' '}
                <i className="custom-a-dangerous" style={{ fontStyle: 'normal' }}>
                  ￥{`${dataSource.reduce((pre, item) => pre + Number(item.discount), 0)} `}
                </i>
              </span>
            </Space>
          );
        }}
      />
    </>
  );
};

export default SelectedProList;
