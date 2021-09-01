import React, { useRef, useEffect } from 'react';
import type { FormInstance } from 'antd/lib/form';
import ProForm, { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import type { FieldsItem } from '../index';
import { OrderStatusOptions } from '@/utils/value.config';

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

  const getOrderStatus = () => {
    return OrderStatusOptions.filter((item) => item.value !== 0);
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
      onFinish={onFinish}
    >
      <ProForm.Group>
        <ProFormSelect
          width="md"
          name="order_status"
          label="订单状态"
          fieldProps={{
            optionLabelProp: 'label',
            showSearch: true,
          }}
          placeholder="请选择订单状态"
          rules={[{ required: true, message: '请选择订单状态' }]}
          options={getOrderStatus()}
        />
      </ProForm.Group>
    </ModalForm>
  );
};

export default AddEdit;
