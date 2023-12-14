import { removeTokens, setTokens } from '@/global';
import type { LoginDetails } from '@/pages/User/Login';
import styles from '@/pages/User/Login/index.less';
import { verifyCode } from '@/services/ant-design-pro/api';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, history, useIntl, useModel } from '@umijs/max';
import { Alert, Button, Image, message } from 'antd';
import type { FC } from 'react';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

interface Props {
  setLoginDetails: (object: any) => void;
  qr: string;
  loginDetails: LoginDetails;
}

const QR: FC<Props> = ({ qr, loginDetails, setLoginDetails }) => {
  const intl = useIntl();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [saving, setSaving] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const [state, setState] = useState<{
    status: string;
    message: string;
  }>({
    status: '',
    message: '',
  });

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

  const fetchUserInfo = async () => {
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
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      await verifyCode({ username: loginDetails.username, code: values.code, language: 'English' });
      const { data } = loginDetails;
      const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = data;
      setTokens(accessToken, refreshToken, expiresIn, refreshExpiresIn);
      setState(() => ({
        status: '',
        message: '',
      }));
      const defaultLoginSuccessMessage = intl.formatMessage({
        id: 'pages.login.success',
        defaultMessage: '登录成功！',
      });
      message.success(defaultLoginSuccessMessage);
      await fetchUserInfo();
      window.localStorage.removeItem('t');
    } catch (e: any) {
      message.error(
        intl.formatMessage({ id: e.response.data.code }) ||
          intl.formatMessage({ id: 'something-went-wrong' }),
      );
    }
    setSaving(false);
  };

  const backToLogin = () => {
    removeTokens();
    setLoginDetails((prev: any) => ({
      ...prev,
      data: null,
      page: 'login',
    }));
  };

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
        {qr && (
          <p className={`${styles['login__text']} ${styles['login__text--sub']}`}>
            {intl.formatMessage({ id: 'login.please-scan-qr' })}
          </p>
        )}
        <ProForm.Item style={{ textAlign: 'center' }}>
          <Image preview={false} width={200} src={qr} />
        </ProForm.Item>
        {state?.status === 'error' && <LoginMessage content={state?.message || ''} />}
        <ProForm.Item>
          <ProFormText
            name="code"
            fieldProps={{
              size: 'large',
            }}
            placeholder={intl.formatMessage({
              id: 'login.google-authenticator-code',
            })}
            rules={[
              {
                required: true,
                message: <FormattedMessage id="login.qr.required" defaultMessage="请输入密码！" />,
              },
              {
                pattern: /^\d+$/,
                message: <FormattedMessage id="login.qr.required" defaultMessage="请输入密码！" />,
              },
            ]}
          />
        </ProForm.Item>
        <ProForm.Item>
          <Button loading={saving} type="primary" block size="large" htmlType="submit">
            {intl.formatMessage({ id: 'continue' })}
          </Button>
        </ProForm.Item>
        <ProForm.Item>
          <Button
            loading={saving}
            type="primary"
            ghost
            block
            size="large"
            onClick={() => backToLogin()}
          >
            {intl.formatMessage({ id: 'login.back-to-login-page' })}
          </Button>
        </ProForm.Item>
      </ProForm>
    </div>
  );
};

export default QR;
