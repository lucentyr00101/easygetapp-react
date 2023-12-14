import { convertFileSize } from '@/global';
import type { Details } from '@/pages/download';
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons';
import type { ProDescriptionsActionType } from '@ant-design/pro-components';
import { ProDescriptions } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Divider, Space, Typography } from 'antd';
import type { FC } from 'react';
import { useRef } from 'react';

const { Title } = Typography;

interface Props {
  details: Details | undefined;
}

const DownloadQR: FC<Props> = ({ details }) => {
  const actionRef = useRef<ProDescriptionsActionType>();

  const intl = useIntl();

  const columns = [
    {
      title: intl.formatMessage({ id: 'pages.download.size' }),
      dataIndex: 'size',
      render: (text: any, record: Details) => {
        return (
          <Space split={<Divider type="vertical" />}>
            {record?.platform?.map((platform: any, index: any) => {
              return (
                <div key={index}>
                  {platform?.name.toLowerCase() === 'android' && (
                    <AndroidOutlined style={{ marginRight: '5px' }} />
                  )}
                  {platform?.name.toLowerCase() === 'ios' && (
                    <AppleOutlined style={{ marginRight: '5px' }} />
                  )}
                  {convertFileSize(platform.size || 0)}
                </div>
              );
            })}
          </Space>
        );
      },
    },
    { title: intl.formatMessage({ id: 'pages.download.updated-time' }), dataIndex: 'updatedTime' },
    {
      title: intl.formatMessage({ id: 'pages.download.version' }),
      dataIndex: 'version',
      render: (text: any, record: Details) => {
        return (
          <Space split={<Divider type="vertical" />}>
            {record?.platform?.map((platform: any, index: any) => {
              return (
                <div key={index}>
                  {platform?.name.toLowerCase() === 'android' && (
                    <AndroidOutlined style={{ marginRight: '5px' }} />
                  )}
                  {platform?.name.toLowerCase() === 'ios' && (
                    <AppleOutlined style={{ marginRight: '5px' }} />
                  )}
                  {platform?.versionNumber}
                </div>
              );
            })}
          </Space>
        );
      },
    },
  ];

  return (
    <ProDescriptions
      className="download__app-info"
      column={2}
      dataSource={details}
      actionRef={actionRef}
      columns={columns}
      layout="vertical"
      title={<Title level={3}>{intl.formatMessage({ id: 'pages.download.app-info' })}</Title>}
    />
  );
};

export default DownloadQR;
