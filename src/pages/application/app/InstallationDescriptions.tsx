import { useIntl } from '@umijs/max';
import { useEffect, useState } from 'react';

import { CheckCircleOutlined, CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Divider, Input, notification, Space, Tooltip } from 'antd';

// import appDefaultImg from '@/assets/application-default-img.svg';
// import PageHeaderCard from './components/PageHeaderCard';

import { useApplicationContext } from '@/contexts/application.context';
import CodeInstallationModal from './CodeInstallationModal';
import { AppDetailItem } from './data';
import EditAppIntroDescModal from './EditAppIntroDescModal';
import EditAppSettingsModal from './EditAppSettingsModal';
import styles from './style.less';

const InstallationDescriptions: React.FC = () => {
  const intl = useIntl();
  const { currentApp } = useApplicationContext();

  const [appDetails, setAppDetails] = useState<AppDetailItem>({ name: '' });
  const [editAppSettingsModalVisible, setEditAppSettingsModalVisible] = useState<boolean>(false);
  const [editAppIntroDescModalVisible, setEditAppIntroDescModalVisible] = useState<boolean>(false);
  const [codeInstallationModalVisible, setCodeInstallationModalVisible] = useState<boolean>(false);

  const copyable = () => {
    navigator.clipboard.writeText(appDetails.installationPageFullLink || '');
    notification.success({
      icon: <CheckCircleOutlined></CheckCircleOutlined>,
      style: { color: '#52C41A' },
      message: intl.formatMessage({ id: 'notification.copy' }),
    });
  };

  const handleAppDetailsChange = (event: any) => {
    const { name, value } = event.target;
    setAppDetails((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  useEffect(() => {
    setAppDetails(currentApp);
  }, [currentApp]);

  return (
    <Card>
      {/* <PageHeaderCard
        content={{
          id: 1,
          avatar: appDefaultImg,
          name: 'Tester Android',
          desc: () => {
            return (
              <>
                <p>Platform : Android</p>
                <p>Package ID : Tester Android</p>
                <p>版本: V1.0</p>
              </>
            );
          },
        }}
      /> */}

      <Descriptions
        title={intl.formatMessage({
          id: 'pages.app.installation-page',
          defaultMessage: 'Installation Page',
        })}
        column={5}
        extra={
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditAppSettingsModalVisible(true);
            }}
          >
            {intl.formatMessage({
              id: 'button.edit',
              defaultMessage: 'Edit',
            })}
          </Button>
        }
        className={styles.installationPage}
      >
        {appDetails?.isDeployed && (
          <Descriptions.Item span={24}>
            <div>
              <img src={appDetails?.downloadLinkQrCode?.fileLink} width={180} />
              <div>
                <Space size="small" align="center">
                  <span>
                    {intl.formatMessage({
                      id: 'pages.app.download-link',
                      defaultMessage: 'Download Link',
                    })}
                  </span>
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'pages.app.download-link-tooltip',
                    })}
                  >
                    <QuestionCircleOutlined style={{ fontSize: '10px' }}></QuestionCircleOutlined>
                  </Tooltip>
                  <span>:</span>
                </Space>
                <Input.Group style={{ display: 'flex' }}>
                  <Input
                    name="installationPage"
                    value={appDetails.installationPageFullLink}
                    onChange={handleAppDetailsChange}
                    style={{ width: '280px' }}
                  />
                  <Button icon={<CopyOutlined />} onClick={copyable} />
                </Input.Group>
              </div>
            </div>
          </Descriptions.Item>
        )}
        <Descriptions.Item
          label={intl.formatMessage({
            id: 'pages.app.app-language',
            defaultMessage: 'App Language',
          })}
          labelStyle={{ paddingBottom: '16px' }}
          contentStyle={{ opacity: 0.5 }}
          span={2}
          style={{ margin: '0', padding: '0' }}
        >
          {appDetails.language &&
            intl.formatMessage({
              id: `pages.app.app-language-${appDetails.language.toLowerCase()}`,
            })}
        </Descriptions.Item>
        {/* <Descriptions.Item
          label={intl.formatMessage({
            id: 'pages.app.enable-qr-code',
            defaultMessage: 'Enable QR Code',
          })}
          labelStyle={{ display: 'block', paddingBottom: '16px' }}
          contentStyle={{ opacity: 0.5 }}
        >
          {appDetails.showcaseQrCode &&
            intl.formatMessage({
              id: `pages.app.enable-qr-code-${appDetails.showcaseQrCode.toLowerCase()}`,
            })}
        </Descriptions.Item> */}
      </Descriptions>

      <Divider />

      <Descriptions
        title={intl.formatMessage({
          id: 'pages.app.installation-settings',
          defaultMessage: 'Installation Settings',
        })}
        layout="horizontal"
        className={styles.installationSettings}
        column={5}
      >
        <Descriptions.Item
          label={intl.formatMessage({
            id: 'pages.app.download-availability',
            defaultMessage: 'Download Availability',
          })}
          span={2}
        >
          <span style={{ color: '#00A870', fontWeight: 700 }}>
            {appDetails.downloadAvailabilityStatus &&
              intl.formatMessage({
                id: `pages.app.download-availability-${appDetails.downloadAvailabilityStatus.toLowerCase()}`,
              })}
          </span>
        </Descriptions.Item>
        {/* <Descriptions.Item
          label={intl.formatMessage({
            id: 'pages.app.expiry-date',
            defaultMessage: 'Expiry Date',
          })}
          contentStyle={{ opacity: 0.5 }}
          span={2}
        >
          {appDetails.expiryDate}
        </Descriptions.Item> */}
        {/* <Descriptions.Item
          label={intl.formatMessage({
            id: 'pages.app.app-Instructions',
            defaultMessage: 'App Instructions',
          })}
          span={1}
        >
          <Button
            type="link"
            size="small"
            className="linkButton"
            onClick={() => {
              setEditAppIntroDescModalVisible(true);
            }}
          >
            {intl.formatMessage({
              id: 'button.edit',
              defaultMessage: 'Edit',
            })}
          </Button>
        </Descriptions.Item> */}
        {/* <Descriptions.Item
          label={intl.formatMessage({
            id: 'pages.app.validity-period',
            defaultMessage: 'Validity Period',
          })}
          contentStyle={{ opacity: 0.5 }}
          span={2}
        >
          {appDetails.validityPeriod &&
            intl.formatMessage({
              id: `pages.app.validity-period-${appDetails.validityPeriod.toLowerCase()}`,
            })}
        </Descriptions.Item> */}
        {/* <Descriptions.Item
          label={intl.formatMessage({
            id: 'pages.app.installation-method',
            defaultMessage: 'Installation Method',
          })}
          span={2}
        >
          <Button
            type="link"
            size="small"
            className="linkButton"
            disabled={appDetails?.installationMethod?.toLowerCase() !== 'code installation'}
            onClick={() => {
              setCodeInstallationModalVisible(true);
            }}
          >
            {intl.formatMessage({
              id: `pages.app.installation-method-${appDetails?.installationMethod}`,
            })}
          </Button>
        </Descriptions.Item> */}
      </Descriptions>
      <EditAppSettingsModal
        visible={editAppSettingsModalVisible}
        onVisibleChange={setEditAppSettingsModalVisible}
      ></EditAppSettingsModal>
      <EditAppIntroDescModal
        visible={editAppIntroDescModalVisible}
        onVisibleChange={setEditAppIntroDescModalVisible}
        app={appDetails}
      ></EditAppIntroDescModal>
      <CodeInstallationModal
        visible={codeInstallationModalVisible}
        onVisibleChange={setCodeInstallationModalVisible}
        appDetail={appDetails}
      ></CodeInstallationModal>
    </Card>
  );
};

export default InstallationDescriptions;
