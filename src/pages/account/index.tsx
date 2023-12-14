import { useEffect, useState } from 'react';

import GACodeModal from '@/components/GACode';
import { fetchUserDetail } from '@/services/api/profile-settings';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { useAccess, useIntl, useModel } from '@umijs/max';
import { Button, Card, Form } from 'antd';
import EditPasswordModal from './EditPasswordModal';

import { useGlobalContext } from '@/contexts/global.context';

const Account: React.FC = () => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const [form] = Form.useForm();
  const access: any = useAccess();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const [editPasswordModalVisible, setEditPasswordModalVisible] = useState<boolean>(false);
  const [editGACodeModalVisible, setEditGACodeModalVisible] = useState<boolean>(false);

  const fetchUser = async () => {
    try {
      const payload = {
        username: currentUser?.username as string,
      };
      const { data } = await fetchUserDetail(payload);
      const { password } = data;
      form.setFieldsValue({
        password,
      });
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Card title={intl.formatMessage({ id: 'pages.account.profile-settings' })}>
      <ProForm
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        submitter={{
          resetButtonProps: {
            style: {
              display: 'none',
            },
          },
          submitButtonProps: {
            style: {
              display: 'none',
            },
          },
        }}
        initialValues={{
          username: currentUser?.username,
          gaCode: '',
        }}
      >
        <ProFormText
          name="username"
          label={intl.formatMessage({ id: 'pages.userSetting.username' })}
          readonly
        />
        <ProFormText.Password
          name="password"
          label={intl.formatMessage({ id: 'pages.account.password' })}
          addonAfter={
            // <Access accessible={access?.Profile?.children?.ChangePassword?.access || false}>
            <Button
              type="primary"
              onClick={() => {
                if (!!access?.Profile?.children?.ChangePassword?.access) {
                  setEditPasswordModalVisible(true);
                }
              }}
              disabled={!access?.Profile?.children?.ChangePassword?.access}
            >
              {intl.formatMessage({ id: 'pages.account.change-password' })}
            </Button>
            // </Access>
          }
        />
        {/* <Access accessible={access?.Profile?.children?.ResetGACode?.access || false}> */}
        <ProFormText
          label={intl.formatMessage({ id: 'pages.account.ga-code' })}
          name="gaCode"
          readonly
        >
          <Button
            type="primary"
            onClick={() => {
              if (!!access?.Profile?.children?.ResetGACode?.access) {
                setEditGACodeModalVisible(true);
              }
            }}
            disabled={!access?.Profile?.children?.ResetGACode?.access}
          >
            {intl.formatMessage({ id: 'button.reset-ga-code' })}
          </Button>
        </ProFormText>
        {/* </Access> */}
      </ProForm>
      <EditPasswordModal
        fetchUser={fetchUser}
        visible={editPasswordModalVisible}
        onVisibleChange={setEditPasswordModalVisible}
      ></EditPasswordModal>
      <GACodeModal
        currentRow={currentUser as any}
        visible={editGACodeModalVisible}
        onVisibleChange={setEditGACodeModalVisible}
      ></GACodeModal>
    </Card>
  );
};

export default Account;
