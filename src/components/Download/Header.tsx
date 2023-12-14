import type { Details } from '@/pages/download';
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Divider, Space } from 'antd';
import type { FC } from 'react';

interface Props {
  details: Details | undefined;
}

const DownloadHeader: FC<Props> = ({ details }) => {
  const intl = useIntl();

  const notAvailable = <i>{intl.formatMessage({ id: 'message.no-longer-available' })}</i>;

  return (
    <div className="download__details__head">
      <img height={100} width={100} src={details?.icon} alt="" style={{ objectFit: 'contain' }} />
      <p className="download__details__head__text download__details__head__text--name">
        {details?.name}
      </p>
      {details?.downloadAvailabilityStatus === 'Public' && (
        <Space split={!!details?.platform[0]?.name && <Divider type="vertical" />}>
          {details?.platform.map((platform, index) => {
            return (
              <div key={index}>
                {platform?.name?.toLowerCase?.() === 'android' && <AndroidOutlined />}
                {platform?.name?.toLowerCase?.() === 'ios' && <AppleOutlined />}
                {platform?.name && (
                  <span className="download__details__head__text download__details__head__text--platform">
                    {intl.formatMessage(
                      { id: 'pages.download.for-platform-devices' },
                      { platform: platform?.name },
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </Space>
      )}
      {details?.downloadAvailabilityStatus === 'Closed' && notAvailable}
    </div>
  );
};

export default DownloadHeader;
