import React, { useRef, useEffect } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { DrawerForm, ProFormText } from '@ant-design/pro-form';
import type { FieldsItem } from '../index';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
  fields: FieldsItem | undefined;
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
  const onFinish = async (values: FieldsItem) => {
    const params = fields?.id ? Object.assign({}, values, { id: fields.id }) : values;
    onSubmit(params, formRef!.current!);
  };

  return (
    <DrawerForm
      formRef={formRef}
      visible={modalVisible}
      title={title}
      drawerProps={{
        forceRender: true,
        destroyOnClose: true,
        maskClosable: true,
        keyboard: false,
        onClose: () => onClose(formRef!.current!),
      }}
      onFinish={onFinish}
    >
      <ProFormText name="name" label="公司名" rules={[{ required: true, whitespace: true, message: '请输入公司名' }]} />
      <ProFormText
        name="social_code"
        label="公司编号"
        rules={[
          {
            required: true,
            whitespace: true,
            message: '请输入公司编号',
          },
        ]}
      />
    </DrawerForm>
  );
};

export default AddEdit;
