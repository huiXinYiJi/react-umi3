import React, { useRef, useEffect, useState } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { ModalForm, ProFormText, ProFormSelect, ProFormDigit } from '@ant-design/pro-form';
import { useDispatch } from 'umi';
import type { FieldsItem } from '../index';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
  fields: FieldsItem | undefined;
}

interface OptionsType {
  label: string;
  value: number;
}

// 页面逻辑
const AddEdit: React.FC<ModalProps> = (props) => {
  const dispatch = useDispatch();
  const [list, setList] = useState<OptionsType[]>([]);
  const { title, modalVisible, onClose, onSubmit, fields } = props;
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    // 表单赋值
    if (fields) {
      formRef.current?.setFieldsValue({
        ...fields,
        password: '',
      });
    }
  }, [fields]);

  useEffect(() => {
    if (modalVisible) {
      handleFetchRole();
    }
  }, [modalVisible]);

  // 提交表单数据
  const onFinish = async (values: FieldsItem) => {
    const params = fields?.id ? Object.assign({}, values, { id: fields.id }) : values;
    onSubmit(params, formRef!.current!);
  };

  const handleFetchRole = async () => {
    dispatch({
      type: 'role/fetch',
      callback: (res: API.ApiDataType<API.RoleListType[]>) => {
        const list = res.data.map((item: API.RoleListType) => {
          return {
            label: item.title,
            value: item.id,
          };
        });
        setList(list);
      },
    });
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
      <ProFormText name="username" label="用户名" rules={[{ required: true, whitespace: true, message: '请输入用户名' }]} />
      <ProFormText
        name="work_no"
        label="座席编号"
        rules={[
          {
            required: true,
            whitespace: true,
            validator: (rule, value, callback) => {
              const reg = /^[a-zA-Z0-9]+$/g;
              if (!value) {
                return Promise.reject(new Error('请输入座席编号'));
              }
              if (!reg.test(value)) {
                return Promise.reject(new Error('请输入字母和数字！'));
              }
              return Promise.resolve();
            },
          },
        ]}
      />
      <ProFormText.Password
        name="password"
        label="密码"
        rules={[
          {
            required: !fields?.id,
            whitespace: true,
            validator: (rule, value, callback) => {
              if (!fields?.id && !value) {
                return Promise.reject(new Error('请输入密码'));
              }
              return Promise.resolve();
            },
          },
        ]}
      />
      <ProFormSelect
        name="role_id"
        label="角色"
        fieldProps={{
          optionLabelProp: 'label',
        }}
        placeholder="请选择角色"
        rules={[{ required: true, message: '请选择角色' }]}
        options={list}
      />
    </ModalForm>
  );
};

export default AddEdit;
