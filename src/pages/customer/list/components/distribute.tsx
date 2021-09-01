import React, { useRef, useEffect, useState } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import type { FieldsItem, DistributeType } from '../index';
import { useDispatch } from 'umi';
import { resetDataToSelect } from '@/utils';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: DistributeType, form: FormInstance) => void;
  fields?: FieldsItem;
}

// 页面逻辑
const Distribute: React.FC<ModalProps> = (props) => {
  const { modalVisible, title, onSubmit, onClose } = props;
  const dispatch = useDispatch();
  const [userList, setUserList] = useState<API.OptionsType<API.AdminRoleListType>[]>([]);
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    if (modalVisible) handleFetch();
  }, [modalVisible]);

  // 获取用户列表
  const handleFetch = async () => {
    dispatch({
      type: 'customer/cusListByCur',
      callback: (res: API.ApiDataType<API.AdminRoleListType[]>) => {
        const userList = resetDataToSelect(res.data, { label: 'username', value: 'id' });
        setUserList(userList);
      },
    });
  };

  // 提交表单数据
  const onFinish = async (values: DistributeType) => {
    onSubmit(values, formRef!.current!);
  };

  return (
    <ModalForm
      width={450}
      visible={modalVisible}
      formRef={formRef}
      title={title + '客户'}
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
        name="uid"
        label="用户列表"
        fieldProps={{
          optionLabelProp: 'label',
          mode: 'multiple',
        }}
        placeholder="请选择用户"
        rules={[{ required: true, message: '请选择用户' }]}
        options={userList}
      />
    </ModalForm>
  );
};

export default Distribute;
