import React, { useState } from 'react';
import { Menu, Modal, Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { history, useDispatch, useSelector } from 'umi';
import UpdatePwd from './UpdatePwd';
import type { ConnectState } from '@/models/connect';
import type { FormInstance } from 'antd/lib/form';
import { resetPwd } from '@/services/login';
import { stringify } from 'querystring';
import styles from './index.less';
import userSvg from '@/assets/user-placeholder.svg';
import { clearCache } from '@/utils/cache';

const UserDropdown: React.FC = () => {
  const dispatch = useDispatch();
  const { pathname } = history.location;
  const { userinfo } = useSelector((state: ConnectState) => state.app);
  const { username } = userinfo;
  const [upwdVisible, setUpwdVisible] = useState<boolean>(false);

  const onMenuClick = (event: { item: React.ReactInstance; key: React.Key }) => {
    const { key } = event;

    if (key === 'logout') {
      Modal.confirm({
        centered: true,
        content: '确定要退出登录吗？',
        closable: false,
        maskClosable: false,
        okText: '确定',
        onOk: () => {
          dispatch({
            type: 'app/fetchLogout',
            callback: () => {
              clearCache();
              history.replace({
                pathname: '/login',
                search: stringify({
                  redirect: pathname,
                }),
              });
            },
          });
        },
      });
    }

    if (key === 'pwd') {
      setUpwdVisible(true);
    }
  };

  const handleClose = (form: FormInstance) => {
    form.resetFields();
    setUpwdVisible(false);
  };

  const handleSubmit = async (fields: API.ResetPwdParamsType, form: FormInstance) => {
    const res = await resetPwd(fields);
    if (res && res.code === 200) {
      message.success(res.msg);
      handleClose(form);
      return true;
    } else {
      return false;
    }
  };

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      <Menu.Item key="pwd">
        <UserOutlined />
        修改密码
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={menuHeaderDropdown} trigger={['hover']} overlayClassName="user-drop" placement="bottomRight">
        <span className={`${styles.action} ${styles.info}`}>
          <img src={userSvg} alt="user" className={styles.avatar} />
          <span className={styles.username}>{username}</span>
          <DownOutlined />
        </span>
      </Dropdown>
      <UpdatePwd title="修改密码" modalVisible={upwdVisible} onClose={handleClose} onSubmit={handleSubmit} />
    </>
  );
};

export default UserDropdown;
