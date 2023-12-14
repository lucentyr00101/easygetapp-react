import appDefaultImg from '@/assets/application-default-img.svg';
import PageHeaderCard from '@/pages/application/components/PageHeaderCard';
import { CheckCircleFilled, CloudUploadOutlined } from '@ant-design/icons';
import {
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  StepsForm,
} from '@ant-design/pro-components';
import {
  Button,
  FormInstance,
  Image,
  Input,
  message,
  Modal,
  Space,
  Typography,
  UploadFile,
  UploadProps,
} from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import { useRef, useState } from 'react';

import styles from './style.less';

import { useGlobalContext } from '@/contexts/global.context';

type UserAppList = {
  key: string;
  img: string;
  name: string;
  disabled: boolean;
};

const { Title, Text } = Typography;

const MenuHeaderContent: React.FC = () => {
  const formRef = useRef<FormInstance>();
  const [current, setCurrent] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { installPageBaseURL } = useGlobalContext();

  const [publishAppModalVisible, setPublishAppModalVisible] = useState(false);

  const currentUserAppList: Array<UserAppList> = [
    {
      key: '1',
      img: appDefaultImg,
      name: 'Tester Android',
      disabled: false,
    },
    {
      key: '2',
      img: appDefaultImg,
      name: 'Tester IOS',
      disabled: true,
    },
    {
      key: '3',
      img: appDefaultImg,
      name: 'Tester',
      disabled: true,
    },
  ];

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange(info: any) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
        setTimeout(() => {
          setCurrent(1);
        }, 500);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const handleUploadAppForm = () => {
    formRef.current?.validateFields().then((values) => {
      console.log(values);
      setCurrent(2);
    });
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  return (
    <>
      <div className={styles.uploadAppSection}>
        <div className={styles.uploadAppList}>
          {currentUserAppList &&
            currentUserAppList.length > 0 &&
            currentUserAppList.map((appVal: UserAppList) => {
              return (
                <div className={styles.uploadAppItem} key={appVal.key}>
                  <img
                    src={appVal.img}
                    width="33px"
                    className={appVal.disabled ? styles.disabled : ''}
                  />
                  <h3 className={appVal.disabled ? styles.disabled : styles.selected}>
                    {appVal.name}
                  </h3>
                </div>
              );
            })}
        </div>
        <Button
          type="primary"
          onClick={() => {
            setPublishAppModalVisible(true);
          }}
        >
          上传应用
        </Button>
      </div>
      <Modal
        width="800px"
        open={publishAppModalVisible}
        maskClosable={false}
        destroyOnClose={true}
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
        onCancel={() => setPublishAppModalVisible(false)}
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
          <StepsForm.StepForm>
            <Title level={4} style={{ marginTop: '0px' }}>
              发布应用
            </Title>
            <Text>发布应用，仅需两步</Text>
            <Dragger {...props} style={{ padding: '3rem', margin: '1.5rem 0rem' }}>
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">
                点击按钮选择应用的安装包，或拖拽文件到此区域 （支持 ipa 或 apk 文件）
              </p>
            </Dragger>
            <Button
              type="link"
              onClick={() => setCurrent(1)}
              style={{ float: 'right', paddingRight: '8px' }}
            >
              跳过
            </Button>
          </StepsForm.StepForm>
          <StepsForm.StepForm
            formRef={formRef}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            layout="horizontal"
          >
            <PageHeaderCard
              style={{
                marginTop: '1.5rem',
              }}
              extra={
                <Button type="primary" onClick={handleUploadAppForm}>
                  发布应用
                </Button>
              }
              content={{
                id: 1,
                avatar: appDefaultImg,
                name: false,
                desc: () => {
                  return (
                    <>
                      <p>版本: V1.0</p>
                      <p>适用安卓所有设备</p>
                    </>
                  );
                },
              }}
            ></PageHeaderCard>
            <ProFormText
              name="name"
              label="应用名"
              placeholder="输入应用名"
              rules={[{ required: true }]}
            />
            <ProFormText name="appInstallationPage" label="应用页面地址">
              <Input addonBefore={installPageBaseURL} />
            </ProFormText>
            <ProFormSelect
              name="releaseTime"
              label="发布时间"
              initialValue="immediateRelease"
              valueEnum={{
                immediateRelease: '即时发布',
              }}
            />
            <ProFormSelect
              name="installationMethod"
              label="安装方式"
              initialValue="open"
              valueEnum={{
                open: '开启',
                passwordInstallation: '密码安装',
                codeInstallation: '授权码安装',
              }}
            />
            <ProFormText.Password name="password" label="安装密码" />
            <ProFormSelect
              name="validityPeriod"
              label="下载有效期"
              initialValue="longTerm"
              valueEnum={{
                longTerm: '长期有效',
                timeBased: '设置时间',
              }}
            />
            <ProFormCheckbox name="apkSetting" label="APK 设置">
              设置强制更新版本
            </ProFormCheckbox>
            <ProFormTextArea
              name="releaseNotes"
              label="版本说明"
              fieldProps={{ autoSize: { minRows: 3 } }}
            />
            <ProFormTextArea
              name="appInstructions"
              label="应用介绍"
              fieldProps={{ autoSize: { minRows: 3 } }}
            />
            <ProFormUploadButton
              name="upload"
              label="上载应用截图"
              max={10}
              fileList={fileList}
              fieldProps={{
                name: 'file',
                listType: 'picture-card',
              }}
              onChange={handleChange}
              action="/upload.do"
              extra={`App 载图: ${fileList && fileList.length}/10 张`}
            />
          </StepsForm.StepForm>
          <StepsForm.StepForm>
            <Title level={4} style={{ marginTop: '0px' }}>
              Test DPC
            </Title>
            <Space
              align="center"
              direction="vertical"
              style={{ display: 'block', textAlign: 'center' }}
            >
              <Image
                src={appDefaultImg}
                width={100}
                style={{ border: '1px dashed #999999', borderRadius: '10px' }}
              ></Image>
              <Space style={{ textAlign: 'center' }}>
                <CheckCircleFilled style={{ color: '#52C41A' }} />
                <p>您的应用 Test DPC 已经上传成功啦！</p>
              </Space>
              <Space size="middle">
                <Button type="primary">应用管理</Button>
                <Button>查看下载页</Button>
              </Space>
            </Space>
          </StepsForm.StepForm>
        </StepsForm>
      </Modal>
    </>
  );
};

export default MenuHeaderContent;
