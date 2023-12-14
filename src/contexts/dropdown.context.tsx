import {
  getDropdownRoles,
  getDropdownStatusType,
  getDropdownUserType,
} from '@/services/api/dropdown';
import { createContext, useEffect, useState } from 'react';

export const DropdownContext = createContext({
  statusType: [],
  userType: [],
  roles: [],
  handleGetDropdownRoles: () => {},
});

export const DropdownProvider = ({ children }: any) => {
  const [statusType, setStatusType] = useState([]);
  const [userType, setUserType] = useState([]);
  const [roles, setRoles] = useState([]);

  const handleGetDropdownStatusType = async () => {
    const { data } = await getDropdownStatusType();
    setStatusType(data || []);
  };

  const handleGetDropdownUserType = async () => {
    const { data } = await getDropdownUserType();
    setUserType(data || []);
  };

  const handleGetDropdownRoles = async () => {
    const { data } = await getDropdownRoles();
    setRoles(data || []);
  };

  useEffect(() => {
    handleGetDropdownStatusType();
    handleGetDropdownUserType();
  }, []);

  const value = { statusType, userType, roles, handleGetDropdownRoles };
  return <DropdownContext.Provider value={value}>{children}</DropdownContext.Provider>;
};
