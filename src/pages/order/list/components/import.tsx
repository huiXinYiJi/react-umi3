import React, { useRef } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { ModalForm } from '@ant-design/pro-form';
import { Form, Button } from 'antd';
import { batchShip } from '@/services/import';
import { Uploader } from '@/components';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
}

// 页面逻辑
const Import: React.FC<ModalProps> = (props) => {
  const { title, modalVisible, onClose } = props;
  const formRef = useRef<FormInstance>();

  // * 上传请求
  const uploadRequest = async (formData: FormData, file: Blob) => {
    try {
      const res = await batchShip(formData);
      if (res.code === 200) {
        return Promise.resolve(res);
      } else {
        return Promise.reject('上传失败');
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return (
    <ModalForm
      formRef={formRef}
      visible={modalVisible}
      title={title}
      width={450}
      modalProps={{
        forceRender: true,
        destroyOnClose: true,
        maskClosable: true,
        keyboard: false,
        onCancel: () => {
          onClose(formRef!.current!);
        },
      }}
      submitter={{
        render: (props, doms) => {
          return [
            <Button key="close" onClick={() => onClose(formRef!.current!)}>
              关 闭
            </Button>,
          ];
        },
      }}
    >
      <Form.Item valuePropName="file" label="上传文件" rules={[{ required: true, message: '请上传文件' }]}>
        <Uploader request={uploadRequest} name="file" />
      </Form.Item>
    </ModalForm>
  );
};

export default Import;
