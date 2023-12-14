import { useGlobalContext } from '@/contexts/global.context';
import { downloadFromUrl } from '@/global';
import type { Details } from '@/pages/download/$id';
import '@/pages/download/style.less';
import { publicVerifyDownload } from '@/services/api/app-management';
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons';
import { history, useIntl, useParams } from '@umijs/max';
import { Button, Divider, Space } from 'antd';
import { FC, useEffect, useState } from 'react';
import CodeModal from './CodeModal';

interface Props {
  details: Details | undefined;
}

const DownloadQR: FC<Props> = ({ details }) => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const [showModal, setShowModal] = useState(false);
  const params = useParams();
  const { id } = params || {};
  const query = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const { specificVersion = 'false', showPass = 'false', showCode = 'false' } = query || {};

  const download = async (versionId: string) => {
    try {
      const data = {
        id: versionId,
      };
      const { data: url } = await publicVerifyDownload(data);
      downloadFromUrl(url);
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  const startDownload = (url: string, versionId: string) => {
    const installMethod: string = details?.installMethod as string;
    const isOpen = installMethod?.toLowerCase() === 'open';
    const isPassword = installMethod?.toLowerCase() === 'password installation';
    const isCode = installMethod?.toLowerCase() === 'code installation';
    if (isOpen) {
      download(versionId);
      return;
    } else if (isPassword) {
      history.push(
        `/download/${id}/?version=${versionId}${
          JSON.parse(specificVersion) ? '&specificVersion=true' : ''
        }&showPass=true`,
      );
    } else if (isCode) {
      history.push(
        `/download/${id}/?version=${versionId}${
          JSON.parse(specificVersion) ? '&specificVersion=true' : ''
        }&showCode=true`,
      );
    }
    setShowModal(true);
  };

  useEffect(() => {
    const showModal = JSON.parse(showPass) || JSON.parse(showCode);
    if (showModal) setShowModal(true);
  }, []);

  return (
    <div className="download__details__qr">
      {details?.showcaseQrCode === 'Yes' && (
        <>
          {(details?.platform?.length as number) > 0 && (
            <p className="download__details__qr__text">
              {intl.formatMessage({ id: 'pages.download.install-qr' })}
            </p>
          )}
          <Space wrap={true} split={<Divider type="vertical" style={{ height: '12em' }} />}>
            {details?.platform.map((platform: any, index: any) => {
              if (platform?.url) {
                return (
                  <div key={index}>
                    <div className="download__details__qr__image">
                      <img width={150} src={platform.url} alt={platform?.name} />
                      <Button
                        block
                        icon={
                          platform?.name === 'Android' ? <AndroidOutlined /> : <AppleOutlined />
                        }
                        type="primary"
                        onClick={() => startDownload(platform?.fileLink, platform?.versionId)}
                      >
                        {intl.formatMessage(
                          { id: 'pages.download.install-platform' },
                          { platform: platform?.name },
                        )}
                      </Button>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </Space>
        </>
      )}
      <CodeModal visible={showModal} onOpenChange={setShowModal} />
    </div>
  );
};

export default DownloadQR;
