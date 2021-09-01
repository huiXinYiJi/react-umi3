import React, { useRef, useEffect } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-form';
import type { FieldsItem } from '../index';
import { TrackingCompanyOptions } from '@/utils/value.config';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
  fields: FieldsItem | undefined;
}

// 页面逻辑
const Shipping: React.FC<ModalProps> = (props) => {
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
      <ProFormText name="tracking_no" label="快递单号" rules={[{ required: true, whitespace: true, message: '请输入快递单号' }]} />
      <ProFormSelect
        name="tracking_company"
        label="配送方式"
        fieldProps={{
          optionLabelProp: 'label',
        }}
        placeholder="请选择配送方式"
        options={TrackingCompanyOptions}
        rules={[{ required: true, whitespace: true, message: '请选择配送方式' }]}
      />
    </ModalForm>
  );
};

export default Shipping;
