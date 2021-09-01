import React, { useRef, useEffect, useState } from 'react';
import ProForm, { DrawerForm, ProFormText, ProFormSelect, ProFormDigit, ProFormRadio, ProFormTextArea } from '@ant-design/pro-form';
import { Button, Drawer, message, Modal } from 'antd';
import { useDispatch, useSelector } from 'umi';
import type { FormInstance } from 'antd/lib/form';
import type { FieldsItem } from '../index';
import { getList } from '@/services/customer';
import { FormSelectPage } from '@/components';
import ProductIndex from '@/pages/product';
import SelectedProList from './selectedProList';
import { PayTypeOptions, TrackingCompanyOptions, OrderPathwayOptions, TrackingStatusOptions } from '@/utils/value.config';
import { resetDataToSelect } from '@/utils';
import type { ConnectState } from '@/models/connect';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ModalProps {
  title: string;
  modalVisible: boolean;
  onClose: (form: FormInstance) => void;
  onSubmit: (values: FieldsItem, form: FormInstance) => void;
  fields: FieldsItem | undefined;
  isPromotion?: boolean; // 是否升单
}

// 页面逻辑
const AddEdit: React.FC<ModalProps> = (props) => {
  const dispatch = useDispatch();
  const { title, modalVisible, onClose, onSubmit, fields, isPromotion } = props;
  const formRef = useRef<FormInstance>();
  const { selectedPrds } = useSelector((state: ConnectState) => state.productList);
  const [childDrawerVisible, setChildDrawerVisible] = useState<boolean>(false);
  const [list, setList] = useState<API.EditProListType[]>([]);
  const [sourceList, setSourceList] = useState<API.OptionsType<API.SourceListType>[]>([]);

  useEffect(() => {
    // 表单赋值
    if (fields) {
      formRef.current?.setFieldsValue({
        ...fields,
        source_id: fields.source_id === 0 ? undefined : fields.source_id,
        tracking_status: fields.tracking_status === 0 ? undefined : fields.tracking_status,
        pay_type: fields.pay_type === -1 ? undefined : fields.pay_type,
      });
      fields.id && getOrderProList(fields.id);
    }
  }, [fields]);

  useEffect(() => {
    if (modalVisible) {
      handleSourceFetch();
    }
  }, [modalVisible]);

  // 获取客户来源列表
  const handleSourceFetch = async () => {
    dispatch({
      type: 'source/fetch',
      callback: (res: API.SourceListType[]) => {
        setSourceList(resetDataToSelect(res, { label: 'name', value: 'id' }));
      },
    });
  };

  // 获取添加的产品列表
  const getOrderProList = async (order_id: number) => {
    dispatch({
      type: 'order/getOrderList',
      payload: { order_id },
      callback: (res: API.ApiDataType<API.OrderProListType[]>) => {
        setList(resetList(res.data));
      },
    });
  };

  // 重构数据
  const resetList = (arr: API.OrderProListType[]) => {
    const copyArr: API.EditProListType[] = JSON.parse(JSON.stringify(arr));
    const resetProList = copyArr.map((item) => {
      item.edit_number = item.number || 1;
      item.edit_price = item.price + '' || '0';
      item.edit_id = item.product_id + '';
      item.del_id = item.id;
      return item;
    });
    return resetProList;
  };

  // 提交表单数据
  const onFinish = async (values: FieldsItem) => {
    if (list.length <= 0) {
      message.warning('请选择产品');
      return false;
    }
    Modal.confirm({
      title: '您确认要修改这些信息吗?',
      icon: <ExclamationCircleOutlined />,
      content: '一经确认, 操作将无法撤销',
      onOk() {
        const selectedProduct: Partial<API.EditProListType>[] = [];
        list.map((item) => {
          const obj: API.EditProListType = {
            product_id: item.product_id,
            edit_number: item.edit_number,
            edit_price: item.edit_price,
            discount: item.discount,
            remark: item.remark,
          };
          item.id && (obj.id = item.id);
          selectedProduct.push(obj);
        });

        const params = fields?.id
          ? Object.assign({}, values, { id: fields.id }, { pro_list: JSON.stringify(selectedProduct) })
          : Object.assign({}, values, { pro_list: JSON.stringify(selectedProduct) });
        onSubmit(params, formRef!.current!);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  // 确定选择的产品
  const handleSelectPro = () => {
    const copyArr: API.EditProListType[] = JSON.parse(JSON.stringify(selectedPrds));
    const resetProList = copyArr.map((item) => {
      item.edit_number = 1;
      item.edit_price = item.price + '' || '0';
      item.discount = 0;
      item.edit_id = item.product_id + '';
      item.remark = item.remark || '';
      return item;
    });
    setList((prev) => {
      // 若选择的产品已存在 则不添加
      const willAdd: API.EditProListType[] = [];
      resetProList.map((item) => {
        const alreadyHas = prev.filter((ele) => ele.product_id === item.product_id);
        if (alreadyHas.length <= 0) {
          willAdd.push(item);
        }
      });
      return prev.concat(willAdd);
    });
    clearSelectedPrds();
    setChildDrawerVisible(false);
  };

  const handleListChange = (list: API.EditProListType[]) => {
    setList(list);
  };

  // 清除之前存储的已选择的产品
  const clearSelectedPrds = () => {
    dispatch({
      type: 'productList/setSelectedPrds',
      payload: [],
    });
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
        onClose: () => {
          setList([]);
          onClose(formRef!.current!);
        },
        contentWrapperStyle: {
          maxWidth: '100%',
        },
        width: '80%',
      }}
      onFinish={onFinish}
    >
      <ProForm.Group>
        {!fields?.id ? (
          <FormSelectPage
            width="md"
            name="cid"
            label="求购客户"
            fieldProps={{
              optionLabelProp: 'label',
              onChange: (_, options) => {
                let post_tel = '',
                  post_address = '',
                  source_id = undefined;
                if (options !== undefined) {
                  const { phone, addr, source_form } = options as API.OptionsType<API.CustomerListType>;
                  post_tel = phone;
                  post_address = addr;
                  source_id = source_form === 0 ? undefined : source_form;
                }
                formRef.current?.setFieldsValue({
                  post_tel,
                  post_address,
                  source_id,
                });
              },
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
        ) : (
          <ProFormText
            width="md"
            name="post_receiver"
            label="客户联系人"
            rules={[{ required: true, whitespace: true, message: '请填写客户联系人' }]}
          />
        )}
        <ProFormText
          width="md"
          name="post_tel"
          label="电话"
          placeholder="请输入电话"
          rules={[{ required: true, whitespace: true, message: '请输入电话' }]}
        />
        <ProFormTextArea
          width="md"
          name="post_address"
          label="订单地址"
          placeholder="请输入订单地址"
          rules={[{ required: true, whitespace: true, message: '请输入订单地址' }]}
        />
        <ProFormRadio.Group
          style={{ marginLeft: '328px' }}
          width="md"
          name="order_pathway"
          label="成交途径"
          radioType="button"
          options={OrderPathwayOptions}
          fieldProps={{
            buttonStyle: 'solid',
          }}
          rules={[{ required: true, message: '请选择成交途径' }]}
        />
        <ProFormSelect
          width="md"
          name="source_id"
          label="客户来源"
          fieldProps={{
            optionLabelProp: 'label',
            showSearch: true,
          }}
          placeholder="请选择客户来源"
          rules={[{ required: true, message: '请选择客户来源' }]}
          options={sourceList}
          disabled={isPromotion}
        />
        <ProFormSelect
          width="md"
          name="tracking_company"
          label="配送方式"
          fieldProps={{
            optionLabelProp: 'label',
          }}
          placeholder="请选择配送方式"
          options={TrackingCompanyOptions}
        />
        {/* <ProFormSelect
          width="md"
          name="tracking_status"
          label="物流状态"
          fieldProps={{
            optionLabelProp: 'label',
          }}
          placeholder="请选择物流状态"
          options={TrackingStatusOptions}
        /> */}
        <ProFormRadio.Group
          width="md"
          name="pay_type"
          label="支付类型"
          radioType="button"
          options={PayTypeOptions}
          fieldProps={{
            buttonStyle: 'solid',
          }}
          rules={[{ required: true, message: '请选择支付类型' }]}
        />

        <ProFormTextArea
          width="md"
          name="seller_words"
          label="商家备注"
          placeholder="请输入商家备注"
          rules={[{ whitespace: true, message: '请输入商家备注' }]}
        />
        <ProFormTextArea
          width="md"
          name="remark"
          label="订单备注"
          placeholder="请输入订单备注"
          rules={[{ whitespace: true, message: '请输入订单备注' }]}
        />
        <ProFormDigit
          width="md"
          name="has_pay"
          label="店铺收款"
          fieldProps={{
            min: 0,
            formatter: (value) => `￥ ${value}`,
          }}
          rules={[{ type: 'number', whitespace: true, message: '请输入店铺收款' }]}
        />
        <ProFormDigit
          width="md"
          name="to_pay"
          label="到付金额"
          fieldProps={{
            min: 0,
            formatter: (value) => `￥ ${value}`,
          }}
          rules={[{ type: 'number', whitespace: true, message: '请输入到付金额' }]}
        />
        <ProFormDigit
          width="md"
          name="offline_pay"
          label="线下收款"
          fieldProps={{
            min: 0,
            formatter: (value) => `￥ ${value}`,
          }}
          rules={[{ type: 'number', whitespace: true, message: '请输入线下收款金额' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <Button type="primary" style={{ marginBottom: '10px' }} onClick={() => setChildDrawerVisible(true)}>
          添加产品
        </Button>
      </ProForm.Group>
      <SelectedProList list={list} onListChange={handleListChange} />
      <Drawer
        title="产品列表"
        width="100%"
        visible={childDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setChildDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button onClick={handleSelectPro} type="primary">
              确定选择
            </Button>
          </div>
        }
        onClose={() => setChildDrawerVisible(false)}
      >
        <ProductIndex isOPenFrModal={true} />
      </Drawer>
    </DrawerForm>
  );
};

export default AddEdit;
