import React from 'react';
import type { IRouteComponentProps } from 'umi';
import { Redirect, Access, withRouter } from 'umi';
import { passAccess } from '@/utils/route.config';
import { getToken } from '@/utils/cache';

const AuthComponent: React.FC<IRouteComponentProps> = (props) => {
  const {
    location: { pathname },
    routes,
  } = props;

  if (getToken()) {
    return (
      <>
        <Access accessible={passAccess(pathname, routes)} fallback={<Redirect to={{ pathname: '403', state: { from: props.location } }} />}>
          {props.children}
        </Access>
      </>
    );
  } else {
    return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
  }
};

export default withRouter(AuthComponent);
