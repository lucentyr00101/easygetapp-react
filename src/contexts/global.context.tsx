import LogoutModal from '@/components/Global/LogoutModal';
import { useIntl, useModel } from '@umijs/max';
import { message } from 'antd';
import { createContext, useContext, useEffect, useState } from 'react';
import useStateRef from 'react-usestateref';

interface AppMessage {
  type: 'info' | 'success' | 'error' | 'warning' | 'loading';
  text?: string;
  localesId?: string;
  apiResponse?: any;
}

interface GlobalContextType {
  installPageBaseURL: string;
  appMessage: ({ type, text, localesId, apiResponse }: AppMessage) => void;
  startPoll: () => void;
  stopPoll: () => void;
  logoutType: string;
  showLogout: boolean;
}

export const GlobalContext = createContext<GlobalContextType>({
  installPageBaseURL: '',
  appMessage: () => {},
  startPoll: () => {},
  stopPoll: () => {},
  logoutType: '',
  showLogout: false,
});

export const GlobalProvider = ({ children }: any) => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [installPageBaseURL] = useState(`${window.location.origin}/download/`);
  const { currentUser } = initialState || {};
  const [, setShowLogout, showLogoutRef] = useStateRef(false);
  const [, setLogoutType, logoutTypeRef] = useStateRef<
    'otp' | 'status' | 'permission' | 'role' | 'roles' | ''
  >('');
  const [, setIsPoll, isPollRef] = useStateRef<boolean>(false);
  const [pollTimeout, setPollTimeout] = useState<any>(null);

  const appMessage = ({ type, text, localesId, apiResponse }: AppMessage) => {
    // console.log({ type, text, localesId, apiResponse });
    const code: any = localesId || apiResponse?.response?.data?.code || apiResponse?.code || null;
    const requestMessage: any =
      text ||
      apiResponse?.response?.data?.message ||
      (typeof apiResponse === 'string' && apiResponse) ||
      intl.formatMessage({ id: 'something-went-wrong' });
    const appMessage: any =
      code && intl.formatMessage({ id: code }) !== String(code)
        ? intl.formatMessage({ id: code })
        : requestMessage;
    message?.[type as keyof typeof message](appMessage);
  };

  const fetchUserInfo = async () => {
    try {
      const { isResetOtp, isPermissionUpdated, isRoleDisabled, isRolesUpdated } =
        await initialState?.fetchUserInfo?.();
      if (isResetOtp) setLogoutType('otp');
      else if (isPermissionUpdated) setLogoutType('permission');
      else if (isRoleDisabled) setLogoutType('role');
      else if (isRolesUpdated) setLogoutType('roles');
      setShowLogout(isResetOtp || isPermissionUpdated || isRoleDisabled || isRolesUpdated);
      setPollTimeout(
        isPollRef.current
          ? setTimeout(() => {
              if (isPollRef.current) {
                fetchUserInfo();
              }
            }, 5000)
          : null,
      );
    } catch (e: any) {
      const code: any = { 102: 'disabled', 1050: 'duplicate', 1031: 'sessionExpired' };
      if (code[e?.code]) {
        setLogoutType(code[e?.code]);
        setShowLogout(true);
      } else {
        setPollTimeout(
          isPollRef.current
            ? setTimeout(() => {
                if (isPollRef.current) {
                  fetchUserInfo();
                }
              }, 5000)
            : null,
        );
      }
    }
  };

  const startPoll = () => {
    console.log('[POLLING STARTS]');
    setIsPoll(true);
    setPollTimeout(
      setTimeout(() => {
        if (isPollRef.current) {
          fetchUserInfo();
        }
      }, 5000),
    );
  };

  const stopPoll = () => {
    console.log('[POLLING ENDS]');
    setIsPoll(false);
    clearTimeout(pollTimeout);
    setPollTimeout(null);
  };

  const value = {
    installPageBaseURL,
    appMessage,
    startPoll,
    stopPoll,
    showLogout: showLogoutRef.current,
    logoutType: logoutTypeRef.current,
  };

  useEffect(() => {
    if (currentUser?.id) {
      startPoll();
    }
    return () => {
      stopPoll();
    };
  }, []);

  return (
    <GlobalContext.Provider value={value}>
      <LogoutModal visible={showLogoutRef.current} logoutType={logoutTypeRef.current} />
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
