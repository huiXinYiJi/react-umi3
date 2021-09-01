import React, { useRef, useEffect } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { ModalForm, ProFormText } from '@ant-design/pro-form';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: Partial<API.RoleListType>, form: FormInstance) => void;
  fields: Partial<API.RoleListType> | undefined;
}

// 页面逻辑
const AddEdit: React.FC<ModalProps> = (props) => {
  const { title, modalVisible, onClose, onSubmit, fields } = props;
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    // 表单赋值
    if (fields) {
      formRef.current?.setFieldsValue({
        ...fields,
      });
    }
  }, [fields]);

  // 提交表单数据
  const onFinish = async (values: Partial<API.RoleListType>) => {
    const params = fields?.id ? Object.assign({}, values, { id: fields.id }) : values;
    onSubmit(params, formRef!.current!);
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
      size="middle"
    >
      <ProFormText name="title" label="角色名" rules={[{ required: true, whitespace: true, message: '请输入角色名' }]} />
      <ProFormText name="description" label="角色描述" rules={[{ required: true, whitespace: true, message: '请输入角色描述' }]} />
    </ModalForm>
  );
};

export default AddEdit;
