import { showNotification } from '@/global';
import { updatePassword } from '@/services/api/profile-settings';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { useIntl, useModel } from '@umijs/max';
import { Form } from 'antd';

import { useGlobalContext } from '@/contexts/global.context';

const EditPasswordModal: React.FC<{
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  fetchUser: () => void;
}> = (props) => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const [form] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const { visible, onVisibleChange, fetchUser } = props;

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        username: currentUser?.username,
        ...values,
      };
      await updatePassword(payload);
      showNotification({
        message: intl.formatMessage({ id: 'notification.password.updated' }),
        type: 'success',
      });
      fetchUser();
      onVisibleChange(false);
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  return (
    <ModalForm
      form={form}
      onFinish={async (v) => handleSubmit(v)}
      title={intl.formatMessage({ id: 'component.change-password' })}
      open={visible}
      width="600px"
      onOpenChange={onVisibleChange}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      submitter={{
        searchConfig: {
          submitText: intl.formatMessage({ id: 'button.save' }),
        },
      }}
      modalProps={{
        maskClosable: false,
        destroyOnClose: true,
      }}
    >
      <ProFormText.Password
        name="oldPassword"
        label={intl.formatMessage({ id: 'component.password.old' })}
        fieldProps={{
          maxLength: 16,
        }}
        rules={[
          { required: true, message: intl.formatMessage({ id: 'message.password.old.required' }) },
        ]}
      ></ProFormText.Password>
      <ProFormText.Password
        name="newPassword"
        label={intl.formatMessage({ id: 'component.password.new' })}
        fieldProps={{
          maxLength: 16,
        }}
        rules={[
          { required: true, message: intl.formatMessage({ id: 'message.password.new.required' }) },
          { min: 8, message: intl.formatMessage({ id: 'message.password.min-max' }) },
          { max: 16 },
        ]}
      ></ProFormText.Password>
      <ProFormText.Password
        name="confirmPassword"
        dependencies={['newPassword']}
        label={intl.formatMessage({ id: 'component.password.confirm' })}
        fieldProps={{
          maxLength: 16,
        }}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'message.password.confirm.required' }),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(intl.formatMessage({ id: 'message.password.mismatch' })),
              );
            },
          }),
        ]}
      ></ProFormText.Password>
    </ModalForm>
  );
};

export default EditPasswordModal;
