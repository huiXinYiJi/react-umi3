import React, { useRef, useEffect, useState } from 'react';
import type { FormInstance } from 'antd/lib/form';
import ProForm, { DrawerForm, ProFormText, ProFormSelect, ProFormRadio, ProFormTextArea } from '@ant-design/pro-form';
import { useDispatch } from 'umi';
import type { FieldsItem } from '../index';
import { CustomerSexOptions, CustomerStatusOptions, WxTypeOptions } from '@/utils/value.config';
import { resetDataToSelect } from '@/utils';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
  fields?: FieldsItem;
}

// 页面逻辑
const AddEdit: React.FC<ModalProps> = (props) => {
  const dispatch = useDispatch();
  const [sourceList, setSourceList] = useState<API.OptionsType<API.SourceListType>[]>([]);
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

  useEffect(() => {
    handleSourceFetch();
  }, [1]);

  // 获取客户来源列表
  const handleSourceFetch = async () => {
    dispatch({
      type: 'source/fetch',
      callback: (res: API.SourceListType[]) => {
        setSourceList(resetDataToSelect(res, { label: 'name', value: 'id' }));
      },
    });
  };

  // 提交表单数据
  const onFinish = async (values: FieldsItem) => {
    const params = fields?.cid ? Object.assign({}, values, { id: fields.cid }) : values;
    onSubmit(params, formRef!.current!);
  };

  const filterCustomStatus = () => {
    return CustomerStatusOptions.filter((item) => item.value !== 0);
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
        <ProFormText width="md" name="name" label="客户姓名" rules={[{ required: true, whitespace: true, message: '请输入客户姓名' }]} />
        <ProFormText width="md" name="phone" label="客户电话" rules={[{ required: true, whitespace: true, message: '请输入客户电话' }]} />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText width="md" name="wechat" label="客户微信号" rules={[{ whitespace: true, message: '请输入客户微信号' }]} />
        <ProFormSelect
          width="md"
          name="wx_type"
          label="客户微信状态"
          fieldProps={{
            optionLabelProp: 'label',
            showSearch: true,
          }}
          placeholder="请选择客户微信状态"
          rules={[{ required: true, message: '请选择客户微信状态' }]}
          options={WxTypeOptions}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          width="md"
          name="source_form"
          label="客户来源"
          fieldProps={{
            optionLabelProp: 'label',
            showSearch: true,
          }}
          placeholder="请选择客户来源"
          rules={[{ required: true, message: '请选择客户来源' }]}
          options={sourceList}
        />
        <ProFormSelect
          width="md"
          name="is_status"
          label="客户状态"
          fieldProps={{
            optionLabelProp: 'label',
          }}
          placeholder="请选择客户状态"
          rules={[{ required: true, message: '请选择客户状态' }]}
          options={filterCustomStatus()}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormTextArea
          width="md"
          name="addr"
          label="详细地址"
          placeholder="请输入详细地址"
          rules={[{ required: true, whitespace: true, message: '请输入详细地址' }]}
        />
        <ProFormTextArea
          width="md"
          name="remark"
          label="备注"
          placeholder="请输入备注"
          rules={[{ whitespace: true, message: '请输入备注' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText width="md" name="kf_wechat" label="客服微信号" rules={[{ whitespace: true, message: '请输入客服微信号' }]} />
        <ProFormRadio.Group
          width="md"
          name="sex"
          label="性别"
          radioType="button"
          options={CustomerSexOptions}
          fieldProps={{
            buttonStyle: 'solid',
          }}
          rules={[{ required: true, message: '请选择性别' }]}
        />
      </ProForm.Group>
    </DrawerForm>
  );
};

export default AddEdit;
