import React, { useRef } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { ModalForm, ProFormText } from '@ant-design/pro-form';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: API.ResetPwdParamsType, form: FormInstance) => void;
}

const UpdatePwd: React.FC<ModalProps> = (props) => {
  const { title, modalVisible, onClose, onSubmit } = props;
  const formRef = useRef<FormInstance>();

  const onFinish = async (values: API.ResetPwdParamsType) => {
    return onSubmit(values, formRef!.current!);
  };

  return (
    <ModalForm
      width={450}
      formRef={formRef}
      visible={modalVisible}
      title={title}
      modalProps={{
        onCancel: () => onClose(formRef!.current!),
        keyboard: false,
        maskClosable: false,
      }}
      onFinish={onFinish}
    >
      <ProFormText name="old_pwd" label="旧密码" rules={[{ required: true, whitespace: true, message: '请输入旧密码' }]} />
      <ProFormText
        name="new_pwd"
        label="新密码"
        rules={[
          { required: true, whitespace: true, message: '请输入新密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (value && getFieldValue('old_pwd') === value) {
                return Promise.reject(new Error('新密码与旧密码相同！'));
              }
              return Promise.resolve();
            },
          }),
        ]}
      />
    </ModalForm>
  );
};

export default UpdatePwd;
