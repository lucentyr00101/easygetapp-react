import { removeTokens } from '@/global';
import { history, useIntl, useModel } from '@umijs/max';
import { Modal, Typography } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const { Title } = Typography;

interface Props {
  visible: boolean;
  logoutType: string;
}

const LogoutModal: FC<Props> = ({ visible, logoutType = 'sessionExpired' }) => {
  const intl = useIntl();
  const { setInitialState } = useModel('@@initialState');
  const [timer, setTimer] = useState(5);
  const [intervalItem, setIntervalItem] = useState<any>();

  const messagesMap = () => {
    const msgs = {
      otp: intl.formatMessage({ id: 'message.logout.reset-otp' }, { n: timer }),
      permission: intl.formatMessage({ id: 'message.logout.permission' }, { n: timer }),
      role: intl.formatMessage({ id: 'message.logout.role' }, { n: timer }),
      disabled: intl.formatMessage({ id: 'message.logout.disabled' }, { n: timer }),
      duplicate: intl.formatMessage({ id: 'message.logout.duplicate' }, { n: timer }),
      sessionExpired: intl.formatMessage({ id: 'message.logout.session-expired' }, { n: timer }),
      roles: intl.formatMessage({ id: 'message.logout.roles' }, { n: timer }),
    };
    return msgs[logoutType as never];
  };

  const runTimer = () => {
    setTimer((prev) => prev - 1);
  };

  const handleLogout = () => {
    flushSync(() => {
      setInitialState(
        (s) => ({ ...s, currentUser: undefined, tabActiveKey: undefined, tabList: [] } as any),
      );
    });
    removeTokens();
    history.push('/user/login');
    // window.location.href = '/';
  };

  useEffect(() => {
    if (timer === 0) {
      setIntervalItem(undefined);
      clearInterval(intervalItem);
      handleLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  useEffect(() => {
    if (visible) {
      const timer = setInterval(() => {
        runTimer();
      }, 1000);
      setIntervalItem(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal maskClosable={false} closable={false} destroyOnClose open={visible} footer={null}>
      <Title style={{ marginBottom: 'revert' }} level={4}>
        {messagesMap()}
      </Title>
    </Modal>
  );
};

export default LogoutModal;
