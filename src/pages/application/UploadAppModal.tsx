import { useEffect, useRef, useState } from 'react';

import { CheckCircleFilled, CloudUploadOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ProFormSelect,
  ProFormText,
  ProFormUploadDragger,
  StepsForm,
} from '@ant-design/pro-components';
import {
  Button,
  FormInstance,
  Image,
  Modal,
  Space,
  Spin,
  Typography,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';

import PageHeaderCard from './components/PageHeaderCard';

import styles from './style.less';

import { history, useIntl, useModel } from '@umijs/max';

import { useApplicationContext } from '@/contexts/application.context';
import { useGlobalContext } from '@/contexts/global.context';
import { convertFileSize, _refreshToken } from '@/global';
import { uploadApp } from '@/services/api/app-management';

const { Title, Text } = Typography;

interface FileDetails {
  filename: string;
  build: string;
  version: string;
  size: number;
  platform: string;
}

const UploadAppModal: React.FC<{
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTable: () => void;
}> = (props) => {
  const { visible, onVisibleChange, refreshTable } = props;
  const intl = useIntl();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { tabList } = initialState || {};
  const { appMessage, startPoll, stopPoll, installPageBaseURL } = useGlobalContext();
  const { currentAppSubscription, fetchingSubscription } = useApplicationContext();

  // const { Dragger } = Upload;

  const fileFormRef = useRef<FormInstance>();
  const formRef = useRef<FormInstance>();
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(0);
  const [appId, setAppId] = useState(null);
  const [installer, setInstaller] = useState<UploadFile[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [icon, setIcon] = useState<UploadFile[]>([]);
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);

  const generateRandomString = (minLength = 10) => {
    const regex = /[a-zA-Z0-9]/g;
    let result = '';
    while (result.length < minLength) {
      result += String.fromCharCode(Math.floor(Math.random() * 58) + 65);
    }
    return result.match(regex)?.join('');
  };

  const handleUploadAppForm = async () => {
    const values = await formRef.current?.validateFields();
    const { appId, downloadAvailabilityStatus, installationPage, name } = values;
    const form = { appId, downloadAvailabilityStatus, installationPage, name };
    const formData = new FormData();
    const chunkSize: number = 52428800; // 50MB
    const fileKey = generateRandomString();
    let file: any = null;
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
        const data = await uploadApp(formData);
        const { app } = data?.data || {};
        if (numberOfFileChunks > 1 && currentChunk < numberOfFileChunks) {
          createChunk(currentChunk + 1);
        } else {
          setAppId(app?.id);
          setCurrent(2);
          refreshTable();
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

    formData.append('appAddParam', new Blob([JSON.stringify(form)], { type: 'application/json' }));

    if (fileList.length > 0) {
      fileList.forEach((v) => {
        formData.append('attachments', v.originFileObj as any);
      });
    }

    if (icon.length > 0) {
      formData.append('icon', icon[0].originFileObj as any);
    }

    if (installer.length > 0) {
      file = installer[0];
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

  const generateId = () => {
    formRef?.current?.setFieldsValue({
      installationPage: generateRandomString(),
    });
  };

  const uploadInstaller = async (file: File, fileList: UploadFile[]) => {
    try {
      // console.log(currentAppSubscription);
      // console.log(file, fileList);
      const filename = file.name.replace(/\.[^/.]+$/, '');
      const extension = file.name.split('.').pop();
      const allowedExtensions = ['apk', 'ipa'];
      if (!allowedExtensions.includes(extension as string)) {
        fileFormRef?.current?.setFields([
          {
            name: 'dragger',
            errors: [intl.formatMessage({ id: 605 })],
          },
        ]);
        return;
      }
      if (
        file?.size <= currentAppSubscription.maxFileSize
        // (currentAppSubscription.level < 4 && file?.size <= currentAppSubscription.maxFileSize) ||
        // (currentAppSubscription.level >= 4 && file?.size >= currentAppSubscription.minFileSize && file?.size <= currentAppSubscription.maxFileSize)
      ) {
        fileFormRef?.current?.resetFields?.();
        setFileDetails({
          filename,
          build: '1',
          version: '1.0',
          size: file.size,
          platform: extension === 'apk' ? 'Android' : 'iOS',
        });
        setInstaller([...fileList]);
        formRef?.current?.setFieldsValue({
          name: filename.substring(0, 25),
        });
        setCurrent(1);
      } else {
        // console.log('Greater Than 300MB!');
        fileFormRef?.current?.setFields([
          {
            name: 'dragger',
            errors: [intl.formatMessage({ id: 'error.maximum.file-size' })],
          },
        ]);
      }
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
      throw error;
    }
    return false;
  };

  const closeModal = () => {
    fileFormRef?.current?.resetFields?.();
    formRef?.current?.resetFields?.();
    setIcon([]);
    setFileList([]);
    setCurrent(0);
    setFileDetails(null);
    setInstaller([]);
    onVisibleChange(false);
  };

  const iconChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setIcon(newFileList);
  // const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
  //   setFileList(newFileList);
  // const uploadHelp = () => {
  //   const help1 = intl.formatMessage({ id: 'component.app.upload.help-1' });
  //   const help2 = intl.formatMessage({ id: 'component.app.upload.help-2' });
  //   return `${help1}: ${fileList?.length}/10 ${help2}`;
  // };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const getBase64 = (file: any): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const uploadIcon = () => (
    <Upload
      name="uploadIcon"
      accept="image/png, image/jpeg"
      fileList={icon}
      listType="picture-card"
      onChange={iconChange}
      beforeUpload={() => false}
      maxCount={1}
      className={styles['upload-auto-width']}
      onPreview={handlePreview}
    >
      {icon?.length < 1 && <PlusOutlined />}
    </Upload>
  );

  useEffect(() => {
    if (current === 1) {
      generateId();
    }
  }, [current]);

  const isAppNameExistInTabList = (appName: string) =>
    tabList?.some((tab: any) => tab.tab && tab.tab === appName);

  const goToApp = () => {
    const appName = formRef?.current?.getFieldValue('name');
    const url = `/application?id=${appId}&appName=${appName.replace(/\s/g, '%20')}`;
    if (!isAppNameExistInTabList(appName)) {
      setInitialState((s: any) => ({
        ...s,
        tabList: s?.tabList
          ? [
              ...s?.tabList,
              {
                tab: appName,
                // currentTabSideMenu: currentTabSideMenu,
                skipTranslate: true,
                key: url,
                path: url,
              },
            ]
          : [],
      }));
    }
    history.push(url);
    closeModal();
  };

  return (
    <Modal
      width="900px"
      open={visible}
      maskClosable={false}
      closable={!saving}
      okButtonProps={{
        style: {
          display: 'none',
        },
      }}
      cancelButtonProps={{
        style: {
          display: 'none',
        },
      }}
      onCancel={() => closeModal()}
      className={styles.MenuHeaderContentModal}
    >
      <StepsForm
        current={current}
        submitter={{
          render: (props, dom) => {
            if (props.step === 2) {
              return null;
            }
            return dom;
          },
          submitButtonProps: {
            style: {
              // 隐藏重置按钮
              display: 'none',
            },
          },
          resetButtonProps: {
            style: {
              // 隐藏重置按钮
              display: 'none',
            },
          },
        }}
        stepsProps={{
          style: {
            display: 'none',
            width: '100%',
          },
        }}
      >
        <StepsForm.StepForm formRef={fileFormRef}>
          <Title level={4} style={{ marginTop: '0px' }}>
            {intl.formatMessage({ id: 'pages.app.uploadApp' })}
          </Title>
          <Text>{intl.formatMessage({ id: 'component.app.subtitle' })}</Text>
          <Spin spinning={fetchingSubscription}>
            {/* <Dragger
              accept=".apk,.ipa"
              fileList={installer}
              maxCount={1}
              style={{ padding: '3rem', margin: '1.5rem 0rem' }}
              beforeUpload={uploadInstaller}
              onRemove={() => setInstaller([])}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">
                {intl.formatMessage({ id: 'component.app.upload.label' })}
              </p>
            </Dragger> */}
            <ProFormUploadDragger
              name="dragger"
              icon={<CloudUploadOutlined />}
              title={intl.formatMessage(
                { id: 'component.app.upload.label' },
                {
                  fileSize: convertFileSize(currentAppSubscription.maxFileSize, undefined, false),
                },
                // {
                //   fileSize: `
                //     ${currentAppSubscription.level >= 4 ? `${convertFileSize(currentAppSubscription.minFileSize, undefined, false, )} - ` : ''}
                //     ${convertFileSize(currentAppSubscription.maxFileSize, undefined, false)}
                //   `,
                // },
              )}
              description={false}
              fieldProps={{
                name: 'dragger',
                className: styles.appUploader,
                accept: '.apk,.ipa',
                maxCount: 1,
                fileList: installer,
                beforeUpload: uploadInstaller,
                onRemove: () => setInstaller([]),
              }}
            />
            <Button
              type="link"
              onClick={() => {
                setCurrent(1);
                setInstaller([]);
                fileFormRef?.current?.resetFields?.();
              }}
              style={{ float: 'right', paddingRight: '8px' }}
            >
              {intl.formatMessage({ id: 'component.app.skip' })}
            </Button>
          </Spin>
        </StepsForm.StepForm>
        <StepsForm.StepForm
          formRef={formRef}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
        >
          <Spin spinning={saving}>
            <PageHeaderCard
              style={{
                marginTop: '1.5rem',
              }}
              extra={
                <Button type="primary" onClick={handleUploadAppForm} disabled={saving}>
                  {intl.formatMessage({ id: 'component.app.releaseApp' })}
                </Button>
              }
              isAvatar={false}
              content={{
                id: 1,
                uploadComponent: uploadIcon,
                name: false,
                desc: () => {
                  return (
                    <>
                      <p>
                        {intl.formatMessage({ id: 'pages.app.version' })}:{' '}
                        {fileDetails?.version || '-'}
                      </p>
                      <p>
                        {intl.formatMessage({ id: 'pages.app.size' })}:{' '}
                        {fileDetails?.size
                          ? convertFileSize(fileDetails?.size, undefined, false)
                          : '-'}
                      </p>
                      <p>
                        {fileDetails?.platform
                          ? `${intl.formatMessage({ id: 'pages.app.applicable-to-all' })} ${
                              fileDetails?.platform
                            } ${intl.formatMessage({ id: 'pages.app.devices' })}`
                          : '-'}
                      </p>
                    </>
                  );
                },
              }}
            />
            <ProFormText
              name="name"
              label={intl.formatMessage({ id: 'pages.app.appName' })}
              rules={[{ required: true }]}
              fieldProps={{
                maxLength: 25,
              }}
            />
            <ProFormText
              name="installationPage"
              label={intl.formatMessage({ id: 'component.app.appInstallationPage' })}
              fieldProps={{
                addonBefore: (
                  <Text copyable style={{ maxWidth: '250px' }} ellipsis>
                    {installPageBaseURL}
                  </Text>
                ),
              }}
            />
            <ProFormText
              name="appId"
              label={intl.formatMessage({ id: 'pages.app.appId' })}
              fieldProps={{
                maxLength: 25,
              }}
            />
            <ProFormSelect
              name="downloadAvailabilityStatus"
              label={intl.formatMessage({ id: 'pages.app.download-availability' })}
              initialValue="Public"
              valueEnum={{
                Public: intl.formatMessage({
                  id: 'pages.app.download-availability-public',
                }),
                Closed: intl.formatMessage({
                  id: 'pages.app.download-availability-closed',
                }),
              }}
            />
          </Spin>
        </StepsForm.StepForm>
        <StepsForm.StepForm>
          <Title level={4} style={{ marginTop: '0px' }}>
            {formRef?.current?.getFieldValue('name')}
          </Title>
          <Space
            align="center"
            direction="vertical"
            style={{ display: 'block', textAlign: 'center' }}
          >
            {icon?.[0]?.thumbUrl && (
              <Image
                src={icon?.[0]?.thumbUrl}
                width={100}
                style={{ border: '1px dashed #999999', borderRadius: '10px' }}
              />
            )}
            <Space style={{ textAlign: 'center' }}>
              <CheckCircleFilled style={{ color: '#52C41A' }} />
              <p>
                {intl.formatMessage(
                  { id: 'component.app.confirm-modal.text' },
                  { name: formRef?.current?.getFieldValue('name') },
                )}
              </p>
            </Space>
            <Space size="middle">
              <Button type="primary" onClick={() => goToApp()}>
                {intl.formatMessage({ id: 'component.app.confirm-modal.app-dashboard' })}
              </Button>
            </Space>
          </Space>
        </StepsForm.StepForm>
        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </StepsForm>
    </Modal>
  );
};

export default UploadAppModal;
