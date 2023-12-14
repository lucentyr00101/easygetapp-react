import { getAppSubscription, getCurrentAppDetails } from '@/services/api/app-management';
import { createContext, useContext, useState } from 'react';
import useStateRef from 'react-usestateref';
import { useGlobalContext } from './global.context';

interface AppContextType {
  currentAppSubscription: API.AppSubscription;
  currentApp: any;
  handleGetCurrentAppSubscription: () => void;
  handleGetCurrentAppDetails: (id: string) => void;
  fetchingApp: boolean;
  fetchingSubscription: boolean;
}

export const ApplicationContext = createContext<AppContextType>({
  currentAppSubscription: { level: 0, maxFileSize: 0 },
  currentApp: {},
  handleGetCurrentAppSubscription: () => {},
  handleGetCurrentAppDetails: () => {},
  fetchingApp: false,
  fetchingSubscription: false,
});

export const ApplicationProvider = ({ children }: any) => {
  const { installPageBaseURL } = useGlobalContext();
  const [currentAppSubscription, setCurrentAppSubscription] = useState<API.AppSubscription>({
    level: 0,
    maxFileSize: 0,
  });
  const [currentApp, setCurrentApp] = useState({});
  const [, setFetchingApp, fetchingRef] = useStateRef(false);
  const [, setFetchingSubscription, fetchingSubscriptionRef] = useStateRef(false);

  const handleGetCurrentAppSubscription = async () => {
    try {
      setFetchingSubscription(true);
      const response: any = await getAppSubscription();
      const level: number = response?.data?.application?.level;
      // const minFileSize: number = response?.data?.subscription?.minFileSizeLimitInBytes || 0; // 0MB Default
      const maxFileSize: number = response?.data?.subscription?.fileSizeLimitInBytes || 314572800; // 300MB Default
      const appSubscription: API.AppSubscription = { level, maxFileSize };
      setCurrentAppSubscription(appSubscription);
      setFetchingSubscription(false);
      return appSubscription;
    } catch (error) {
      setFetchingSubscription(false);
      return error;
    }
  };

  const handleGetCurrentAppDetails = async (id: string) => {
    try {
      setFetchingApp(true);
      const data = await getCurrentAppDetails(id);
      const filterAppDetails = {
        ...data.data,
        installationPageFullLink: `${installPageBaseURL}${data.data.installationPage}`,
      };
      setCurrentApp(filterAppDetails);
      setFetchingApp(false);
      return data;
    } catch (err) {
      setFetchingApp(false);
    }
  };

  const value = {
    fetchingSubscription: fetchingSubscriptionRef.current,
    currentAppSubscription,
    currentApp,
    handleGetCurrentAppSubscription,
    handleGetCurrentAppDetails,
    fetchingApp: fetchingRef.current,
  };
  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
};

export const useApplicationContext = () => {
  return useContext(ApplicationContext);
};
