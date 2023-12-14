import { removeTokens } from '@/global';
import { logout } from '@/services/ant-design-pro/api';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { setAlpha } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { history, useIntl, useModel } from '@umijs/max';
import { Avatar, Dropdown, Spin } from 'antd';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import { flushSync } from 'react-dom';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const Name = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  return <span className={`anticon`}>{currentUser?.username}</span>;
};

const AvatarLogo = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const avatarClassName = useEmotionCss(({ token }) => {
    return {
      marginRight: '8px',
      color: 'inherit',
      verticalAlign: 'top',
      background: setAlpha(token.colorBgContainer, 0.85),
      [`@media only screen and (max-width: ${token.screenMD}px)`]: {
        margin: 0,
      },
    };
  });

  return (
    <Avatar
      size="small"
      icon={<UserOutlined />}
      className={avatarClassName}
      src={currentUser?.profilePicture?.fileLink}
      alt="avatar"
    />
  );
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const intl = useIntl();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const loginOut = async () => {
    const clearOut = () => {
      flushSync(() => {
        setInitialState((s: any) => ({
          ...s,
          currentUser: undefined,
          tabActiveKey: undefined,
          tabList: [],
        }));
      });
      removeTokens();
      history.push('/user/login');
      // window.location.href = '/';
    };
    try {
      await logout({ username: currentUser?.username as string });
      clearOut();
    } catch (e: any) {
      console.log(e);
      clearOut();
    }
  };

  const actionClassName = useEmotionCss(({ token }) => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        loginOut();
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const loading = (
    <span className={actionClassName}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  const menuItems = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: intl.formatMessage({ id: 'menu.account.logout' }),
    },
  ];

  if (!initialState || !currentUser) {
    return loading;
  }

  return (
    <Dropdown
      menu={{
        items: menuItems,
        selectedKeys: [],
        onClick: onMenuClick,
      }}
    >
      <span className={actionClassName}>
        <AvatarLogo />
        <Name />
      </span>
    </Dropdown>
  );
};

export default AvatarDropdown;
