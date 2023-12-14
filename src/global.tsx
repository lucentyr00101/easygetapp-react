import { ExclamationCircleFilled } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, message, Modal, notification } from 'antd';
import moment from 'moment';
import React from 'react';
import Cookies from 'universal-cookie';
import defaultSettings from '../config/defaultSettings';
import { refreshToken } from './services/ant-design-pro/api';

const { pwa } = defaultSettings;
const isHttps = document.location.protocol === 'https:';
const cookies = new Cookies();
const { confirm } = Modal;

export const confirmDelete = ({
  title,
  icon = <ExclamationCircleFilled />,
  okText,
  okButtonProps,
  onOk,
  cancelText,
  cancelButtonProps,
  onCancel,
}: {
  title: string;
  icon?: React.ReactNode;
  okText?: string;
  okButtonProps?: any;
  onOk: () => Promise<void>;
  cancelText?: string;
  cancelButtonProps?: any;
  onCancel?: () => void;
}) => {
  confirm({ title, icon, okButtonProps, okText, onOk, cancelText, cancelButtonProps, onCancel });
};

export const statusColorMap = (value: string) => {
  const map = {
    Publish: 'green',
    Archive: 'gray',
    Expired: 'red',
    Invalid: 'yellow',
  };
  return map[value as never];
};

export const downloadFromUrl = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const downloadFile = (data: any, filename: string = 'data') => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const convertFileSize = (
  bytes: number,
  decimals: number = 2,
  isKiloBytes: boolean = true,
) => {
  if (!+bytes) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))}${sizes[i + (isKiloBytes ? 1 : 0)]}`;
};

export const clearCache = () => {
  // remove all caches
  if (window.caches) {
    console.warn('[Clearing caches]');
    caches
      .keys()
      .then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      })
      .catch((e) => console.log(e));
  }
};

export const showNotification = ({ message, type }: any) => {
  notification.open({
    message,
    type,
  });
};

export const removeTokens = () => {
  clearCache();
  cookies.remove('auth_token_refresh', { path: '/' });
  cookies.remove('auth_token', { path: '/' });
};

export const setTokens = (
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  refreshExpiresIn: number,
) => {
  const authTokenExp = moment().add(expiresIn, 'seconds').format('YYYY-MM-DD HH:mm:ss');
  const authTokenRefreshExp = moment()
    .add(refreshExpiresIn, 'seconds')
    .format('YYYY-MM-DD HH:mm:ss');
  cookies.set('auth_token', accessToken, { path: '/', expires: new Date(authTokenExp) });
  cookies.set('auth_token_refresh', refreshToken, {
    path: '/',
    expires: new Date(authTokenRefreshExp),
  });
};

export const _refreshToken = async () => {
  try {
    const authTokenRefresh = cookies.get('auth_token_refresh');
    const { data } = await refreshToken(authTokenRefresh);
    const { accessToken, refreshToken: _refreshToken, expiresIn, refreshExpiresIn } = data;
    setTokens(accessToken, _refreshToken, expiresIn, refreshExpiresIn);
  } catch (e) {}
};

// if pwa is true
if (pwa) {
  // Notify user if offline now
  window.addEventListener('sw.offline', () => {
    message.warning(useIntl().formatMessage({ id: 'app.pwa.offline' }));
  });

  // Pop up a prompt on the page asking the user if they want to use the latest version
  window.addEventListener('sw.updated', (event: Event) => {
    const e = event as CustomEvent;
    const reloadSW = async () => {
      // Check if there is sw whose state is waiting in ServiceWorkerRegistration
      // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
      const worker = e.detail && e.detail.waiting;
      if (!worker) {
        return true;
      }
      // Send skip-waiting event to waiting SW with MessageChannel
      await new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (msgEvent) => {
          if (msgEvent.data.error) {
            reject(msgEvent.data.error);
          } else {
            resolve(msgEvent.data);
          }
        };
        worker.postMessage({ type: 'skip-waiting' }, [channel.port2]);
      });

      clearCache();
      window.location.reload();
      return true;
    };
    const key = `open${Date.now()}`;
    const btn = (
      <Button
        type="primary"
        onClick={() => {
          notification.destroy(key);
          reloadSW();
        }}
      >
        {useIntl().formatMessage({ id: 'app.pwa.serviceworker.updated.ok' })}
      </Button>
    );
    notification.open({
      message: useIntl().formatMessage({ id: 'app.pwa.serviceworker.updated' }),
      description: useIntl().formatMessage({ id: 'app.pwa.serviceworker.updated.hint' }),
      btn,
      key,
      onClose: async () => null,
    });
  });
} else if ('serviceWorker' in navigator && isHttps) {
  // unregister service worker
  const { serviceWorker } = navigator;
  if (serviceWorker.getRegistrations) {
    serviceWorker.getRegistrations().then((sws) => {
      sws.forEach((sw) => {
        sw.unregister();
      });
    });
  }
  serviceWorker.getRegistration().then((sw) => {
    if (sw) sw.unregister();
  });

  clearCache();
}
