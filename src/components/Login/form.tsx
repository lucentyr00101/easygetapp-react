import { clearCache, setTokens } from '@/global';
import type { LoginDetails } from '@/pages/User/Login';
import styles from '@/pages/User/Login/index.less';
import { fetchQr as _fetchQr, login } from '@/services/ant-design-pro/api';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, history, useIntl, useModel } from '@umijs/max';
import { Alert, Button, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

interface Props {
  setLoginDetails: (object: any) => void;
  loginDetails: LoginDetails;
  setQR: (url: string) => void;
}

const _LoginForm: React.FC<Props> = ({ setLoginDetails, setQR, loginDetails }) => {
  const intl = useIntl();
  const formRef = useRef<ProFormInstance>();
  const [userLoginState, setUserLoginState] = useState<{
    status: 'error' | 'success' | '';
    message?: string;
  }>();
  // const { initialState, setInitialState } = useModel('@@initialState');
  const [saving, setSaving] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  const LoginMessage: React.FC<{
    content: string;
  }> = ({ content }) => {
    return (
      <Alert
        style={{
          marginBottom: 24,
        }}
        message={content}
        type="error"
        showIcon
      />
    );
  };

  const fetchQr = async (username: string) => {
    try {
      const { data } = await _fetchQr({ username });
      setQR(data);
    } catch (e: any) {
      console.log(e);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const userInfo = await initialState?.fetchUserInfo?.();
      if (userInfo?.id) {
        flushSync(async () => {
          await setInitialState((s: any) => ({
            ...s,
            currentUser: userInfo,
          }));
          const routes: any = initialState?.fetchRoutes?.(userInfo);
          history.push(routes?.[0]?.path);
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    clearCache();
    setSaving(true);
    setUserLoginState((prev) => ({
      ...prev,
      status: '',
    }));
    try {
      // 登录
      const { data } = await login({ ...values });
      const {
        isResetOtp,
        application,
        gaStatus,
        accessToken,
        refreshToken,
        expiresIn,
        refreshExpiresIn,
      } = data || {};
      const { appTemplate } = application || {};

      if (APP_TEMPLATE !== appTemplate.toLowerCase()) {
        throw intl.formatMessage({ id: 'message.access.not-allowed' });
      }

      if (gaStatus === 'Disable') {
        setTokens(accessToken, refreshToken, expiresIn, refreshExpiresIn);
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        return;
      }

      window.localStorage.setItem('t', data?.accessToken);
      if (isResetOtp) {
        await fetchQr(values.username as string);
      }

      setLoginDetails(() => ({
        username: values.username,
        password: values.password,
        page: 'qr',
        data,
      }));
    } catch (error: any) {
      console.log({ error });
      const code: number = error?.response?.data?.code;
      const requestMessage: string =
        error?.response?.data?.message ||
        (typeof error === 'string' && error) ||
        intl.formatMessage({ id: 'something-went-wrong' });
      const apiMessage: string =
        code && intl.formatMessage({ id: code }) !== String(code)
          ? intl.formatMessage({ id: code })
          : requestMessage;
      setUserLoginState(() => ({
        message: apiMessage,
        status: 'error',
      }));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    formRef?.current?.setFieldsValue({
      username: loginDetails.username,
      password: loginDetails.password,
    });
  }, []);

  return (
    <div className="form-wrapper">
      <ProForm
        formRef={formRef}
        onFinish={async (values) => {
          await handleSubmit(values as API.LoginParams);
        }}
        submitter={{
          submitButtonProps: {
            style: {
              display: 'none',
            },
          },
          resetButtonProps: {
            style: {
              display: 'none',
            },
          },
        }}
      >
        <p className={`${styles['login__text']} ${styles['login__text--head']}`}>
          {intl.formatMessage({ id: 'login.welcome' })}
        </p>
        <p className={`${styles['login__text']} ${styles['login__text--sub']}`}>
          {intl.formatMessage({ id: 'login.welcome-subtext' })}
        </p>
        {userLoginState?.status === 'error' && (
          <LoginMessage content={userLoginState?.message || ''} />
        )}
        <ProFormText
          name="username"
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined style={{ color: '#00b1ff' }} />,
          }}
          placeholder={intl.formatMessage({
            id: 'pages.userSetting.username',
          })}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage id="login.username.required" defaultMessage="请输入用户名!" />
              ),
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined style={{ color: '#00b1ff' }} />,
          }}
          placeholder={intl.formatMessage({
            id: 'pages.userSetting.password',
          })}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage id="login.password.required" defaultMessage="请输入密码！" />
              ),
            },
          ]}
        />
        <ProForm.Item>
          <Button loading={saving} type="primary" block size="large" htmlType="submit">
            {intl.formatMessage({ id: 'login' })}
          </Button>
        </ProForm.Item>
      </ProForm>
    </div>
  );
};

export default _LoginForm;
