import { useEffect, useState } from 'react';

import { useApplicationContext } from '@/contexts/application.context';
import { useGlobalContext } from '@/contexts/global.context';
import { confirmDelete } from '@/global';
import { updateApp } from '@/services/api/app-management';
import { CopyOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Input, /** Modal,*/ Typography } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { AppDetailItem } from './data';

const EditAppSettingsModal: React.FC<{
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
}> = (props) => {
  const intl = useIntl();
  const { visible, onVisibleChange } = props;
  const { currentApp, handleGetCurrentAppDetails } = useApplicationContext();
  const { appMessage, installPageBaseURL } = useGlobalContext();

  const { Text } = Typography;

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [appSettings, setAppSettings] = useState<AppDetailItem>({ name: '' });

  const fetchAppDetails = async (id: string) => {
    await handleGetCurrentAppDetails(id);
  };

  // const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
  //   setFileList(newFileList);

  const handleSubmit = async (values: any) => {
    let previousAttachmentLinks: string[] = [];
    const formData = new FormData();
    try {
      const {
        installationPage,
        appId,
        downloadAvailabilityStatus,
        // installationMethod,
        // validityPeriod,
        // downloadStartEndTime,
        // language,
        // showcaseQrCode,
        // password,
      } = values;

      fileList.forEach((v: any) => {
        if (v.originFileObj) {
          formData.append('attachments', v.originFileObj as any);
        } else {
          previousAttachmentLinks.push(v.url);
        }
      });

      const form = {
        id: appSettings.id,
        installationPage,
        appId,
        downloadAvailabilityStatus,
        // installationMethod,
        // validityPeriod,
        // ...(installationMethod === 'Password Installation' && {
        //   password,
        // }),
        // ...(validityPeriod === 'Time Based' && {
        //   downloadStartTime: dayjs(downloadStartEndTime[0]).format('YYYY-MM-DD 00:00:00'),
        //   downloadEndTime: dayjs(downloadStartEndTime[1]).format('YYYY-MM-DD 23:59:59'),
        // }),
        language: appSettings.language,
        // showcaseQrCode,
        // previousAttachmentLinks,
      };

      console.log({ form });

      formData.append(
        'appUpdateParam',
        new Blob([JSON.stringify(form)], { type: 'application/json' }),
      );

      const { data } = await updateApp(formData);
      console.log(appSettings);
      if (appSettings.installationPage !== installationPage && appSettings.isDeployed) {
        confirmDelete({
          title: intl.formatMessage({
            id: `notification.app.redeploy`,
          }),
          okText: intl.formatMessage({ id: 'button.ok' }),
          cancelButtonProps: {
            style: {
              display: 'none',
            },
          },
          onOk: async () => {
            //
          },
        });
      }
      fetchAppDetails(data.id);
      onVisibleChange(false);
      appMessage({ type: 'success', localesId: 'messages.changesAreSaved' });
    } catch (error: any) {
      if (
        values.validityPeriod === 'Time Based' &&
        values.downloadStartEndTime[0] === null &&
        error.response.data.code === 202
      ) {
        appMessage({ type: 'error', localesId: 'messages.downloadStartAndEndTimeRequired' });
      } else {
        appMessage({ type: 'error', apiResponse: error });
      }
    }
  };

  const handleCopy = () => {
    const str = `${installPageBaseURL}${currentApp?.installationPage}`;
    navigator.clipboard.writeText(str);
    appMessage({ type: 'success', localesId: 'copied' });
  };

  useEffect(() => {
    setAppSettings(currentApp);
    const attachments = currentApp?.attachments?.map((val: any) => {
      return {
        uid: val.id,
        name: val.fileOriginName,
        url: val.fileLink,
      };
    });
    setFileList(attachments);
  }, [currentApp]);

  return (
    <ModalForm
      title={intl.formatMessage({
        id: 'component.app.appSettings',
      })}
      layout="horizontal"
      open={visible}
      onVisibleChange={onVisibleChange}
      onFinish={async (values) => {
        await handleSubmit(values);
      }}
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 15 }}
      request={async () => {
        return {
          id: appSettings.id,
          appId: appSettings.appId,
          installationPage: appSettings.installationPage,
          downloadAvailabilityStatus: appSettings.downloadAvailabilityStatus,
        };
      }}
      submitter={{
        resetButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      modalProps={{
        maskClosable: false,
        destroyOnClose: true,
        okText: intl.formatMessage({
          id: 'button.save-info',
        }),
      }}
    >
      <ProFormText
        name="installationPage"
        label={intl.formatMessage({
          id: 'component.app.appInstallationPage',
        })}
        fieldProps={{
          addonAfter: <CopyOutlined style={{ cursor: 'pointer' }} onClick={handleCopy} />,
          addonBefore: (
            <Text style={{ maxWidth: '250px' }} ellipsis>
              {installPageBaseURL}
            </Text>
          ),
        }}
      />
      <ProFormText
        name="appId"
        label={intl.formatMessage({
          id: 'pages.app.appId',
        })}
        disabled
      >
        <Input></Input>
      </ProFormText>
      <ProFormSelect
        name="downloadAvailabilityStatus"
        label={intl.formatMessage({
          id: 'pages.app.download-availability',
        })}
        // initialValue="public"
        valueEnum={{
          Public: intl.formatMessage({
            id: 'pages.app.download-availability-public',
          }),
          Closed: intl.formatMessage({
            id: 'pages.app.download-availability-closed',
          }),
        }}
        // rules={[{ required: true, message: '请选择下载状态!' }]}
      />
    </ModalForm>
  );
};

export default EditAppSettingsModal;
