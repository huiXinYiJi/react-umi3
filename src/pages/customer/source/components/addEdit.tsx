import React, { useRef, useEffect } from 'react';
import ProForm, { DrawerForm, ProFormText } from '@ant-design/pro-form';
import type { FormInstance } from 'antd/lib/form';
import type { FieldsItem } from '../index';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
  fields?: FieldsItem;
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
    onSubmit(params, formRef.current!);
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
        onClose: () => onClose(formRef.current!),
        contentWrapperStyle: {
          maxWidth: '100%',
        },
      }}
      onFinish={onFinish}
      // onValuesChange={(changeValues) => console.log(changeValues)}
    >
      <ProForm.Group>
        <ProFormText
          width="md"
          name="name"
          label="渠道名称"
          placeholder="请输入渠道名称"
          rules={[{ required: true, whitespace: true, message: '请输入渠道名称' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="platform"
          label="平台标识"
          placeholder="请输入平台拼音"
          tooltip="输入平台拼音即可"
          rules={[{ required: true, whitespace: true, message: '请输入平台标识' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="shop_id"
          label="店铺ID"
          placeholder="请输入店铺ID"
          rules={[{ required: true, whitespace: true, message: '请输入店铺ID' }]}
        />
      </ProForm.Group>
    </DrawerForm>
  );
};

export default AddEdit;
