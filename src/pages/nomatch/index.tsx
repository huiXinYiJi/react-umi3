import React from 'react';
import { Result, Button } from 'antd';
import type { ResultStatusType } from 'antd/lib/result';
import type { IRouteComponentProps } from 'umi';

type StatusType = {
  status: ResultStatusType;
  title: React.ReactNode;
  subTitle: React.ReactNode;
};
type ErrType = Record<number, StatusType>;

export default function NoMatch(props: IRouteComponentProps) {
  const errStatus: ErrType = {
    404: {
      status: 404,
      title: 404,
      subTitle: '非常抱歉，您访问的页面不存在！',
    },
    403: {
      status: 403,
      title: 403,
      subTitle: '非常抱歉，您无权访问当前页面！',
    },
  };

  const getStatusInfo = (): StatusType => {
    const pathArr = props.location ? props.location.pathname.split('/') : [];
    const status = pathArr[pathArr.length - 1] || props.status;
    return errStatus[status] || errStatus[404];
  };

  const backToHomePage = () => {
    props.history.push('/');
  };

  return (
    <>
      <Result
        status={getStatusInfo().status}
        title={getStatusInfo().title}
        subTitle={getStatusInfo().subTitle}
        extra={
          <Button type="primary" onClick={backToHomePage}>
            返回主页
          </Button>
        }
      />
    </>
  );
}
