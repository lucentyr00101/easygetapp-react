import type { Details, Version } from '@/pages/download';
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons';
import { useIntl, useParams } from '@umijs/max';
import { Button, List, Typography } from 'antd';
import type { FC } from 'react';
import './versionHistory.less';

const { Title } = Typography;

interface Props {
  details: Details | undefined;
}

const VersionHistory: FC<Props> = ({ details }) => {
  const intl = useIntl();
  const params = useParams();
  const { id } = params || {};
  const query = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const { specificVersion = 'false' } = query || {};

  const handleClick = (version: Version) => {
    const { versionId } = version;
    const installMethod: string = details?.installMethod as string;
    const isOpen = installMethod?.toLowerCase() === 'open';
    const isPassword = installMethod?.toLowerCase() === 'password installation';
    const isCode = installMethod?.toLowerCase() === 'code installation';
    if (isOpen) {
      window.location.href = `/download/${id}/?version=${versionId}${
        JSON.parse(specificVersion) ? '&specificVersion=true' : ''
      }`;
    } else if (isPassword) {
      window.location.href = `/download/${id}/?version=${versionId}${
        JSON.parse(specificVersion) ? '&specificVersion=true' : ''
      }&showPass=true`;
    } else if (isCode) {
      window.location.href = `/download/${id}/?version=${versionId}${
        JSON.parse(specificVersion) ? '&specificVersion=true' : ''
      }&showCode=true`;
    }
  };

  return (
    <div className="download__version-history">
      <Title level={3}>{intl.formatMessage({ id: 'pages.download.version-history' })}</Title>
      <List
        className="version-list"
        dataSource={details?.versionHistory}
        renderItem={(item: Details) => (
          <List.Item onClick={() => handleClick(item)}>
            <div
              style={{
                display: 'flex',
                gap: '5px',
                alignItems: 'space-between',
                width: '100%',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', gap: '5px' }}>
                {item?.isNew && (
                  <Button size="small" type="primary">
                    {intl.formatMessage({ id: 'pages.download.new' })}
                  </Button>
                )}
                {item?.platform?.toLowerCase() === 'android' && <AndroidOutlined />}
                {item?.platform?.toLowerCase() === 'ios' && <AppleOutlined />}
                {item?.versionNumber}
              </div>
              <span style={{ flexGrow: '1', textAlign: 'right' }}>{item?.date}</span>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default VersionHistory;
