import React, { useRef, useEffect, useState } from 'react';
import type { FormInstance } from 'antd/lib/form';
import { Tree, Spin, Empty } from 'antd';
import { ModalForm } from '@ant-design/pro-form';
import type { ConnectState } from '@/models/connect';
import { useSelector } from 'umi';
import { flattenDeep } from '@/utils';

// 选择的节点id
type CheckedType = React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] };

// 提交参数类型
export type SetNodesPerType = {
  nodes: string;
  role_id: number;
};

type ModalProps = {
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (fields: SetNodesPerType, form: FormInstance) => void;
  fields: Partial<API.RoleListType> | undefined;
  treeData: API.AuthListType[] | undefined;
};

// 页面逻辑
const SetRole: React.FC<ModalProps> = (props) => {
  const { modalVisible, onClose, onSubmit, fields, treeData } = props;
  const formRef = useRef<FormInstance>();
  const loading = useSelector((state: ConnectState) => state.loading.effects['role/fetchRolePermis']);
  const [checkedKeys, setCheckedKeys] = useState<CheckedType>([]);
  const [halfCheckedKeys, setHalfCheckedKeys] = useState<number[]>([]);
  const [nodes, setNodes] = useState<API.DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(false);

  useEffect(() => {
    // 表单赋值
    if (fields) {
      formRef.current?.setFieldsValue({
        ...fields,
      });
    }
  }, [fields]);

  useEffect(() => {
    if (treeData && treeData.length > 0) {
      const checkedKeys = getCheckedKeys(treeData);
      setCheckedKeys(checkedKeys);
      setExpandedKeys(
        flattenDeep(treeData)
          .filter((item) => item.checked)
          .map((item) => item.id),
      ); // checked为true的所有节点id
      setNodes(getNodes(treeData));
      // console.log({ treeData, checkedKeys, nodes: getNodes(treeData) });
    }
  }, [treeData]);

  // 获取子节点id
  const getCheckedKeys = (arr: API.AuthListType[], res: React.Key[] = []) => {
    return arr.reduce((prev: React.Key[], cur: API.AuthListType) => {
      if (cur.checked) {
        if (cur.children && cur.children.length > 0) {
          getCheckedKeys(cur.children, res);
        } else {
          res.push(cur.id!);
        }
      }
      return res;
    }, res);
  };

  // 重构tree上面的数据
  const getNodes = (arr: API.AuthListType[]): API.DataNode[] => {
    return arr.reduce((prev: API.DataNode[], item) => {
      const obj: API.DataNode = {
        key: item.id,
        title: item.title,
      };
      if (item.children && item.children.length > 0) {
        obj.children = getNodes(item.children);
      }
      prev.push(obj);
      return prev;
    }, []);
  };

  // 提交表单数据
  const onFinish = async () => {
    if (fields && fields.id) {
      const allChecked = (checkedKeys as React.Key[]).concat(halfCheckedKeys);
      const nodesIds = allChecked.length > 0 ? allChecked.join(',') : '';
      const params = Object.assign({}, { nodes: nodesIds }, { role_id: fields.id });
      onSubmit(params, formRef!.current!);
    }
  };

  const onCheck = (checkedKeys: CheckedType, info: any) => {
    // console.log('onCheck', checkedKeys, info);
    info.halfCheckedKeys && setHalfCheckedKeys(info.halfCheckedKeys);
    setCheckedKeys(checkedKeys);
  };

  const onExpand = (expandedKeysValue: React.Key[]) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  return (
    <ModalForm
      width={450}
      formRef={formRef}
      visible={modalVisible}
      title="设置权限"
      modalProps={{
        onCancel: () => onClose(formRef!.current!),
        keyboard: false,
        maskClosable: false,
      }}
      onFinish={onFinish}
      size="middle"
    >
      {
        <Spin tip="Loading..." spinning={loading}>
          {treeData && treeData.length > 0 ? (
            <Tree
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onExpand={onExpand}
              checkable
              onCheck={onCheck}
              checkedKeys={checkedKeys}
              treeData={nodes}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Spin>
      }
    </ModalForm>
  );
};

export default SetRole;
