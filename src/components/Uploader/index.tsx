import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Upload, message, Button } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { RcFile, UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import type { DraggerProps, UploadChangeParam } from 'antd/lib/upload';
import type { UploadFile } from 'antd/lib/upload/interface';

const { Dragger } = Upload;

type UploadRes = {
  [key: string]: any;
};

interface UploaderProps extends DraggerProps {
  request: (formData: FormData, file: Blob) => Promise<API.ApiDataType<UploadRes>>;
  uploadText?: string;
  fileType?: string;
  limitSize?: number;
  notDragger?: boolean; // 是否拖拽上传 默认false
}

interface RefHandle {
  clearFileList: () => void;
}

// 页面逻辑
const Uploader: React.ForwardRefRenderFunction<RefHandle, UploaderProps> = (props, ref) => {
  const { request, uploadText, notDragger, ...uploadProps } = props;
  const fileType = props.fileType || '.xlsx';
  const limitSize = props.limitSize || 2; // 2mb
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useImperativeHandle(ref, () => ({
    clearFileList,
  }));

  const customRequest = async (options: RcCustomRequestOptions) => {
    const { file, filename, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append(filename || 'file', file);

    request(formData, file as Blob)
      .then((res: API.ApiDataType<UploadRes>) => {
        onSuccess && onSuccess(res, file as any);
      })
      .catch(onError);
  };

  const beforeUpload = (file: RcFile, FileList: RcFile[]) => {
    const isRightType = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // || 'application/vnd.ms-excel';
    if (!isRightType) {
      message.error('您只能上传.xlsx格式文件!');
    }
    const isLimitPass = file.size / 1024 / 1024 < limitSize;
    if (!isLimitPass) {
      message.error(`上传文件必须小于 ${limitSize}MB!`);
    }
    const pass = isRightType && isLimitPass;

    return pass ? true : Upload.LIST_IGNORE;
  };

  const onChange = ({ file, fileList }: UploadChangeParam) => {
    setFileList(fileList);
    const { status } = file;
    if (status !== 'uploading') {
      console.log(file, fileList);
    }
    if (status === 'done') {
      message.success(`${file.name} 上传成功`);
    } else if (status === 'error') {
      message.error(`${file.name} 上传失败`);
    }
  };

  const clearFileList = () => {
    setFileList([]);
  };

  const comProps = {
    name: 'file',
    multiple: false,
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // , application/vnd.ms-excel
    withCredentials: true,
    maxCount: 1,
    fileList,
    customRequest,
    onChange: (info: UploadChangeParam) => onChange(info),
    showUploadList: {
      showRemoveIcon: false,
    },
    beforeUpload,
  };

  return notDragger === undefined || notDragger === false ? (
    <Dragger {...comProps} {...uploadProps}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{uploadText || '单击或拖动文件到此区域进行上传'}</p>
      <p className="ant-upload-hint">{uploadProps?.multiple ? '' : '仅支持单文件上传'}</p>
      <p className="ant-upload-hint">{fileType ? `仅支持${fileType}格式文件` : ''}</p>
    </Dragger>
  ) : (
    <Upload {...comProps} {...uploadProps}>
      <Button icon={<UploadOutlined />}>点击上传</Button>
      <p className="ant-upload-hint">{fileType ? `仅支持${fileType}格式文件` : ''}</p>
    </Upload>
  );
};

export default forwardRef(Uploader);
