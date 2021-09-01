import React, { useRef, useEffect } from 'react';
import type { FormInstance } from 'antd/lib/form';
import ProForm, { DrawerForm, ProFormRadio, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { FieldsItem } from '../index';
import { ForTypeOptions } from '@/utils/value.config';
import { getList } from '@/services/customer';
import { FormSelectPage } from '@/components';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
  customerData?: API.CustomerListType; // 客户数据
}

// 页面逻辑
const AddEdit: React.FC<ModalProps> = (props) => {
  const { customerData, title, modalVisible, onClose, onSubmit } = props;
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    if (customerData?.cid) {
      formRef.current?.setFieldsValue({
        name: customerData?.name,
      });
    }
  }, [modalVisible]);

  // 提交表单数据
  const onFinish = async (values: FieldsItem) => {
    const params = customerData?.cid ? Object.assign({}, { cid: customerData.cid }, values) : values;
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
        contentWrapperStyle: {
          maxWidth: '100%',
        },
      }}
      onFinish={onFinish}
      // onValuesChange={(changeValues) => console.log(changeValues)}
    >
      <ProForm.Group>
        {customerData ? (
          <ProFormText width="md" name="name" label="客户" readonly bordered={false} />
        ) : (
          <FormSelectPage
            width="md"
            name="cid"
            label="客户"
            fieldProps={{
              optionLabelProp: 'label',
            }}
            placeholder="请选择客户"
            rules={[{ required: true, message: '请选择客户' }]}
            requestFuc={(
              params: {
                current?: number;
                pageSize?: number;
              } & Partial<API.CustomerListType>,
            ) => getList(params)}
            valueName="cid"
            labelName="name"
            keywordName="name"
          />
        )}
        <ProFormRadio.Group
          width="md"
          name="for_type"
          label="回访方式"
          radioType="button"
          options={ForTypeOptions}
          fieldProps={{
            buttonStyle: 'solid',
          }}
          rules={[{ required: true, message: '请选择回访方式' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormTextArea
          width="md"
          name="remark"
          label="备注"
          placeholder="请输入备注"
          rules={[{ whitespace: true, message: '请输入有效内容' }]}
        />
      </ProForm.Group>
    </DrawerForm>
  );
};

export default AddEdit;
