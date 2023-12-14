import loginImage from '@/assets/login-image.svg';
import logo from '@/assets/logo.svg';
import Form from '@/components/Login/form';
import QR from '@/components/Login/qr';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, SelectLang, useIntl, useModel } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import Settings from '../../../../config/defaultSettings';
import styles from './index.less';

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const postLocalesData = () => [
    {
      lang: 'en-US',
      label: 'English',
      icon: '🇺🇸',
      title: 'Language',
    },
    {
      lang: 'zh-CN',
      label: '简体中文',
      icon: '🇨🇳',
      title: '语言',
    },
  ];

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang reload={false} postLocalesData={postLocalesData} />}
    </div>
  );
};

export type LoginDetails = {
  username: string | null;
  password: string | null;
  data: any;
  page: 'login' | 'qr';
};

const Login: React.FC = () => {
  const cookies = new Cookies();
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [loginDetails, setLoginDetails] = useState<LoginDetails>({
    username: null,
    password: null,
    data: null,
    page: 'login',
  });
  const [qr, setQr] = useState('');

  const redirect = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      const routes: any = initialState?.fetchRoutes?.(userInfo);
      window.location.href = routes?.[0]?.path;
    }
  };

  useEffect(() => {
    const token = cookies.get('auth_token');
    if (token) {
      redirect();
    }
  }, []);

  return (
    <div className={styles.login}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>

      <Lang />
      <div className={styles.login__content}>
        <img src={logo} className={styles.login__logo} alt="" />
        <div className={styles.login__form__container}>
          <div className={styles.login__image}>
            <img src={loginImage} alt="" />
          </div>
          {loginDetails.page === 'login' && (
            <Form setQR={setQr} loginDetails={loginDetails} setLoginDetails={setLoginDetails} />
          )}
          {loginDetails.page === 'qr' && (
            <QR loginDetails={loginDetails} qr={qr} setLoginDetails={setLoginDetails} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
