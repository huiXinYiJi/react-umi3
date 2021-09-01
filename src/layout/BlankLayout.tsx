import React from 'react';
import { AuthComponent } from '@/components';
import type { IRouteComponentProps } from 'umi';

const BlankLayout: React.FC<IRouteComponentProps> = (props) => {
  const { routes } = props;

  return (
    <>
      <AuthComponent routes={routes}>{props.children}</AuthComponent>
    </>
  );
};

export default BlankLayout;
