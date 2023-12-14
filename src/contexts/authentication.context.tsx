import { getAuthMe } from '@/services/api/authentication';
import { createContext, useEffect, useState } from 'react';

interface AuthMeItemsType {
  id: string;
  generalPermissions: Array<object>;
}

interface AuthMeContextType {
  authMe: AuthMeItemsType;
}

export const AuthenticationContext = createContext<AuthMeContextType>({
  authMe: { id: '', generalPermissions: [] },
});

export const AuthenticationProvider = ({ children }: any) => {
  const [authMe, setAuthMe] = useState({ id: '', generalPermissions: [] });

  const handleGetAuthMe = async () => {
    const data = await getAuthMe();
    setAuthMe(data.data);
  };

  useEffect(() => {
    handleGetAuthMe();
  }, []);

  const value = { authMe };
  return <AuthenticationContext.Provider value={value}>{children}</AuthenticationContext.Provider>;
};
