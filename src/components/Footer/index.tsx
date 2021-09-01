import React from 'react';
import { DefaultFooter } from '@ant-design/pro-layout';

const Footer: React.FC = () => {
  return (
    <>
      <DefaultFooter copyright={`${new Date().getFullYear()} ${REACT_APP_WEBSITE}技术部出品`} links={[]} />
    </>
  );
};

export default Footer;
