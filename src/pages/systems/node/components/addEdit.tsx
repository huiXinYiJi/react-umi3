import React, { useRef, useEffect } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { ModalForm, ProFormText, ProFormDigit, ProFormSelect, ProFormRadio } from '@ant-design/pro-form';
import { TreeSelect, Form } from 'antd';
import type { FieldsItem } from '../index';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
  fields: FieldsItem | undefined;
  treeData: treeDataType[];
}

export type treeDataType = {
  value: number;
  title: string;
  children?: treeDataType[];
};

export const layoutList = [
  {
    value: 'Home',
    label: 'Home',
  },
];

export type statusListType = Readonly<Record<0 | 1, API.ColumnTextStatus>>;

export const isShowList: statusListType = {
  0: { text: '显示', status: 'success' },
  1: { text: '不显示', status: 'error' },
};

export const isStatusList: statusListType = {
  0: { text: '目录', status: 'processing' },
  1: { text: '节点', status: 'success' },
};

// 页面逻辑
const AddEdit: React.FC<ModalProps> = (props) => {
  const { title, modalVisible, onClose, onSubmit, fields, treeData } = props;
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    // 表单赋值
    if (fields) {
      // console.log('fields', fields);
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

  // 生成radio选项列表
  const getOptions = (list: Record<number, API.ColumnTextStatus>) => {
    const options: API.OptionsType[] = [];
    Object.keys(list).map((k) => {
      const index = Number(k);
      const obj = {
        value: index,
        label: list[index].text,
      };
      options.push(obj);
      return k;
    });
    return options;
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
      size="small"
    >
      <ProFormText
        name="title"
        label="名称"
        rules={[{ required: true, whitespace: true, message: '请输入名称' }]}
        tooltip="目录或节点的名称"
      />
      <Form.Item name="pid" label="父级目录" rules={[{ required: true, message: '请选择父级目录' }]} tooltip="根目录为一级目录">
        <TreeSelect treeData={treeData} placeholder="请选择" />
      </Form.Item>
      <ProFormText
        name="api_path"
        label="接口路径"
        tooltip="针对接口"
        // rules={[
        //   ({ getFieldValue }) => ({
        //     validator(_, value) {
        //       if (getFieldValue('is_status') === 1 && !value) {
        //         return Promise.reject(new Error('请输入接口路径'));
        //       }
        //       return Promise.resolve();
        //     },
        //   }),
        // ]}
      />
      <ProFormText name="web_path" label="前端地址" tooltip="页面路径地址，接口类型不需要填写, 实际地址前缀会加上父级地址" />
      <ProFormText name="component" label="组件地址/标识" tooltip="识别路由所对应的页面，可用此定义菜单或接口独有name" />
      <ProFormDigit name="sort" label="排序" tooltip="目录排序" fieldProps={{ precision: 0 }} />
      <ProFormSelect name="layout" options={layoutList} label="组件布局" tooltip="可使用布局，前端定义" />
      <ProFormRadio.Group
        name="is_status"
        label="类型"
        options={getOptions(isStatusList)}
        rules={[{ required: true, message: '请选择类型' }]}
      />
      <ProFormRadio.Group
        name="is_show"
        label="状态"
        options={getOptions(isShowList)}
        rules={[{ required: true, message: '请选择状态' }]}
      />
    </ModalForm>
  );
};

export default AddEdit;
