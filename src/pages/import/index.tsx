import React, { useState, useRef } from 'react';
import ProCard from '@ant-design/pro-card';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Uploader } from '@/components';
import UploadRecord from './components/uploadRecord';
import { batchShip, importOrder } from '@/services/import';
import { downloadFile } from '@/utils';
import { useLocation } from 'umi';
import type { Location } from 'history-with-query';

//* 卡片切换类型
const CardOptions: Record<string, Partial<API.ColumnTextStatus>> = {
  // shipping: { text: '批量发货' },
  order: { text: '订单导入' },
};

//* 页面
const ImportPage: React.FC = () => {
  const location: Location = useLocation();
  const [type, setType] = useState<string>(() => {
    return (location.query?.type as string) || 'order';
  });
  const uploaderRef = useRef<React.ElementRef<typeof Uploader>>(null);
  const recordRef = useRef<React.ElementRef<typeof UploadRecord>>(null);

  // * 上传请求
  const uploadRequest = async (formData: FormData, file: Blob) => {
    const func = type === 'shipping' ? batchShip : importOrder;
    try {
      const res = await func(formData);
      if (res.code === 200) {
        recordRef?.current?.reload();
        return Promise.resolve(res);
      } else {
        return Promise.reject('上传失败');
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };

  //*下载模板
  const downloadTemplate = () => {
    downloadFile('/订单导入模板.xlsx', `${CardOptions[type]['text']}模板`);
  };

  return (
    <>
      <ProCard
        tabs={{
          type: 'card',
          onChange: (activeKey) => {
            uploaderRef?.current?.clearFileList();
            setType(activeKey);
          },
          activeKey: type,
        }}
        className="card-box"
        size="small"
      >
        {Object.keys(CardOptions).map((key: string) => (
          <ProCard.TabPane tab={CardOptions[key].text} key={key}></ProCard.TabPane>
        ))}
      </ProCard>
      <ProCard ghost gutter={8} size="small">
        <ProCard colSpan="400px" layout="center" title={<span className="fontWB">上传文件</span>} headerBordered>
          <div className="card-box">
            <Uploader request={uploadRequest} name="file" ref={uploaderRef} />
            {type === 'order' && (
              <Button style={{ marginTop: '10px' }} type="link" icon={<DownloadOutlined />} onClick={downloadTemplate}>
                下载模板
              </Button>
            )}
          </div>
        </ProCard>
        {type === 'order' && (
          <ProCard colSpan="calc(100% - 400px)" layout="center" title={<span className="fontWB">文件记录</span>} headerBordered>
            <div className="card-box">
              <UploadRecord cardType={type} ref={recordRef} />
            </div>
          </ProCard>
        )}
      </ProCard>
    </>
  );
};

export default ImportPage;
