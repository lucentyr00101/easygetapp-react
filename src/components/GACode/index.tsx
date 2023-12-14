import { showNotification } from '@/global';
import { UserSettingsTableListItem } from '@/pages/user-settings/data';
import { resetGACode } from '@/services/api/user-settings';
import { InfoCircleFilled } from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Form, Typography } from 'antd';

import styles from './style.less';

const { Text } = Typography;

import { useGlobalContext } from '@/contexts/global.context';

const GACodeModal: React.FC<{
  visible: boolean;
  onVisibleChange: React.Dispatch<React.SetStateAction<boolean>>;
  currentRow: UserSettingsTableListItem;
}> = (props) => {
  const { appMessage } = useGlobalContext();
  const intl = useIntl();
  const { visible, onVisibleChange, currentRow } = props;
  const [form] = Form.useForm();

  const submit = async (values: any) => {
    try {
      const payload = {
        username: currentRow?.username as string,
        code: values.gaCode,
        language: 'English',
      };
      await resetGACode(payload);
      showNotification({
        message: intl.formatMessage({ id: 'notification.ga-code-reset.success' }),
        type: 'success',
      });
      onVisibleChange(false);
    } catch (error: any) {
      appMessage({ type: 'error', apiResponse: error });
    }
  };

  return (
    <ModalForm
      form={form}
      className={styles.gaCodeForm}
      title={
        <>
          <InfoCircleFilled style={{ color: '#E34D59', marginRight: '8px' }} />
          {intl.formatMessage({
            id: 'component.gaCode.title',
          })}
        </>
      }
      width="450px"
      open={visible}
      onOpenChange={onVisibleChange}
      style={{ padding: '10px 0px 0px 24px' }}
      onFinish={async (values) => submit(values)}
      submitter={{
        searchConfig: {
          submitText: intl.formatMessage({ id: 'button.confirm' }),
        },
      }}
      modalProps={{
        maskClosable: false,
        destroyOnClose: true,
      }}
    >
      <Text>
        {intl.formatMessage({
          id: 'component.gaCode.hint',
        })}
      </Text>
      <ProFormText
        name="gaCode"
        label={intl.formatMessage({
          id: 'component.gaCode.enter-ga-code',
        })}
        placeholder={intl.formatMessage({
          id: 'component.gaCode.ga-code',
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'error.ga-code.required' }),
          },
        ]}
      ></ProFormText>
    </ModalForm>
  );
};

export default GACodeModal;
