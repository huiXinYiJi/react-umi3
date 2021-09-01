import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useDispatch, useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { FormInstance } from 'antd/lib/form';
import type { TablePaginationConfig } from 'antd/lib/table';
import dayjs from 'dayjs';
import { FileTextFilled } from '@ant-design/icons';
import { timeRangeFieldProps } from '@/utils/antd.config';
import UploadDetail from './uploadDetail';
import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadFile } from '@/utils';

export type FieldsItem = Partial<API.ImportRecordType>;

type TableSearchType = {
  current?: number;
  pageSize?: number;
} & Partial<API.ImportRecordType>;

type UploadRecordProps = {
  cardType?: string; // 批量发货/订单导入 页签 类型
};

interface RefHandle {
  reload: () => void;
}

const UploadRecord: React.ForwardRefRenderFunction<RefHandle, UploadRecordProps> = (props, ref) => {
  const cardType = props.cardType || 'order';
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const dispatch = useDispatch();
  const {
    recordData: { list, total },
  } = useSelector((state: ConnectState) => state.import);
  const loading = useSelector((state: ConnectState) => state.loading.effects['import/fetchRecord']);
  const [params, setParams] = useState<TableSearchType>({
    pageSize: 20,
    current: 1,
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [fields, setFields] = useState<FieldsItem | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    reload: () => {
      setParams((prev) => {
        return {
          ...prev,
          current: 1,
        };
      });
    },
  }));

  useEffect(() => {
    handleFetch();
  }, [params]);

  // 获取table数据
  const handleFetch = async () => {
    // const type = cardType === 'shipping' ? 'import/fetchRecord' : 'import/fetchRecord';
    dispatch({
      type: 'import/fetchRecord',
      payload: {
        ...params,
      },
    });
  };

  // 搜索
  const onFormSubmit = (params: FieldsItem) => {
    setParams((prev) => ({
      ...params,
      current: 1,
      pageSize: prev.pageSize,
    }));
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

  //* 操作
  const selectMenu = (key: string, record: API.ImportRecordType) => {
    switch (key) {
      case 'detail':
        setFields(record);
        setModalVisible(true);
        break;
      default:
        break;
    }
  };

  //*关闭记录抽屉
  const onCloseDrawer = () => {
    setFields(undefined);
    setModalVisible(false);
  };

  //* 下载文件
  const downladFunc = (record: API.ImportRecordType) => {
    if (record.file_addr) {
      downloadFile(record.file_addr, record.original_name);
    } else {
      message.warning('当前文件无法下载');
    }
  };

  // table 列表配置项
  const columns: ProColumns<API.ImportRecordType>[] = [
    {
      title: '文件名称',
      dataIndex: 'original_name',
      align: 'left',
      fixed: 'left',
      width: 250,
      render: (_: React.ReactNode, record: API.ImportRecordType) => {
        return (
          <a key={record.id + '_detail'} onClick={() => selectMenu('detail', record)}>
            <FileTextFilled style={{ color: '#27C24E', marginRight: '3px' }} />
            {record.original_name}
            <Button
              type="link"
              danger
              icon={<DownloadOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                downladFunc(record);
              }}
            ></Button>
          </a>
        );
      },
      hideInSearch: true,
    },
    {
      title: '上传数据总量',
      dataIndex: 'up_num',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '成功上传数',
      dataIndex: 'success_num',
      align: 'center',
      width: 130,
      hideInSearch: true,
    },
    {
      title: '失败上传数',
      dataIndex: 'fail_num',
      align: 'center',
      width: 130,
      hideInSearch: true,
    },
    {
      title: '操作人',
      dataIndex: 'user_name',
      align: 'center',
      width: 100,
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '上传时间',
      dataIndex: 'at_time',
      align: 'center',
      valueType: 'dateRange',
      width: 160,
      fixed: 'right',
      render: (_: React.ReactNode, record: API.ImportRecordType) => {
        return record.at_time ? dayjs.unix(record.at_time).format('YYYY-MM-DD HH:mm:ss') : '';
      },
      fieldProps: timeRangeFieldProps(),
      sorter: (a, b) => a.at_time - b.at_time,
    },
  ];

  return (
    <>
      <ProTable<API.ImportRecordType>
        loading={loading}
        rowKey="id"
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        dataSource={list}
        search={{
          labelWidth: 100,
        }}
        dateFormatter="number"
        headerTitle={false}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          hideOnSinglePage: false,
          total,
          current: params.current,
          pageSize: params.pageSize,
        }}
        options={{
          reload: () => {
            handleFetch();
          },
        }}
        onChange={onTableChange}
        onSubmit={onFormSubmit}
        scroll={{ x: '100%' }}
        sticky
      />
      {/* 文件详情 */}
      <UploadDetail fields={fields} title="文件详情" modalVisible={modalVisible} onClose={onCloseDrawer} />
    </>
  );
};

export default forwardRef(UploadRecord);
