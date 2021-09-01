import React, { useState } from 'react';
import ProCard from '@ant-design/pro-card';
import ProductList from './list';
import ProductCate from './cate';

interface ProIndexProps {
  isOPenFrModal?: boolean; // 是否从弹窗打开
}

const ProductIndex: React.FC<ProIndexProps> = (props) => {
  const { isOPenFrModal } = props;
  const [cate, setCate] = useState<API.ProducCateType | undefined>(undefined);

  return (
    <ProCard split="vertical">
      <ProCard colSpan="350px">
        <ProductCate onChange={(cate: API.ProducCateType | undefined) => setCate(cate)} cate={cate} />
      </ProCard>
      <ProCard colSpan="calc(100% - 350px)">
        <div className="card-box">
          <ProductList cate={cate} isOPenFrModal={isOPenFrModal} />
        </div>
      </ProCard>
    </ProCard>
  );
};

export default ProductIndex;
