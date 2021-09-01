import React, { useRef, useEffect, useState } from 'react';
import type { FormInstance } from 'antd/lib/form';
import ProForm, { DrawerForm, ProFormText, ProFormDigit, ProFormRadio } from '@ant-design/pro-form';
import { useDispatch } from 'umi';
import type { FieldsItem } from '../index';
import { ProductStatusOptions } from '@/utils/value.config';
import { TreeSelect, Form } from 'antd';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
  fields: FieldsItem | undefined;
}

// 页面逻辑
const AddEdit: React.FC<ModalProps> = (props) => {
  const dispatch = useDispatch();
  const { title, modalVisible, onClose, onSubmit, fields } = props;
  const formRef = useRef<FormInstance>();
  const [treeData, setTreeData] = useState<API.treeDataType[]>([]);

  useEffect(() => {
    // 表单赋值
    if (fields) {
      formRef.current?.setFieldsValue({
        ...fields,
      });
    }
  }, [fields]);

  useEffect(() => {
    if (modalVisible) {
      handleFetch();
    }
  }, [modalVisible]);

  // 获取客户来源列表
  const handleFetch = async () => {
    dispatch({
      type: 'productCate/fetchCate',
      callback: (res: API.ApiDataType<API.ProducCateType[]>) => {
        setTreeData(getTreeData(res.data));
      },
    });
  };

  // 重构弹窗中父级目录树形数据
  const getTreeData = (list: API.ProducCateType[]): API.treeDataType[] => {
    const copy: API.ProducCateType[] = JSON.parse(JSON.stringify(list));
    const menusArr: API.treeDataType[] = [];
    const loop = (arr: API.ProducCateType[]) => {
      const res: API.treeDataType[] = [];
      arr.map((item: API.ProducCateType) => {
        const obj: API.treeDataType = {
          value: item.id,
          title: item.name,
        };
        if (item.hasOwnProperty('child') && item.child && item.child.length > 0) {
          const children = loop(item.child);
          obj.children = children;
        }
        res.push(obj);
        return item;
      });
      return res;
    };
    menusArr.push(...loop(copy));
    return menusArr;
  };

  // 提交表单数据
  const onFinish = async (values: FieldsItem) => {
    const params = fields?.product_id ? Object.assign({}, values, { product_id: fields.product_id }) : values;
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
    >
      <ProForm.Group>
        <ProFormText width="md" name="name" label="商品名称" rules={[{ required: true, whitespace: true, message: '请输入商品名称' }]} />
        <ProFormDigit
          width="md"
          name="price"
          label="商品价格(￥)"
          fieldProps={{ min: 1 }}
          rules={[{ type: 'number', required: true, whitespace: true, message: '请输入商品价格' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          width="md"
          name="number"
          label="商品数量"
          fieldProps={{ min: 1, precision: 0 }}
          rules={[{ type: 'number', required: true, whitespace: true, message: '请输入商品数量' }]}
        />
        <ProFormText width="md" name="code" label="商品编码" rules={[{ required: true, whitespace: true, message: '请输入商品编码' }]} />
      </ProForm.Group>
      <ProForm.Group>
        <Form.Item
          wrapperCol={{ span: 24 }}
          name="cate_id"
          label="商品分类"
          rules={[{ required: true, message: '请选择商品分类' }]}
          tooltip="根目录为一级分类"
        >
          <TreeSelect className={`pro-field-md`} treeData={treeData} placeholder="请选择" />
        </Form.Item>
        <ProFormRadio.Group
          width="md"
          name="is_status"
          label="商品状态"
          radioType="button"
          options={ProductStatusOptions}
          fieldProps={{
            buttonStyle: 'solid',
          }}
          rules={[{ required: true, message: '请选择商品状态' }]}
        />
      </ProForm.Group>
    </DrawerForm>
  );
};

export default AddEdit;
