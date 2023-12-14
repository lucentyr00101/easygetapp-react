import { useApplicationContext } from '@/contexts/application.context';
import { useGlobalContext } from '@/contexts/global.context';
import { convertFileSize, _refreshToken } from '@/global';
import { APP_OS_CODE, APP_STATUS_CODE } from '@/pages/utils/dictionary.enum';
import { addVersion, updateVersion } from '@/services/api/app-management';
import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Spin, UploadFile, UploadProps } from 'antd';
import { useEffect, useState } from 'react';
import { VersionTableListItem } from './data';

const AddEditVersionModal: React.FC<{
  visible: boolean;
  appOS: React.Key;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  currentRow?: VersionTableListItem;
  close: () => void;
  refreshTable: () => void;
}> = (props) => {
  const { visible, onVisibleChange, currentRow, appOS, close, refreshTable } = props;
  const intl = useIntl();
  const { appMessage, startPoll, stopPoll } = useGlobalContext();
  const { currentAppSubscription, currentApp, fetchingSubscription } = useApplicationContext();
  const [saving, setSaving] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const closeModal = () => {
    close();
    setFileList([]);
  };

  const generateRandomString = (minLength = 10) => {
    const regex = /[a-zA-Z0-9]/g;
    let result = '';
    while (result.length < minLength) {
      result += String.fromCharCode(Math.floor(Math.random() * 58) + 65);
    }
    return result.match(regex)?.join('');
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const handleSubmit = async (values: any) => {
    const { upload, forceUpdate, latestVersion } = values || {};
    const form = {
      ...values,
      ...(currentRow && { id: currentRow?.id }),
      appId: currentApp?.id,
      forceUpdate: forceUpdate ? 'Enable' : 'Disable',
      latestVersion: latestVersion === true ? 'Yes' : 'No',
    };
    const formData = new FormData();
    const chunkSize: number = 52428800; // 50MB
    const fileKey = generateRandomString();
    const file = upload?.[0].originFileObj;
    let chunkStart: number = 0;
    let numberOfFileChunks: number = 0;

    const createChunk = (chunkCounter: any = 1) => {
      formData.delete('file');
      formData.delete('chunkFileParam');
      const chunkEnd = Math.min(chunkStart + chunkSize, file.size);
      const chunk = file.slice(chunkStart, chunkEnd);
      const chunkData = {
        chunks: numberOfFileChunks,
        chunk: chunkCounter - 1,
        fileName: file.name,
        key: fileKey,
      };
      formData.append('file', chunk, `${file.name}_${String(chunkCounter).padStart(2, '0')}`);
      formData.append(
        'chunkFileParam',
        new Blob([JSON.stringify(chunkData)], { type: 'application/json' }),
      );
      // console.log('Number Of Chunks: ', numberOfFileChunks);
      // console.log('Created Chunk: ', chunkCounter);
      // console.log({ chunkStart, chunkEnd, chunk });
      // console.log(`I created a chunk of file ${chunkStart} - ${chunkEnd}`);
      // console.log('added file:', `${file.name}_${String(chunkCounter).padStart(2, '0')}`);
      chunkStart = chunkEnd;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      requestAPI(chunkCounter);
    };

    const requestAPI = async (currentChunk: number = 1) => {
      try {
        if (!saving) {
          setSaving(true);
        }
        if (currentChunk === 1) {
          stopPoll();
          await _refreshToken();
          startPoll();
        }
        if (currentRow) {
          await updateVersion(formData);
        } else {
          await addVersion(formData);
        }
        if (numberOfFileChunks > 1 && currentChunk < numberOfFileChunks) {
          createChunk(currentChunk + 1);
        } else {
          appMessage({
            type: 'success',
            localesId: currentRow
              ? 'notification.app.version.updated'
              : 'notification.app.version.added',
          });
          refreshTable();
          closeModal();
          setSaving(false);
          // startPoll();
        }
      } catch (error: any) {
        // console.log(error);
        appMessage({
          type: 'error',
          ...(/^105$/gi.test(error?.response?.data?.code)
            ? { localesId: 'error.saving' }
            : { apiResponse: error }),
        });
        setSaving(false);
        // startPoll();
      }
    };

    formData.append(
      currentRow ? 'appVersionUpdateParam' : 'appVersionAddParam',
      new Blob([JSON.stringify(form)], { type: 'application/json' }),
    );

    if (file) {
      numberOfFileChunks = Math.ceil(file.size / chunkSize);
      if (numberOfFileChunks === 1) {
        formData.append('file', file);
      }
    }

    if (numberOfFileChunks > 1) {
      createChunk(1);
    } else {
      requestAPI();
    }
  };

  const generateFileList = (appFile: any) => {
    const file = {
      uid: -1,
      name: appFile?.fileName,
      status: 'done',
      url: appFile?.fileLink,
    };
    setFileList([file as any]);
  };

  useEffect(() => {
    if (visible && !!currentRow?.appFile) {
      generateFileList(currentRow?.appFile);
    }
  }, [visible]);

  return (
    <ModalForm
      title={
        currentRow === undefined
          ? intl.formatMessage({ id: 'component.app.add-version' })
          : intl.formatMessage({ id: 'component.app.edit-version' })
      }
      open={visible}
      layout="horizontal"
      onFinish={async (v) => handleSubmit(v)}
      disabled={fetchingSubscription || saving}
      onOpenChange={onVisibleChange}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      modalProps={{
        maskClosable: false,
        closable: !saving,
        destroyOnClose: true,
        onCancel: () => closeModal(),
        okText: intl.formatMessage({ id: 'button.save' }),
      }}
      initialValues={{
        operatingSystem: appOS,
        versionNumber: currentRow?.versionNumber,
        buildNumber: currentRow?.buildNumber,
        versionStatus: currentRow?.versionStatus,
        description: currentRow?.description,
        superDistributionLink: currentRow?.superDistributionLink,
        forceUpdate: currentRow?.forceUpdate === 'Enable',
        latestVersion: currentRow?.latestVersion === 'Yes',
      }}
    >
      <Spin spinning={fetchingSubscription || saving}>
        <ProFormText
          name="operatingSystem"
          label={intl.formatMessage({ id: 'pages.app.operating-system' })}
          readonly
        />
        <ProFormDigit
          fieldProps={{
            controls: false,
            maxLength: 10,
            min: 1,
          }}
          name="versionNumber"
          label={intl.formatMessage({ id: 'pages.app.version' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'error.version-number.required' }),
            },
          ]}
        />
        <ProFormDigit
          fieldProps={{
            controls: false,
            maxLength: 10,
            min: 1,
          }}
          name="buildNumber"
          label={intl.formatMessage({ id: 'pages.app.build-number' })}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'error.build-number.required' }) },
          ]}
        />

        {appOS === APP_OS_CODE.IOS && (
          <ProFormText
            name="superDistributionLink"
            label={intl.formatMessage({ id: 'component.app.sdl' })}
            fieldProps={{
              maxLength: 100,
            }}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'error.super-distribution-link.required' }),
              },
            ]}
          />
        )}

        <ProFormUploadButton
          name="upload"
          label={
            appOS === APP_OS_CODE.ANDROID
              ? intl.formatMessage({ id: 'component.app.upload-apk' })
              : intl.formatMessage({ id: 'component.app.upload-ipa' })
          }
          max={1}
          initialValue={fileList}
          fileList={fileList}
          fieldProps={{
            name: 'file',
            listType: 'picture-card',
            beforeUpload: () => false,
          }}
          accept={appOS === APP_OS_CODE.ANDROID ? '.apk' : '.ipa'}
          onChange={handleChange}
          icon={<PlusOutlined />}
          title={false}
          addonAfter={intl.formatMessage(
            { id: 'component.app.upload.label' },
            {
              fileSize: convertFileSize(currentAppSubscription.maxFileSize, undefined, false),
            },
            // {
            //   fileSize: `
            //     ${currentAppSubscription.level >= 4 ? `${convertFileSize(currentAppSubscription.minFileSize, undefined, false)} - ` : ''}
            //     ${convertFileSize(currentAppSubscription.maxFileSize, undefined, false)}
            //   `,
            // },
          )}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'error.file.required' }) },
            {
              validator: (_, value: any) => {
                return !value?.[0] ||
                  (currentRow && currentRow?.appFile?.fileLink === value?.[0]?.url) ||
                  value?.[0]?.size <= currentAppSubscription.maxFileSize
                  ? // (currentAppSubscription.level < 4 && value?.[0]?.size <= currentAppSubscription.maxFileSize) ||
                    // (currentAppSubscription.level >= 4 && value?.[0]?.size >= currentAppSubscription.minFileSize && value?.[0]?.size <= currentAppSubscription.maxFileSize)
                    Promise.resolve()
                  : Promise.reject(
                      new Error(intl.formatMessage({ id: 'error.maximum.file-size' })),
                    );
              },
            },
          ]}
        />

        {appOS === APP_OS_CODE.ANDROID && (
          <ProFormCheckbox
            name="forceUpdate"
            label={intl.formatMessage({ id: 'component.app.force-update' })}
          >
            {intl.formatMessage({ id: 'dropdown.select.enable' })}
          </ProFormCheckbox>
        )}
        <ProFormCheckbox
          name="latestVersion"
          label={intl.formatMessage({ id: 'pages.version.latestVersion' })}
        >
          {intl.formatMessage({ id: 'pages.version.yes' })}
        </ProFormCheckbox>
        <ProFormSelect
          name="versionStatus"
          label={intl.formatMessage({ id: 'pages.common.status' })}
          initialValue={APP_STATUS_CODE.PUBLISH}
          valueEnum={{
            [APP_STATUS_CODE.PUBLISH]: intl.formatMessage({ id: 'dropdown.select.published' }),
            [APP_STATUS_CODE.ARCHIVE]: intl.formatMessage({ id: 'dropdown.select.archived' }),
          }}
          rules={[{ required: true, message: intl.formatMessage({ id: 'error.status.required' }) }]}
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({ id: 'pages.searchTable.titleDesc' })}
          fieldProps={{
            autoSize: { minRows: 3 },
            maxLength: 100,
          }}
        />
      </Spin>
    </ModalForm>
  );
};

export default AddEditVersionModal;
