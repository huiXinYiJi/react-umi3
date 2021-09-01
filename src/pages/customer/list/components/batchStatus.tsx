import React, { useRef } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import type { FieldsItem } from '../index';
import { CustomerStatusOptions } from '@/utils/value.config';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
}

// 页面逻辑
const BatchStatus: React.FC<ModalProps> = (props) => {
  const { modalVisible, title, onSubmit, onClose } = props;
  const formRef = useRef<FormInstance>();

  // 提交表单数据
  const onFinish = async (values: FieldsItem) => {
    onSubmit(values, formRef!.current!);
  };

  const getCustomerStatus = () => {
    return CustomerStatusOptions.filter((item) => item.value !== 0);
  };

  return (
    <ModalForm
      width={450}
      visible={modalVisible}
      formRef={formRef}
      title={title}
      modalProps={{
        forceRender: true,
        destroyOnClose: true,
        maskClosable: true,
        keyboard: false,
        onCancel: () => onClose(formRef!.current!),
      }}
      onFinish={onFinish}
    >
      <ProFormSelect
        name="is_status"
        label="客户状态"
        fieldProps={{
          optionLabelProp: 'label',
        }}
        placeholder="请选择客户状态"
        rules={[{ required: true, message: '请选择客户状态' }]}
        options={getCustomerStatus()}
      />
    </ModalForm>
  );
};

export default BatchStatus;
