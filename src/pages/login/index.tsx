import { useEffect } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { history, useDispatch, useSelector } from 'umi';
import styles from './login.less';
import type { IRouteComponentProps } from 'umi';
import type { ConnectState } from '@/models/connect';
import { getToken, getRouters, clearCache } from '@/utils/cache';
import { Footer } from '@/components';
import { getPageQuery } from '@/utils';
import google from '@/assets/google.png';
import firefox from '@/assets/firefox.png';
import safari from '@/assets/safari.png';
import logo360 from '@/assets/360.png';
import sogo from '@/assets/sogo.png';
import qq from '@/assets/qq.png';
import fast from '@/assets/fast.png';

const Login: React.FC<IRouteComponentProps> = (props) => {
  const dispatch = useDispatch();
  const submitting = useSelector((state: ConnectState) => state.loading.effects['app/fetchLogin']);
  const token = getToken();
  const routersCache = getRouters();

  // 若已登录 跳转到首页
  useEffect(() => {
    if (token && routersCache.length > 0) {
      goToPage();
    } else {
      clearCache();
    }
  }, [token]);

  const goToPage = () => {
    const params = getPageQuery();
    let { redirect } = params as { redirect: string };
    history.replace(redirect || '/');
    // window.location.href = redirect ? '#' + redirect : '/';
  };

  const onFinish = (values: API.LoginParamsType) => {
    dispatch({
      type: 'app/fetchLogin',
      payload: values,
      callback: () => {},
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.loginBox}>
          <div className={styles.top}>
            {/* <img className={styles.logo} alt="logo" src={logoSrc} /> */}
            <span className={styles.title}>{REACT_APP_FULL_TITLE}</span>
          </div>
          <ProForm
            size="large"
            onFinish={(values) => {
              onFinish(values as API.LoginParamsType);
              return Promise.resolve();
            }}
            submitter={{
              searchConfig: {
                submitText: '登 录',
              },
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                loading: submitting,
                style: {
                  width: '100%',
                },
              },
            }}
          >
            <ProFormText
              required={false}
              name="username"
              placeholder="请输入登录账号"
              fieldProps={{
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: '请输入登录账号',
                },
              ]}
            />
            <ProFormText.Password
              required={false}
              name="password"
              placeholder="请输入密码"
              fieldProps={{
                prefix: <LockOutlined className={styles.prefixIcon} />,
              }}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: '请输入密码',
                },
              ]}
            />
          </ProForm>
          <div className={styles.browserTip}>
            <span className={styles.brow}>
              建议使用
              <img src={google} alt="google-logo" />
              Chrome、 <img src={firefox} alt="firefox-logo" />
              火狐、 <img src={safari} alt="safari-logo" />
              Safari浏览器
            </span>
            <span className={styles.brow}>
              或 <img src={logo360} alt="360-logo" />
              360、 <img src={sogo} alt="sogo-logo" />
              搜狗、 <img src={qq} alt="qq-logo" />
              QQ等浏览器 <img src={fast} alt="fast-logo" />
              极速模式
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
