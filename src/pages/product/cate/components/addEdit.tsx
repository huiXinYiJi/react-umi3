import React, { useRef, useEffect } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import type { FieldsItem } from '../index';
import { TreeSelect, Form } from 'antd';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
  fields: FieldsItem | undefined;
  treeData: API.treeDataType[];
}

// 页面逻辑
const AddEdit: React.FC<ModalProps> = (props) => {
  const { title, modalVisible, onClose, onSubmit, fields, treeData } = props;
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
      <ProFormText name="name" label="分类名称" rules={[{ required: true, whitespace: true, message: '请输入分类名称' }]} />
      <Form.Item name="pid" label="父级分类" rules={[{ required: true, message: '请选择父级分类' }]} tooltip="选择根分类即为一级分类">
        <TreeSelect treeData={treeData} placeholder="请选择" />
      </Form.Item>
    </ModalForm>
  );
};

export default AddEdit;
