import { getAppTemplateLink } from '@/services/api/app-management';
import { useParams } from '@umijs/max';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import styles from './style.less';

const Layout: FC = () => {
  const [link, setLink] = useState('');
  const params = useParams();
  const { id } = params || {};
  const isDev = process.env.NODE_ENV === 'development';

  console.log({ PITBULL_REGISTRATION_ID_SUFFIX, isDev });

  const getPitbullRegistrationId = () => {
    const split = window.location.hostname.split(PITBULL_REGISTRATION_ID_SUFFIX);
    return isDev ? 'easygetapp-client' : split[0];
  };

  const fetchData = useCallback(async () => {
    try {
      const { data } = await getAppTemplateLink({
        installationPage: id,
        pitbullRegistrationId: getPitbullRegistrationId(),
      });
      setLink(data);
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  if (link) {
    return (
      // eslint-disable-next-line react/no-unknown-property
      <iframe allow-scripts="true" className={styles.iframe} src={link} frameBorder="0"></iframe>
    );
  }

  return null;
};

export default Layout;
